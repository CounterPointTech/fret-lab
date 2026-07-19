"""Download stage: YouTube video id -> media/{videoId}/source.wav (44.1 kHz stereo).

Also writes metadata.json + thumbnail.* into the media dir and updates the
Song row (downloading -> ready/error). Cache hit (source.wav exists) is a
no-op — never reprocess.
"""

import asyncio
import json
import logging
import shutil

import yt_dlp

from app.config import settings
from app.db.models import Song
from app.db.session import db_session
from app.jobs.errors import JobCancelled, JobError
from app.jobs.queue import JobContext

logger = logging.getLogger("fretlab.pipeline.download")

# Fraction of the progress bar given to the network download; the rest is
# the ffmpeg convert step.
_DOWNLOAD_END = 0.85

BOT_CHECK_HINT = (
    "YouTube flagged this request as a possible bot. Fixes: update yt-dlp "
    "(pip install -U yt-dlp), or pass browser cookies via the "
    "cookiesfrombrowser option (CLI: --cookies-from-browser chrome). "
    "See docs/ROADMAP.md risk #2."
)


class DownloadError(JobError):
    """Download failed for a reason we can explain to the user."""


class VideoUnavailableError(DownloadError):
    pass


class BotCheckError(DownloadError):
    pass


class NetworkError(DownloadError):
    pass


async def download_song(ctx: JobContext) -> None:
    """Job handler for kind="download". ctx.song_id is the YouTube video id."""
    video_id = ctx.song_id
    song_dir = settings.media_root / video_id
    wav = song_dir / "source.wav"

    if wav.exists():
        _set_song(video_id, status="ready")
        ctx.report("cached", 1.0)
        return

    _set_song(video_id, status="downloading")
    try:
        song_dir.mkdir(parents=True, exist_ok=True)
        ctx.report("download", 0.0)
        info = await asyncio.to_thread(_download_blocking, video_id, song_dir, ctx)
        ctx.raise_if_cancelled()

        ctx.report("convert", _DOWNLOAD_END)
        source = _find_audio_file(song_dir)
        await _convert_to_wav(source, wav)
        source.unlink(missing_ok=True)

        _write_metadata(song_dir, info)
        _set_song(
            video_id,
            status="ready",
            title=info.get("title"),
            channel=info.get("channel") or info.get("uploader"),
            duration_s=int(info["duration"]) if info.get("duration") else None,
            thumbnail_url=info.get("thumbnail"),
        )
        ctx.report("done", 1.0)
    except BaseException:
        _set_song(video_id, status="error")
        if not wav.exists():  # drop the half-built cache dir
            shutil.rmtree(song_dir, ignore_errors=True)
        raise


def _download_blocking(video_id: str, song_dir, ctx: JobContext) -> dict:
    """Runs in a thread: fetch bestaudio + thumbnail, report progress via hook."""

    def hook(d: dict) -> None:
        if ctx.cancelled:
            raise JobCancelled()
        if d.get("status") == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            if total:
                frac = d.get("downloaded_bytes", 0) / total
                ctx.report_threadsafe("download", _DOWNLOAD_END * frac)
        elif d.get("status") == "finished":
            ctx.report_threadsafe("download", _DOWNLOAD_END)

    opts = {
        "format": "bestaudio/best",
        "outtmpl": {
            "default": str(song_dir / "audio.%(ext)s"),
            "thumbnail": str(song_dir / "thumbnail.%(ext)s"),
        },
        "writethumbnail": True,
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [hook],
        "retries": 3,
        "socket_timeout": 30,
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={video_id}", download=True
            )
            return ydl.sanitize_info(info)
    except JobCancelled:
        raise
    except yt_dlp.utils.DownloadError as e:
        if ctx.cancelled:  # yt-dlp may wrap the hook's JobCancelled
            raise JobCancelled() from e
        raise _map_ytdlp_error(e) from e


def _map_ytdlp_error(e: yt_dlp.utils.DownloadError) -> DownloadError:
    msg = str(e)
    low = msg.lower()
    if "sign in to confirm" in low or "not a bot" in low:
        return BotCheckError(BOT_CHECK_HINT)
    if (
        "video unavailable" in low
        or "incomplete youtube id" in low
        or "private video" in low
        or "has been removed" in low
        or "not available" in low
    ):
        return VideoUnavailableError(f"Video unavailable: {msg}")
    if (
        "getaddrinfo" in low
        or "timed out" in low
        or "connection" in low
        or "urlopen error" in low
    ):
        return NetworkError(f"Network error talking to YouTube — check connectivity and retry. ({msg})")
    return DownloadError(f"Download failed: {msg}")


def _find_audio_file(song_dir):
    candidates = [p for p in song_dir.glob("audio.*") if p.is_file()]
    if not candidates:
        raise DownloadError("Download finished but produced no audio file.")
    return candidates[0]


async def _convert_to_wav(source, wav) -> None:
    proc = await asyncio.create_subprocess_exec(
        "ffmpeg", "-y", "-i", str(source), "-vn", "-ar", "44100", "-ac", "2", str(wav),
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        tail = stderr.decode(errors="replace")[-500:]
        raise DownloadError(f"ffmpeg conversion failed (exit {proc.returncode}): {tail}")


def _write_metadata(song_dir, info: dict) -> None:
    meta = {
        "video_id": info.get("id"),
        "title": info.get("title"),
        "channel": info.get("channel") or info.get("uploader"),
        "duration_s": info.get("duration"),
        "thumbnail_url": info.get("thumbnail"),
        "webpage_url": info.get("webpage_url"),
        "upload_date": info.get("upload_date"),
    }
    (song_dir / "metadata.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
    )


def _set_song(video_id: str, *, status: str, **fields) -> None:
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:
            return
        song.status = status
        for key, value in fields.items():
            if value is not None:
                setattr(song, key, value)
