import pytest
from fastapi.testclient import TestClient

from app import config
from app.db import session as db_session_module


@pytest.fixture
def tmp_env(tmp_path, monkeypatch):
    """Point DB + media at a temp dir and reset the engine cache."""
    monkeypatch.setattr(config.settings, "db_path", tmp_path / "test.db")
    monkeypatch.setattr(config.settings, "media_root", tmp_path / "media")
    db_session_module.reset_engine()
    yield tmp_path
    db_session_module.reset_engine()


@pytest.fixture
def client(tmp_env, monkeypatch):
    """TestClient with lifespan (job queue running) and a fake download
    handler so tests never touch the network."""
    from app.db.models import Song
    from app.db.session import db_session
    from app.jobs.errors import JobError

    def _set_status(video_id, status):
        with db_session() as db:
            song = db.get(Song, video_id)
            if song is not None:
                song.status = status

    async def fake_download(ctx):
        # mirrors the real handler's Song.status transitions
        if ctx.song_id.startswith("bad"):
            _set_status(ctx.song_id, "error")
            raise JobError(f"Video unavailable: {ctx.song_id} does not exist")
        _set_status(ctx.song_id, "downloading")
        ctx.report("download", 0.5)
        _set_status(ctx.song_id, "ready")

    monkeypatch.setattr("app.main.download_song", fake_download)
    from app.main import app

    with TestClient(app) as c:
        yield c
