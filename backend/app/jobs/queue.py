"""Generic in-process job queue (single async worker).

Kind-based: later phases plug in new work by calling
`queue.register("separate", handler)` — the queue itself knows nothing about
downloads or stems. Handlers are `async def handler(ctx: JobContext)`; they
report progress via ctx and raise JobError subclasses for user-facing
failures. Progress fans out to SSE subscribers via per-job asyncio queues.
"""

import asyncio
import logging
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from app.db.models import Job, utcnow
from app.db.session import db_session
from app.jobs.errors import JobCancelled, JobError

logger = logging.getLogger("fretlab.jobs")


@dataclass
class JobEvent:
    job_id: str
    status: str
    stage: str | None
    progress: float
    error: str | None = None


class JobContext:
    """Handed to handlers: progress reporting + cooperative cancellation."""

    def __init__(
        self,
        job_id: str,
        song_id: str,
        queue: "JobQueue",
        cancel_event: asyncio.Event,
        loop: asyncio.AbstractEventLoop,
    ) -> None:
        self.job_id = job_id
        self.song_id = song_id
        self._queue = queue
        self._cancel_event = cancel_event
        self._loop = loop

    def report(self, stage: str, progress: float) -> None:
        """Persist and broadcast progress. Event-loop thread only."""
        self._queue._update(self.job_id, stage=stage, progress=progress)

    def report_threadsafe(self, stage: str, progress: float) -> None:
        """Progress from worker threads (e.g. yt-dlp hooks)."""
        self._loop.call_soon_threadsafe(self.report, stage, progress)

    @property
    def cancelled(self) -> bool:
        return self._cancel_event.is_set()

    def raise_if_cancelled(self) -> None:
        if self.cancelled:
            raise JobCancelled()


Handler = Callable[[JobContext], Awaitable[None]]


class JobQueue:
    def __init__(self) -> None:
        self._pending: asyncio.Queue[str] = asyncio.Queue()
        self._handlers: dict[str, Handler] = {}
        self._subscribers: dict[str, set[asyncio.Queue[JobEvent]]] = {}
        self._cancel_events: dict[str, asyncio.Event] = {}
        self._worker_task: asyncio.Task | None = None

    # -- lifecycle ---------------------------------------------------------

    def register(self, kind: str, handler: Handler) -> None:
        self._handlers[kind] = handler

    def start(self) -> None:
        self._worker_task = asyncio.get_running_loop().create_task(
            self._worker_loop(), name="job-queue-worker"
        )

    async def stop(self) -> None:
        if self._worker_task is None:
            return
        self._worker_task.cancel()
        try:
            await self._worker_task
        except asyncio.CancelledError:
            pass
        self._worker_task = None

    # -- public API --------------------------------------------------------

    def enqueue(self, kind: str, song_id: str) -> str:
        """Create a Job row and schedule it. Returns the job id."""
        if kind not in self._handlers:
            raise ValueError(f"No handler registered for job kind {kind!r}")
        job_id = uuid.uuid4().hex
        with db_session() as db:
            db.add(Job(id=job_id, song_id=song_id, kind=kind, status="queued"))
        self._cancel_events[job_id] = asyncio.Event()
        self._pending.put_nowait(job_id)
        return job_id

    def cancel(self, job_id: str) -> None:
        event = self._cancel_events.get(job_id)
        if event is not None:
            event.set()

    def subscribe(self, job_id: str) -> asyncio.Queue[JobEvent]:
        q: asyncio.Queue[JobEvent] = asyncio.Queue()
        self._subscribers.setdefault(job_id, set()).add(q)
        return q

    def unsubscribe(self, job_id: str, q: asyncio.Queue[JobEvent]) -> None:
        subs = self._subscribers.get(job_id)
        if subs is not None:
            subs.discard(q)
            if not subs:
                del self._subscribers[job_id]

    # -- internals ---------------------------------------------------------

    def _update(
        self,
        job_id: str,
        *,
        status: str | None = None,
        stage: str | None = None,
        progress: float | None = None,
        error: str | None = None,
        mark_started: bool = False,
        mark_finished: bool = False,
    ) -> None:
        with db_session() as db:
            job = db.get(Job, job_id)
            if job is None:  # deleted mid-run (e.g. song removed)
                return
            if status is not None:
                job.status = status
            if stage is not None:
                job.stage = stage
            if progress is not None:
                job.progress = min(1.0, max(0.0, progress))
            if error is not None:
                job.error = error
            if mark_started:
                job.started_at = utcnow()
            if mark_finished:
                job.finished_at = utcnow()
            event = JobEvent(job_id, job.status, job.stage, job.progress, job.error)
        for q in tuple(self._subscribers.get(job_id, ())):
            q.put_nowait(event)

    async def _worker_loop(self) -> None:
        while True:
            job_id = await self._pending.get()
            try:
                await self._run_one(job_id)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Worker crashed running job %s", job_id)
                self._update(
                    job_id, status="error", error="Internal worker error", mark_finished=True
                )
            finally:
                self._cancel_events.pop(job_id, None)
                self._pending.task_done()

    async def _run_one(self, job_id: str) -> None:
        with db_session() as db:
            job = db.get(Job, job_id)
            if job is None:
                return
            kind, song_id = job.kind, job.song_id
        cancel_event = self._cancel_events.get(job_id) or asyncio.Event()
        if cancel_event.is_set():
            self._update(job_id, status="cancelled", mark_finished=True)
            return
        ctx = JobContext(job_id, song_id, self, cancel_event, asyncio.get_running_loop())
        self._update(job_id, status="running", mark_started=True)
        try:
            await self._handlers[kind](ctx)
        except JobCancelled:
            logger.info("Job %s (%s) cancelled", job_id, kind)
            self._update(job_id, status="cancelled", mark_finished=True)
        except JobError as e:
            logger.warning("Job %s (%s) failed: %s", job_id, kind, e)
            self._update(job_id, status="error", error=str(e), mark_finished=True)
        except Exception as e:
            logger.exception("Job %s (%s) raised unexpectedly", job_id, kind)
            self._update(
                job_id,
                status="error",
                error=f"Unexpected {type(e).__name__}: {e}",
                mark_finished=True,
            )
        else:
            self._update(job_id, status="done", stage="done", progress=1.0, mark_finished=True)
