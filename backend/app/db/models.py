from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


class Base(DeclarativeBase):
    pass


class Song(Base):
    """One YouTube video, keyed by its video id (also the media/ dir name)."""

    __tablename__ = "songs"

    video_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    title: Mapped[str] = mapped_column(Text)
    channel: Mapped[str | None] = mapped_column(Text)
    duration_s: Mapped[int | None] = mapped_column(Integer)
    thumbnail_url: Mapped[str | None] = mapped_column(Text)
    # queued | downloading | ready | error
    status: Mapped[str] = mapped_column(String(16), default="queued")
    # filled by the analyze job (chord/key analysis), e.g. "A minor"
    key_name: Mapped[str | None] = mapped_column(String(32))
    bpm: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    def to_dict(self) -> dict:
        return {
            "video_id": self.video_id,
            "title": self.title,
            "channel": self.channel,
            "duration_s": self.duration_s,
            "thumbnail_url": self.thumbnail_url,
            "status": self.status,
            "key_name": self.key_name,
            "bpm": self.bpm,
            "created_at": _iso(self.created_at),
        }


class Job(Base):
    """A unit of background work of some `kind` (download, separate, ...)."""

    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.video_id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(32))
    # queued | running | done | error | cancelled
    status: Mapped[str] = mapped_column(String(16), default="queued")
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    stage: Mapped[str | None] = mapped_column(String(64))
    error: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "song_id": self.song_id,
            "kind": self.kind,
            "status": self.status,
            "progress": self.progress,
            "stage": self.stage,
            "error": self.error,
            "created_at": _iso(self.created_at),
            "started_at": _iso(self.started_at),
            "finished_at": _iso(self.finished_at),
        }


class Stem(Base):
    """One separated instrument track (vocals/drums/bass/guitar/piano/other).

    Paths are stored relative to media_root so the cache dir can move.
    """

    __tablename__ = "stems"
    __table_args__ = (UniqueConstraint("song_id", "name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.video_id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(16))
    wav_path: Mapped[str] = mapped_column(Text)
    m4a_path: Mapped[str] = mapped_column(Text)
    peaks_path: Mapped[str] = mapped_column(Text)
    duration_s: Mapped[float | None] = mapped_column(Float)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "song_id": self.song_id,
            "name": self.name,
            "duration_s": self.duration_s,
            "audio_url": f"/api/media/{self.song_id}/stems/{self.name}.m4a",
            "peaks_url": f"/api/media/{self.song_id}/peaks/{self.name}.json",
        }


class Transcription(Base):
    """One imported (or later AI-drafted) tab/notation file for a song.

    `path` is relative to media_root (like Stem paths). `sync_bpm` and
    `sync_offset_s` are the manual sync-point model v1: the BPM the real
    audio plays the score's quarter notes at, and where score tick 0 lands
    in the audio (seconds).
    """

    __tablename__ = "transcriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.video_id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(Text)
    # guitarpro | musicxml | alphatex
    kind: Mapped[str] = mapped_column(String(16))
    path: Mapped[str] = mapped_column(Text)
    sync_bpm: Mapped[float | None] = mapped_column(Float)
    sync_offset_s: Mapped[float] = mapped_column(Float, default=0.0)
    # upload | generated (AI transcription draft) | edited (draft/upload with user edits)
    source: Mapped[str] = mapped_column(String(16), default="upload")
    # JSON of the pipeline params that produced a generated draft (reproducibility)
    params_json: Mapped[str | None] = mapped_column(Text)
    # JSON sidecar for editor state the score file can't express (per-note string locks)
    meta_json: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    def to_dict(self) -> dict:
        filename = self.path.rsplit("/", 1)[-1]
        return {
            "id": self.id,
            "song_id": self.song_id,
            "name": self.name,
            "kind": self.kind,
            "sync_bpm": self.sync_bpm,
            "sync_offset_s": self.sync_offset_s,
            "source": self.source,
            "params_json": self.params_json,
            "meta_json": self.meta_json,
            "created_at": _iso(self.created_at),
            "file_url": f"/api/media/{self.song_id}/transcriptions/{filename}",
        }


class PracticeSession(Base):
    """One practice sitting on a song: total play time, top playback rate
    reached, and the loop sections (A-B regions) drilled during the session.

    `loops_json` is a JSON array of {a, b, max_rate, plays} entries — loop
    bounds in seconds plus the top speed reached while looping that section.
    """

    __tablename__ = "practice_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    song_id: Mapped[str] = mapped_column(ForeignKey("songs.video_id", ondelete="CASCADE"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    play_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    # max playback speed reached this session (0.5-1.0 scale in the player)
    max_rate: Mapped[float] = mapped_column(Float, default=1.0)
    loops_json: Mapped[str | None] = mapped_column(Text)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "song_id": self.song_id,
            "started_at": _iso(self.started_at),
            "ended_at": _iso(self.ended_at),
            "play_seconds": self.play_seconds,
            "max_rate": self.max_rate,
            "loops": json.loads(self.loops_json) if self.loops_json else [],
        }


class LessonProgress(Base):
    """Completion record for one Learn-curriculum lesson.

    `lesson_id` is a frontend-owned kebab-case slug (the curriculum lives in
    the frontend); one row per lesson — re-completing a lesson refreshes
    `completed_at` and overwrites the quiz score.
    """

    __tablename__ = "lesson_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[str] = mapped_column(String(80), unique=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    quiz_correct: Mapped[int | None] = mapped_column(Integer)
    quiz_total: Mapped[int | None] = mapped_column(Integer)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "lesson_id": self.lesson_id,
            "completed_at": _iso(self.completed_at),
            "quiz_correct": self.quiz_correct,
            "quiz_total": self.quiz_total,
        }


TERMINAL_JOB_STATUSES = frozenset({"done", "error", "cancelled"})
