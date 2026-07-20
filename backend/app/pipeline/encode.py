"""Encode stage: stem .wav -> browser-friendly .m4a (AAC ~192 kbps)."""

import asyncio
from pathlib import Path

from app.jobs.errors import JobError


class EncodeError(JobError):
    """ffmpeg AAC encode failed."""


async def encode_stem(wav: Path, m4a: Path) -> None:
    m4a.parent.mkdir(parents=True, exist_ok=True)
    proc = await asyncio.create_subprocess_exec(
        "ffmpeg", "-y", "-i", str(wav),
        "-vn", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
        str(m4a),
        stdout=asyncio.subprocess.DEVNULL,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        m4a.unlink(missing_ok=True)  # never leave a truncated file in the cache
        tail = stderr.decode(errors="replace")[-500:]
        raise EncodeError(
            f"ffmpeg AAC encode failed for {wav.name} (exit {proc.returncode}): {tail}"
        )
