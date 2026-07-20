"""Serve cached media artifacts: stem audio (with Range support) and peaks.

Starlette's FileResponse handles HTTP Range requests natively, which is what
<audio> elements need for seeking.
"""

from fastapi import APIRouter, HTTPException
from fastapi import Path as PathParam
from fastapi.responses import FileResponse

from app.config import settings

router = APIRouter(prefix="/api/media")

# Same charset rule as api/songs.py — also blocks path traversal.
VIDEO_ID_PATTERN = r"^[A-Za-z0-9_-]{5,20}$"
STEM_PATTERN = r"^[a-z]{1,16}$"
# matches the sanitized names written by api/transcriptions.py; no slashes or
# leading dots, so no traversal
TRANSCRIPTION_FILE_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9 ._-]{0,120}$"


@router.get("/{video_id}/stems/{stem}.m4a")
async def stem_audio(
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
    stem: str = PathParam(pattern=STEM_PATTERN),
) -> FileResponse:
    path = settings.media_root / video_id / "stems" / f"{stem}.m4a"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Stem audio not found")
    return FileResponse(path, media_type="audio/mp4")


@router.get("/{video_id}/transcriptions/{filename}")
async def transcription_file(
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
    filename: str = PathParam(pattern=TRANSCRIPTION_FILE_PATTERN),
) -> FileResponse:
    path = settings.media_root / video_id / "transcriptions" / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Transcription file not found")
    return FileResponse(path, media_type="application/octet-stream")


@router.get("/{video_id}/peaks/{stem}.json")
async def stem_peaks(
    video_id: str = PathParam(pattern=VIDEO_ID_PATTERN),
    stem: str = PathParam(pattern=STEM_PATTERN),
) -> FileResponse:
    path = settings.media_root / video_id / "peaks" / f"{stem}.json"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Peaks not found")
    return FileResponse(path, media_type="application/json")
