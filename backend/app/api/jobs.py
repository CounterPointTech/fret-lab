"""Job status: snapshot GET + SSE progress stream."""

import asyncio
import json
import logging
from dataclasses import asdict

from fastapi import APIRouter, HTTPException, Request
from sse_starlette.sse import EventSourceResponse

from app.db.models import TERMINAL_JOB_STATUSES, Job
from app.db.session import db_session
from app.jobs.queue import JobEvent

logger = logging.getLogger("fretlab.api.jobs")

router = APIRouter(prefix="/api")

_PING_INTERVAL_S = 15


@router.get("/jobs/{job_id}")
async def get_job(job_id: str) -> dict:
    with db_session() as db:
        job = db.get(Job, job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return job.to_dict()


@router.get("/jobs/{job_id}/events")
async def job_events(job_id: str, request: Request) -> EventSourceResponse:
    """SSE stream of {status, stage, progress, error}; closes after a
    terminal event (done/error/cancelled)."""
    queue = request.app.state.job_queue
    with db_session() as db:
        job = db.get(Job, job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        snapshot = JobEvent(job_id, job.status, job.stage, job.progress, job.error)

    sub = queue.subscribe(job_id)

    async def stream():
        try:
            yield {"event": "progress", "data": json.dumps(asdict(snapshot))}
            if snapshot.status in TERMINAL_JOB_STATUSES:
                return
            while True:
                try:
                    event = await asyncio.wait_for(sub.get(), timeout=_PING_INTERVAL_S)
                except asyncio.TimeoutError:
                    yield {"event": "ping", "data": ""}
                    continue
                yield {"event": "progress", "data": json.dumps(asdict(event))}
                if event.status in TERMINAL_JOB_STATUSES:
                    return
        finally:
            queue.unsubscribe(job_id, sub)

    return EventSourceResponse(stream())
