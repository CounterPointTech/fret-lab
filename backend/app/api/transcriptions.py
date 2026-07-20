"""Transcription files (Guitar Pro / MusicXML / alphaTex) per song: upload,
list, sync-settings update, delete.

Files live under media/{videoId}/transcriptions/ with a sanitized unique
filename; DB rows store the media_root-relative path plus the manual
audio-sync model (bpm + offset) that the tab viewer persists.
"""

import logging
import re
import uuid

from fastapi import APIRouter, HTTPException, Request, UploadFile
from fastapi import Path as PathParam
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.config import settings
from app.db.models import Job, Song, Stem, Transcription
from app.db.session import db_session
from app.pipeline.fret_assign import TUNINGS

logger = logging.getLogger("fretlab.api.transcriptions")

router = APIRouter(prefix="/api")

VIDEO_ID_PATTERN = r"^[A-Za-z0-9_-]{5,20}$"

# extension -> kind; the only formats the AlphaTab importer handles for us
ALLOWED_EXTENSIONS = {
    "gp": "guitarpro",
    "gp3": "guitarpro",
    "gp4": "guitarpro",
    "gp5": "guitarpro",
    "gpx": "guitarpro",
    "musicxml": "musicxml",
    "mxl": "musicxml",
    "xml": "musicxml",
    "alphatex": "alphatex",
    "atex": "alphatex",
}

MAX_UPLOAD_BYTES = 25 * 1024 * 1024


def _split_name(filename: str) -> tuple[str, str]:
    """Return (stem, extension-lowercase) of an uploaded filename."""
    base = filename.replace("\\", "/").rsplit("/", 1)[-1]
    if "." not in base:
        return base, ""
    stem, ext = base.rsplit(".", 1)
    return stem, ext.lower()


def _sanitize_stem(stem: str) -> str:
    safe = re.sub(r"[^A-Za-z0-9 ._-]+", "_", stem).strip(" .")
    return safe[:80] or "untitled"


@router.post("/songs/{video_id}/transcriptions", status_code=201)
async def upload_transcription(
    file: UploadFile,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    stem, ext = _split_name(file.filename or "")
    kind = ALLOWED_EXTENSIONS.get(ext)
    if kind is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '.{ext}'. "
            f"Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File larger than 25 MB")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise HTTPException(status_code=404, detail="Song not found")

    tdir = settings.media_root / video_id / "transcriptions"
    tdir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex[:8]}_{_sanitize_stem(stem)}.{ext}"
    dest = tdir / filename
    try:
        dest.write_bytes(data)
    except OSError as e:
        logger.exception("Could not store transcription file %s", dest)
        raise HTTPException(status_code=500, detail=f"Could not store file: {e}") from e

    try:
        with db_session() as db:
            row = Transcription(
                song_id=video_id,
                name=f"{stem}.{ext}",
                kind=kind,
                path=f"{video_id}/transcriptions/{filename}",
            )
            db.add(row)
            db.flush()
            return {"transcription": row.to_dict()}
    except Exception:
        dest.unlink(missing_ok=True)  # don't leave an orphaned file behind
        raise


