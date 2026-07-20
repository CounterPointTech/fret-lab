"""Song library: add (enqueues a download job), list, delete."""

import logging
import shutil

from fastapi import APIRouter, HTTPException, Request
from fastapi import Path as PathParam
from pydantic import BaseModel, Field
from sqlalchemy import func, select

from app.config import settings
from app.db.models import Job, Song, Stem
from app.db.session import db_session

logger = logging.getLogger("fretlab.api.songs")

router = APIRouter(prefix="/api")

# Strict id charset — video_id names the media/ subdirectory, so this also
# blocks path traversal.
VIDEO_ID_PATTERN = r"^[A-Za-z0-9_-]{5,20}$"


class AddSongRequest(BaseModel):
    video_id: str = Field(pattern=VIDEO_ID_PATTERN)
    title: str | None = None
    channel: str | None = None
    duration_s: int | None = Field(default=None, ge=0)
    thumbnail_url: str | None = None


@router.post("/songs", status_code=201)
async def add_song(body: AddSongRequest, request: Request) -> dict:
    queue = request.app.state.job_queue
    with db_session() as db:
        song = db.get(Song, body.video_id)
        if song is None:
            song = Song(
                video_id=body.video_id,
                title=body.title or body.video_id,
                channel=body.channel,
                duration_s=body.duration_s,
                thumbnail_url=body.thumbnail_url,
                status="queued",
            )
            db.add(song)
        elif song.status == "ready" and (settings.media_root / body.video_id / "source.wav").exists():
            # cache hit — never reprocess
            return {"song": song.to_dict(), "job_id": None}
        else:
            song.status = "queued"
        db.flush()
        song_dict = song.to_dict()
    job_id = queue.enqueue("download", body.video_id)
    return {"song": song_dict, "job_id": job_id}


@router.get("/songs")
async def list_songs() -> dict:
    with db_session() as db:
        songs = db.scalars(select(Song).order_by(Song.created_at.desc())).all()
        out = []
        for song in songs:
            d = song.to_dict()
            active = db.scalars(
                select(Job)
                .where(Job.song_id == song.video_id, Job.status.in_(("queued", "running")))
                .order_by(Job.created_at.desc())
            ).first()
            d["active_job_id"] = active.id if active else None
            last_error = db.scalars(
                select(Job)
                .where(Job.song_id == song.video_id, Job.status == "error")
                .order_by(Job.created_at.desc())
            ).first()
            d["last_error"] = last_error.error if last_error else None
            d["stem_count"] = db.scalar(
                select(func.count()).select_from(Stem).where(Stem.song_id == song.video_id)
            )
            out.append(d)
    return {"songs": out}


@router.get("/songs/{video_id}")
async def get_song(video_id: str = PathParam(pattern=VIDEO_ID_PATTERN)) -> dict:
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        d = song.to_dict()
        active = db.scalars(
            select(Job)
            .where(Job.song_id == video_id, Job.status.in_(("queued", "running")))
            .order_by(Job.created_at.desc())
        ).first()
        d["active_job_id"] = active.id if active else None
        stems = db.scalars(
            select(Stem).where(Stem.song_id == video_id).order_by(Stem.id)
        ).all()
        d["stem_count"] = len(stems)
        has_analysis = (settings.media_root / video_id / "analysis" / "chords.json").is_file()
        d["chords_url"] = (
            f"/api/media/{video_id}/analysis/chords.json" if has_analysis else None
        )
        return {"song": d, "stems": [s.to_dict() for s in stems]}


@router.get("/songs/{video_id}/stems")
async def list_stems(video_id: str = PathParam(pattern=VIDEO_ID_PATTERN)) -> dict:
    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise HTTPException(status_code=404, detail="Song not found")
        stems = db.scalars(
            select(Stem).where(Stem.song_id == video_id).order_by(Stem.id)
        ).all()
        return {"stems": [s.to_dict() for s in stems]}


@router.post("/songs/{video_id}/separate", status_code=202)
async def separate_song_endpoint(
    request: Request,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    queue = request.app.state.job_queue
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        if song.status != "ready":
            raise HTTPException(
                status_code=409,
                detail=f"Song is not ready for separation (status: {song.status})",
            )
        # idempotent: an already queued/running separate job is returned as-is
        active = db.scalars(
            select(Job)
            .where(
                Job.song_id == video_id,
                Job.kind == "separate",
                Job.status.in_(("queued", "running")),
            )
            .order_by(Job.created_at.desc())
        ).first()
        if active is not None:
            return {"job_id": active.id, "already_running": True}
    job_id = queue.enqueue("separate", video_id)
    return {"job_id": job_id, "already_running": False}


@router.post("/songs/{video_id}/analyze", status_code=202)
async def analyze_song_endpoint(
    request: Request,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    """Chord timeline + key estimate. Cache-aware; idempotent while running."""
    queue = request.app.state.job_queue
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        if song.status != "ready":
            raise HTTPException(
                status_code=409,
                detail=f"Song is not ready for analysis (status: {song.status})",
            )
        active = db.scalars(
            select(Job)
            .where(
                Job.song_id == video_id,
                Job.kind == "analyze",
                Job.status.in_(("queued", "running")),
            )
            .order_by(Job.created_at.desc())
        ).first()
        if active is not None:
            return {"job_id": active.id, "already_running": True}
    job_id = queue.enqueue("analyze", video_id)
    return {"job_id": job_id, "already_running": False}


@router.delete("/songs/{video_id}", status_code=204)
async def delete_song(
    request: Request,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> None:
    queue = request.app.state.job_queue
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:
            raise HTTPException(status_code=404, detail="Song not found")
        jobs = db.scalars(select(Job).where(Job.song_id == video_id)).all()
        for job in jobs:
            if job.status in ("queued", "running"):
                queue.cancel(job.id)

        # Remove media before rows so a failed rmtree (e.g. a still-running
        # download holding a file handle on Windows) leaves state consistent.
        song_dir = settings.media_root / video_id
        if song_dir.exists():
            try:
                shutil.rmtree(song_dir)
            except OSError as e:
                logger.warning("Could not remove %s: %s", song_dir, e)
                raise HTTPException(
                    status_code=409,
                    detail=f"Media files are busy ({e}); retry in a moment.",
                ) from e

        for job in jobs:
            db.delete(job)
        db.delete(song)
