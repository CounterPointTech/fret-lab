"""Peaks stage: stem .wav -> min/max waveform buckets JSON.

Output format (consumed by wavesurfer v7 as precomputed peaks — it accepts
an interleaved [min, max, min, max, ...] array of floats in [-1, 1]):

    {"version": 1, "bucket_count": N, "duration": seconds, "peaks": [...]}
"""

import json
from pathlib import Path

import numpy as np
import soundfile as sf

from app.jobs.errors import JobError

BUCKET_COUNT = 1000


class PeaksError(JobError):
    """Peak extraction failed."""


def write_peaks(wav: Path, out_json: Path, bucket_count: int = BUCKET_COUNT) -> float:
    """Compute per-bucket min/max for `wav`, write JSON, return duration (s)."""
    try:
        data, sample_rate = sf.read(wav, dtype="float32", always_2d=True)
    except (sf.LibsndfileError, RuntimeError, OSError) as e:
        raise PeaksError(f"Could not read {wav.name} for peak extraction: {e}") from e

    mono = data.mean(axis=1)
    n = len(mono)
    if n == 0 or sample_rate <= 0:
        raise PeaksError(f"{wav.name} contains no audio samples")
    duration = n / sample_rate

    bucket_count = min(bucket_count, n)
    edges = np.linspace(0, n, bucket_count + 1, dtype=np.int64)
    peaks: list[float] = []
    for i in range(bucket_count):
        seg = mono[edges[i] : edges[i + 1]]
        peaks.append(round(float(seg.min()), 4))
        peaks.append(round(float(seg.max()), 4))

    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(
        json.dumps(
            {
                "version": 1,
                "bucket_count": bucket_count,
                "duration": round(duration, 3),
                "peaks": peaks,
            }
        ),
        encoding="utf-8",
    )
    return duration
