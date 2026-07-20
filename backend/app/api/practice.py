"""Practice history: record a practice session per song, list with summary."""

import json
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter
from fastapi import Path as PathParam
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select

from app.api.songs import VIDEO_ID_PATTERN
from app.db.models import PracticeSession, Song, utcnow
from app.db.session import db_session
from app.errors import NotFoundError

logger = logging.getLogger("fretlab.api.practice")

router = APIRouter(prefix="/api")


class LoopEntry(BaseModel):
    """One A-B loop section drilled during the session (seconds)."""

    a: float = Field(ge=0)
    b: float
    # top playback speed reached while looping this section
    max_rate: float = Field(gt=0, le=2)
    plays: int = Field(ge=0)

    @model_validator(mode="after")
    def _a_before_b(self) -> "LoopEntry":
        if self.a >= self.b:
            raise ValueError("loop start (a) must be less than loop end (b)")
        return self


class CreatePracticeSessionRequest(BaseModel):
    started_at: datetime | None = None
    play_seconds: float = Field(ge=0)
    max_rate: float = Field(gt=0, le=2)
    loops: list[LoopEntry] = Field(default_factory=list)


def _as_utc(dt: datetime) -> datetime:
    """SQLite drops tzinfo on round-trip — treat naive datetimes as UTC."""
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


@router.post("/songs/{video_id}/practice-sessions", status_code=201)
async def create_practice_session(
    body: CreatePracticeSessionRequest,
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise NotFoundError("Song not found")
        session = PracticeSession(
            song_id=video_id,
            started_at=body.started_at or utcnow(),
            ended_at=utcnow(),  # sessions are reported when they finish
            play_seconds=body.play_seconds,
            max_rate=body.max_rate,
            loops_json=(
                json.dumps([loop.model_dump() for loop in body.loops]) if body.loops else None
            ),
        )
        db.add(session)
        db.flush()
        return {"session": session.to_dict()}


@router.get("/songs/{video_id}/practice-sessions")
async def list_practice_sessions(
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
) -> dict:
    with db_session() as db:
        if db.get(Song, video_id) is None:
            raise NotFoundError("Song not found")
        sessions = db.scalars(
            select(PracticeSession)
            .where(PracticeSession.song_id == video_id)
            .order_by(PracticeSession.started_at.desc(), PracticeSession.id.desc())
        ).all()
        week_cutoff = utcnow() - timedelta(days=7)
        summary = {
            "total_seconds": sum(s.play_seconds for s in sessions),
            "session_count": len(sessions),
            "week_seconds": sum(
                s.play_seconds for s in sessions if _as_utc(s.started_at) >= week_cutoff
            ),
        }
        return {"sessions": [s.to_dict() for s in sessions], "summary": summary}
