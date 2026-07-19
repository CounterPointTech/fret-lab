"""Song library: add (enqueues a download job), list, delete."""

import logging
import shutil

from fastapi import APIRouter, HTTPException, Request
from fastapi import Path as PathParam
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.config import settings
from app.db.models import Job, Song
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
            out.append(d)
    return {"songs": out}


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
