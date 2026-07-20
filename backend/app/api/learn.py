"""Learn curriculum progress: upsert per-lesson completion, list, delete."""

import logging

from fastapi import APIRouter
from fastapi import Path as PathParam
from pydantic import BaseModel, model_validator
from sqlalchemy import select

from app.db.models import LessonProgress, utcnow
from app.db.session import db_session
from app.errors import NotFoundError

logger = logging.getLogger("fretlab.api.learn")

router = APIRouter(prefix="/api")

# Frontend-owned kebab-case slug, e.g. "open-chords-basics" (80 chars max).
LESSON_ID_PATTERN = r"^[a-z0-9][a-z0-9-]{0,79}$"


class UpsertLessonProgressRequest(BaseModel):
    """Optional quiz score for the lesson — both fields or neither."""

    quiz_correct: int | None = None
    quiz_total: int | None = None

    @model_validator(mode="after")
    def _quiz_score_consistent(self) -> "UpsertLessonProgressRequest":
        if (self.quiz_correct is None) != (self.quiz_total is None):
            raise ValueError("quiz_correct and quiz_total must be provided together")
        if self.quiz_total is not None:
            if self.quiz_total < 1:
                raise ValueError("quiz_total must be at least 1")
            if not 0 <= self.quiz_correct <= self.quiz_total:
                raise ValueError("quiz_correct must be between 0 and quiz_total")
        return self


@router.get("/learn/progress")
async def list_lesson_progress() -> dict:
    with db_session() as db:
        rows = db.scalars(
            select(LessonProgress).order_by(
                LessonProgress.completed_at.desc(), LessonProgress.id.desc()
            )
        ).all()
        return {"progress": [row.to_dict() for row in rows]}


@router.put("/learn/progress/{lesson_id}")
async def upsert_lesson_progress(
    body: UpsertLessonProgressRequest | None = None,
    lesson_id: str = PathParam(pattern=LESSON_ID_PATTERN),
) -> dict:
    quiz = body or UpsertLessonProgressRequest()
    with db_session() as db:
        row = db.scalar(select(LessonProgress).where(LessonProgress.lesson_id == lesson_id))
        if row is None:
            row = LessonProgress(lesson_id=lesson_id)
            db.add(row)
        # re-completing refreshes the timestamp and overwrites the quiz score
        row.completed_at = utcnow()
        row.quiz_correct = quiz.quiz_correct
        row.quiz_total = quiz.quiz_total
        db.flush()
        return {"progress": row.to_dict()}


@router.delete("/learn/progress/{lesson_id}", status_code=204)
async def delete_lesson_progress(
    lesson_id: str = PathParam(pattern=LESSON_ID_PATTERN),
) -> None:
    with db_session() as db:
        row = db.scalar(select(LessonProgress).where(LessonProgress.lesson_id == lesson_id))
        if row is None:
            raise NotFoundError("Lesson progress not found")
        db.delete(row)
