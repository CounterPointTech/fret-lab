"""Download stage: yt-dlp error mapping + cache-hit behaviour."""

import asyncio

import yt_dlp

from app.config import settings
from app.db.models import Song
from app.db.session import db_session, init_db
from app.pipeline.ytdlp_download import (
    BotCheckError,
    DownloadError,
    NetworkError,
    VideoUnavailableError,
    _map_ytdlp_error,
    download_song,
)


def _err(msg: str) -> yt_dlp.utils.DownloadError:
    return yt_dlp.utils.DownloadError(msg)


def test_map_video_unavailable():
    mapped = _map_ytdlp_error(_err("ERROR: [youtube] xxxx: Video unavailable"))
    assert isinstance(mapped, VideoUnavailableError)
    assert "Video unavailable" in str(mapped)


def test_map_bad_id():
    mapped = _map_ytdlp_error(_err("Incomplete YouTube ID abc. URL looks truncated."))
    assert isinstance(mapped, VideoUnavailableError)


def test_map_bot_check_is_actionable():
    mapped = _map_ytdlp_error(
        _err("Sign in to confirm you're not a bot. Use --cookies-from-browser")
    )
    assert isinstance(mapped, BotCheckError)
    assert "cookies" in str(mapped).lower()  # actionable hint for the user


def test_map_network():
    mapped = _map_ytdlp_error(_err("urlopen error [Errno 11001] getaddrinfo failed"))
    assert isinstance(mapped, NetworkError)


def test_map_unknown_falls_back_to_download_error():
    mapped = _map_ytdlp_error(_err("some novel failure"))
    assert type(mapped) is DownloadError
    assert "some novel failure" in str(mapped)


class FakeCtx:
    def __init__(self, song_id):
        self.song_id = song_id
        self.reports = []
        self.cancelled = False

    def report(self, stage, progress):
        self.reports.append((stage, progress))

    def report_threadsafe(self, stage, progress):
        self.reports.append((stage, progress))

    def raise_if_cancelled(self):
        pass


def test_cache_hit_skips_download(tmp_env):
    """source.wav already on disk -> no network, song flips to ready."""
    init_db()
    vid = "cached_00001"
    with db_session() as db:
        db.add(Song(video_id=vid, title="cached", status="queued"))
    song_dir = settings.media_root / vid
    song_dir.mkdir(parents=True)
    (song_dir / "source.wav").write_bytes(b"RIFF")

    ctx = FakeCtx(vid)
    asyncio.run(download_song(ctx))

    assert ctx.reports == [("cached", 1.0)]
    with db_session() as db:
        assert db.get(Song, vid).status == "ready"
    assert (song_dir / "source.wav").exists()  # untouched