@router.get("/songs/{video_id}/transcriptions")
async def list_transcriptions(
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise HTTPException(status_code=404, detail="Song not found")
        rows = db.scalars(
            select(Transcription)
            .where(Transcription.song_id == video_id)
            .order_by(Transcription.id)
        ).all()
        return {"transcriptions": [r.to_dict() for r in rows]}


class TranscribeRequest(BaseModel):
    stem: str = Field(default="guitar", pattern=r"^[a-z]{2,16}$")
    tuning: str | None = None  # None -> per-stem default; must be a TUNINGS key
    capo: int = Field(default=0, ge=0, le=12)
    onset_threshold: float = Field(default=0.5, ge=0.05, le=0.95)
    frame_threshold: float = Field(default=0.3, ge=0.05, le=0.95)
    min_note_length_ms: float = Field(default=58.0, ge=10, le=1000)


@router.post("/songs/{video_id}/transcribe", status_code=202)
async def transcribe_song_endpoint(
    request: Request,
    body: TranscribeRequest,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    if body.tuning is not None and body.tuning not in TUNINGS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown tuning '{body.tuning}'. Available: {', '.join(sorted(TUNINGS))}",
        )
    queue = request.app.state.job_queue
    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise HTTPException(status_code=404, detail="Song not found")
        stem_row = db.scalar(
            select(Stem).where(Stem.song_id == video_id, Stem.name == body.stem)
        )
        if stem_row is None:
            raise HTTPException(
                status_code=409,
                detail=f"No '{body.stem}' stem for this song — run separation first.",
            )
        active = db.scalars(
            select(Job)
            .where(
                Job.song_id == video_id,
                Job.kind == "transcribe",
                Job.status.in_(("queued", "running")),
            )
            .order_by(Job.created_at.desc())
        ).first()
        if active is not None:
            return {"job_id": active.id, "already_running": True}
    job_id = queue.enqueue("transcribe", video_id, params=body.model_dump())
    return {"job_id": job_id, "already_running": False}


MAX_ALPHATEX_BYTES = 2 * 1024 * 1024


class TranscriptionContent(BaseModel):
    """Edited score serialized by the frontend editor (alphaTex is canonical:
    AlphaTab's own exporter/importer pair round-trips everything the editor
    can produce, which MusicXML export would not)."""

    alphatex: str = Field(min_length=1, max_length=MAX_ALPHATEX_BYTES)
    meta_json: str | None = Field(default=None, max_length=200_000)


@router.put("/transcriptions/{transcription_id}/content")
async def save_transcription_content(
    transcription_id: int, body: TranscriptionContent
) -> dict:
    """Persist editor changes: write the alphaTex next to the original file
    (which is kept as the raw AI/upload artifact) and repoint the row at it.
    First save flips source -> 'edited' (clears the "AI draft" label)."""
    with db_session() as db:
        row = db.get(Transcription, transcription_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transcription not found")
        tdir = settings.media_root / row.song_id / "transcriptions"
        try:
            tdir.mkdir(parents=True, exist_ok=True)
            dest = tdir / f"edit_{row.id}.alphatex"
            dest.write_text(body.alphatex, encoding="utf-8", newline="\n")
        except OSError as e:
            logger.exception("Could not store edited transcription %s", transcription_id)
            raise HTTPException(status_code=500, detail=f"Could not store file: {e}") from e
        row.kind = "alphatex"
        row.path = f"{row.song_id}/transcriptions/edit_{row.id}.alphatex"
        row.source = "edited"
        if body.meta_json is not None:
            row.meta_json = body.meta_json
        db.flush()
        return {"transcription": row.to_dict()}


class TranscriptionPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sync_bpm: float | None = Field(default=None, gt=10, lt=400)
    sync_offset_s: float | None = Field(default=None, ge=-60, le=3600)


@router.patch("/transcriptions/{transcription_id}")
async def update_transcription(transcription_id: int, body: TranscriptionPatch) -> dict:
    with db_session() as db:
        row = db.get(Transcription, transcription_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transcription not found")
        if body.name is not None:
            row.name = body.name
        if body.sync_bpm is not None:
            row.sync_bpm = body.sync_bpm
        if body.sync_offset_s is not None:
            row.sync_offset_s = body.sync_offset_s
        db.flush()
        return {"transcription": row.to_dict()}


@router.delete("/transcriptions/{transcription_id}", status_code=204)
async def delete_transcription(transcription_id: int) -> None:
    with db_session() as db:
        row = db.get(Transcription, transcription_id)
        if row is None:
            raise HTTPException(status_code=404, detail="Transcription not found")
        path = settings.media_root / row.path
        db.delete(row)
        db.flush()
    try:
        path.unlink(missing_ok=True)
    except OSError as e:
        # row is gone; a stale file is harmless but worth a log line
        logger.warning("Could not remove transcription file %s: %s", path, e)
