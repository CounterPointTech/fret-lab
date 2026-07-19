"""YouTube search via yt-dlp `ytsearch` flat extraction — no API key needed."""

import asyncio
import logging

import yt_dlp
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger("fretlab.api.search")

router = APIRouter(prefix="/api")

SEARCH_COUNT = 8


@router.get("/search")
async def search(q: str = Query(min_length=1, max_length=200)) -> dict:
    try:
        results = await asyncio.to_thread(_search_blocking, q)
    except yt_dlp.utils.DownloadError as e:
        logger.warning("YouTube search failed for %r: %s", q, e)
        raise HTTPException(status_code=502, detail=f"YouTube search failed: {e}") from e
    return {"results": results}


def _search_blocking(q: str) -> list[dict]:
    opts = {
        "extract_flat": "in_playlist",
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "socket_timeout": 15,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"ytsearch{SEARCH_COUNT}:{q}", download=False)

    results = []
    for entry in info.get("entries") or []:
        if not entry or not entry.get("id"):
            continue
        video_id = entry["id"]
        thumbnails = entry.get("thumbnails") or []
        thumbnail = (
            thumbnails[-1].get("url")
            if thumbnails
            else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        )
        results.append(
            {
                "video_id": video_id,
                "title": entry.get("title") or video_id,
                "channel": entry.get("channel") or entry.get("uploader"),
                "duration_s": int(entry["duration"]) if entry.get("duration") else None,
                "thumbnail_url": thumbnail,
            }
        )
    return results
