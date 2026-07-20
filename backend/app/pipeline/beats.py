"""Beat/tempo estimation and grid quantization for transcription drafts.

Grid model v1 (matches the frontend's SyncModel): a fixed BPM plus the offset
in seconds where grid step 0 lands in the audio. Steps are 1/16 notes by
default (steps_per_quarter=4).
"""

import logging
from dataclasses import dataclass
from pathlib import Path

from app.jobs.errors import JobError

logger = logging.getLogger("fretlab.pipeline.beats")

DEFAULT_BPM = 120.0
DEFAULT_STEPS_PER_QUARTER = 4  # 1/16 resolution


class BeatsError(JobError):
    """Beat analysis failed for a reason we can explain to the user."""


@dataclass(frozen=True)
class NoteEvent:
    """One detected note, in seconds (Basic Pitch output)."""

    start_s: float
    end_s: float
    pitch: int  # MIDI
    amplitude: float  # 0..1


@dataclass(frozen=True)
class QuantNote:
    """One note snapped to the beat grid."""

    step: int  # grid index from the grid offset (>= 0)
    dur_steps: int  # >= 1
    pitch: int  # MIDI
    velocity: int  # 1..127


def estimate_grid(wav_path: Path) -> tuple[float, float]:
    """Estimate (bpm, offset_s) for a stem. Never raises for 'boring' audio —
    falls back to 120 BPM / 0 offset so a draft can always be produced."""
    import librosa  # heavy import — keep lazy
    import numpy as np

    try:
        y, sr = librosa.load(str(wav_path), sr=22050, mono=True)
    except Exception as e:
        raise BeatsError(f"Could not read audio for beat analysis: {e}") from e
    if y.size == 0:
        return DEFAULT_BPM, 0.0

    try:
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, trim=False)
    except Exception:
        logger.exception("beat_track failed; falling back to %s BPM", DEFAULT_BPM)
        return DEFAULT_BPM, 0.0

    bpm = float(np.atleast_1d(tempo)[0])
    if not np.isfinite(bpm) or bpm <= 0:
        return DEFAULT_BPM, 0.0
    # fold tempo-octave errors into a sane practice range
    while bpm < 60:
        bpm *= 2
    while bpm > 200:
        bpm /= 2

    beat_times = librosa.frames_to_time(np.atleast_1d(beat_frames), sr=sr)
    beat_s = 60.0 / bpm
    # phase of the beat grid: earliest grid point in [0, one beat)
    offset_s = float(beat_times[0] % beat_s) if beat_times.size else 0.0
    return bpm, offset_s


def quantize(
    notes: list[NoteEvent],
    bpm: float,
    offset_s: float,
    steps_per_quarter: int = DEFAULT_STEPS_PER_QUARTER,
) -> list[QuantNote]:
    """Snap note starts/durations to the grid. Starts before the grid clamp to
    step 0; durations round to the nearest step but never below one step."""
    if bpm <= 0:
        raise ValueError(f"bpm must be positive, got {bpm}")
    step_s = 60.0 / bpm / steps_per_quarter
    out: list[QuantNote] = []
    for n in notes:
        step = max(0, round((n.start_s - offset_s) / step_s))
        dur = max(1, round((n.end_s - n.start_s) / step_s))
        velocity = min(127, max(1, round(n.amplitude * 127)))
        out.append(QuantNote(step=step, dur_steps=dur, pitch=int(n.pitch), velocity=velocity))
    out.sort(key=lambda q: (q.step, q.pitch))

    # after snapping, the same pitch can land twice on one step — keep the longer
    deduped: dict[tuple[int, int], QuantNote] = {}
    for q in out:
        key = (q.step, q.pitch)
        prev = deduped.get(key)
        if prev is None or q.dur_steps > prev.dur_steps:
            deduped[key] = q
    return sorted(deduped.values(), key=lambda q: (q.step, q.pitch))
