"""Job queue: happy path, typed failure, unexpected failure, cancellation."""

import asyncio

import pytest

from app.db.models import TERMINAL_JOB_STATUSES, Job, Song
from app.db.session import db_session, init_db
from app.jobs.errors import JobError
from app.jobs.queue import JobQueue

VID = "vid_test_001"


def _setup_song():
    init_db()
    with db_session() as db:
        db.add(Song(video_id=VID, title="test song"))


async def _wait_terminal(job_id: str, timeout: float = 5.0) -> Job:
    loop = asyncio.get_running_loop()
    deadline = loop.time() + timeout
    while loop.time() < deadline:
        with db_session() as db:
            job = db.get(Job, job_id)
            if job is not None and job.status in TERMINAL_JOB_STATUSES:
                db.expunge(job)
                return job
        await asyncio.sleep(0.01)
    raise TimeoutError(f"job {job_id} never reached a terminal status")


def test_happy_path_persists_progress_and_done(tmp_env):
    async def main():
        _setup_song()
        queue = JobQueue()
        seen_stages = []

        async def handler(ctx):
            ctx.report("stage-one", 0.3)
            seen_stages.append("stage-one")
            await asyncio.sleep(0)
            ctx.report("stage-two", 0.7)
            seen_stages.append("stage-two")

        queue.register("test", handler)
        job_id = queue.enqueue("test", VID)
        queue.start()
        job = await _wait_terminal(job_id)
        await queue.stop()

        assert job.status == "done"
        assert job.progress == 1.0
        assert job.stage == "done"
        assert job.error is None
        assert job.started_at is not None
        assert job.finished_at is not None
        assert seen_stages == ["stage-one", "stage-two"]

    asyncio.run(main())


def test_typed_error_persisted(tmp_env):
    async def main():
        _setup_song()
        queue = JobQueue()

        async def handler(ctx):
            raise JobError("Video unavailable: bad_id_00000 does not exist")

        queue.register("test", handler)
        job_id = queue.enqueue("test", VID)
        queue.start()
        job = await _wait_terminal(job_id)
        await queue.stop()

        assert job.status == "error"
        assert "Video unavailable" in job.error

    asyncio.run(main())


def test_unexpected_error_persisted_and_worker_survives(tmp_env):
    async def main():
        _setup_song()
        queue = JobQueue()

        async def boom(ctx):
            raise RuntimeError("kaboom")

        async def ok(ctx):
            pass

        queue.register("boom", boom)
        queue.register("ok", ok)
        bad_id = queue.enqueue("boom", VID)
        good_id = queue.enqueue("ok", VID)
        queue.start()
        bad = await _wait_terminal(bad_id)
        good = await _wait_terminal(good_id)
        await queue.stop()

        assert bad.status == "error"
        assert "Unexpected RuntimeError: kaboom" in bad.error
        assert good.status == "done"  # worker survived the crash

    asyncio.run(main())


def test_cancel_before_run(tmp_env):
    async def main():
        _setup_song()
        queue = JobQueue()

        async def handler(ctx):
            raise AssertionError("should never run")

        queue.register("test", handler)
        job_id = queue.enqueue("test", VID)
        queue.cancel(job_id)
        queue.start()
        job = await _wait_terminal(job_id)
        await queue.stop()
        assert job.status == "cancelled"

    asyncio.run(main())


def test_enqueue_unknown_kind_raises(tmp_env):
    init_db()
    queue = JobQueue()
    with pytest.raises(ValueError, match="No handler registered"):
        queue.enqueue("nope", VID)


def test_subscriber_receives_events(tmp_env):
    async def main():
        _setup_song()
        queue = JobQueue()

        async def handler(ctx):
            ctx.report("working", 0.5)

        queue.register("test", handler)
        job_id = queue.enqueue("test", VID)
        sub = queue.subscribe(job_id)
        queue.start()
        events = []
        while True:
            event = await asyncio.wait_for(sub.get(), timeout=5)
            events.append(event)
            if event.status in TERMINAL_JOB_STATUSES:
                break
        queue.unsubscribe(job_id, sub)
        await queue.stop()

        assert events[-1].status == "done"
        assert any(e.stage == "working" and e.progress == 0.5 for e in events)

    asyncio.run(main())
