"""Chord & key analysis: media/{videoId}/source.wav -> analysis/chords.json.

Template-based chroma chord recognition (librosa) with a switch-penalty DP
(Viterbi) smoothing pass, beat-synchronous segments, and key estimation from
the duration-weighted chord histogram scored against diatonic chord sets of
all 24 major/minor keys.

Why not autochord (the goal doc's first suggestion): it pins TensorFlow,
which fights the CUDA torch stack in this venv on Windows — the goal doc
allows exactly this librosa fallback.

Output schema (version 1):
    {"version": 1, "duration": s, "bpm": f, "key": {tonic, mode, name,
     confidence} | null, "chords": [{"start", "end", "label"}]}
Labels are "C", "F#m", ... or "N" (no chord). Sharps only — the frontend
normalizes/re-spells with tonal.js.
"""

import asyncio
import json
import logging
import os
import time
from collections.abc import Callable
from pathlib import Path

import numpy as np

from app.config import settings
from app.db.models import Song
from app.db.session import db_session
from app.jobs.errors import JobCancelled, JobError
from app.jobs.queue import JobContext

logger = logging.getLogger("fretlab.pipeline.chords")

PITCH_CLASSES = ("C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B")

# Label index space: 0 = N (no chord), 1..12 = majors, 13..24 = minors.
CHORD_LABELS: tuple[str, ...] = (
    "N",
    *(pc for pc in PITCH_CLASSES),
    *(f"{pc}m" for pc in PITCH_CLASSES),
)

_HOP = 512
_SR = 22050
# DP cost of changing chord label between adjacent beats. Tuned on synthetic
# progressions: high enough to kill one-beat flicker, low enough to keep
# real one-bar changes.
_SWITCH_PENALTY = 0.15
_MIN_SPAN_S = 0.3
# fallback score of the no-chord state; a decent triad match on harmonic
# content scores ~0.6–0.9, so N wins only when nothing fits
_NO_CHORD_SCORE = 0.5


class AnalysisError(JobError):
    """Analysis failed for a reason we can explain to the user."""


# -- pure helpers (unit tested) ---------------------------------------------


def chord_templates() -> np.ndarray:
    """(25, 12) L2-normalized binary triad templates; row 0 is the flat
    no-chord template."""
    t = np.zeros((len(CHORD_LABELS), 12))
    t[0, :] = 1.0
    for root in range(12):
        for offset in (0, 4, 7):  # major triad
            t[1 + root, (root + offset) % 12] = 1.0
        for offset in (0, 3, 7):  # minor triad
            t[13 + root, (root + offset) % 12] = 1.0
    return t / np.linalg.norm(t, axis=1, keepdims=True)


def smooth_labels(scores: np.ndarray, switch_penalty: float = _SWITCH_PENALTY) -> np.ndarray:
    """Best label sequence maximizing sum of per-segment template scores
    minus `switch_penalty` per label change (25-state Viterbi; transitions
    are label-independent so each step only needs the global best)."""
    n_states, n = scores.shape
    if n == 0:
        return np.zeros(0, dtype=np.int32)
    dp = scores[:, 0].copy()
    back = np.zeros((n_states, n), dtype=np.int32)
    states = np.arange(n_states)
    back[:, 0] = states
    for t in range(1, n):
        best_prev = int(np.argmax(dp))
        switch_score = dp[best_prev] - switch_penalty
        take_switch = switch_score > dp
        back[:, t] = np.where(take_switch, best_prev, states)
        dp = np.where(take_switch, switch_score, dp) + scores[:, t]
    labels = np.zeros(n, dtype=np.int32)
    labels[-1] = int(np.argmax(dp))
    for t in range(n - 1, 0, -1):
        labels[t - 1] = back[labels[t], t]
    return labels


def spans_from_labels(labels: np.ndarray, boundaries: np.ndarray) -> list[dict]:
    """Merge consecutive identical labels into [{start, end, label}] spans.

    `boundaries` has len(labels) + 1 entries (segment edge times, seconds).
    """
    if len(boundaries) != len(labels) + 1:
        raise ValueError("boundaries must have exactly one more entry than labels")
    spans: list[dict] = []
    start = 0
    for i in range(1, len(labels) + 1):
        if i == len(labels) or labels[i] != labels[start]:
            spans.append(
                {
                    "start": round(float(boundaries[start]), 3),
                    "end": round(float(boundaries[i]), 3),
                    "label": CHORD_LABELS[int(labels[start])],
                }
            )
            start = i
    return spans


def merge_short_spans(spans: list[dict], min_duration: float = _MIN_SPAN_S) -> list[dict]:
    """Absorb spans shorter than min_duration into their previous neighbor
    (leading runts donate their time forward), re-merging identical labels."""
    merged: list[dict] = []
    carry_start: float | None = None
    for span in spans:
        start = carry_start if carry_start is not None else span["start"]
        carry_start = None
        if span["end"] - start < min_duration:
            if merged:
                merged[-1]["end"] = span["end"]
            else:
                carry_start = start
            continue
        if merged and merged[-1]["label"] == span["label"]:
            merged[-1]["end"] = span["end"]
        else:
            merged.append({"start": start, "end": span["end"], "label": span["label"]})
    if not merged:  # nothing survived the filter — keep the input untouched
        return [dict(s) for s in spans]
    return merged


def _parse_label(label: str) -> tuple[int, bool] | None:
    """"F#m" -> (6, True); "N" -> None."""
    if label == "N":
        return None
    minor = label.endswith("m")
    root = label[:-1] if minor else label
    return PITCH_CLASSES.index(root), minor


# (semitone offset from tonic, is_minor_chord, weight) — diatonic triads,
# tonic and dominant weighted up. Minor keys admit both v and V (harmonic).
_MAJOR_KEY_CHORDS = (
    (0, False, 1.5), (5, False, 1.0), (7, False, 1.2),
    (9, True, 1.0), (2, True, 0.7), (4, True, 0.5),
)
_MINOR_KEY_CHORDS = (
    (0, True, 1.5), (5, True, 1.0), (7, True, 0.8), (7, False, 1.0),
    (3, False, 1.0), (8, False, 0.8), (10, False, 0.8),
    # power-chord tonics (no 3rd) often template-match major — credit a
    # major-labeled tonic toward the minor key, below the true-minor weight
    (0, False, 0.9),
)


def estimate_key(spans: list[dict]) -> dict | None:
    """Duration-weighted chord histogram scored against all 24 keys."""
    hist: dict[tuple[int, bool], float] = {}
    total = 0.0
    for span in spans:
        parsed = _parse_label(span["label"])
        if parsed is None:
            continue
        dur = max(0.0, float(span["end"]) - float(span["start"]))
        hist[parsed] = hist.get(parsed, 0.0) + dur
        total += dur
    if total <= 0:
        return None

    scored: list[tuple[float, int, str]] = []
    for tonic in range(12):
        for mode, chords in (("major", _MAJOR_KEY_CHORDS), ("minor", _MINOR_KEY_CHORDS)):
            score = sum(
                weight * hist.get(((tonic + offset) % 12, is_min), 0.0)
                for offset, is_min, weight in chords
            )
            scored.append((score, tonic, mode))
    scored.sort(reverse=True)
    (best, tonic, mode), (second, *_) = scored[0], scored[1]
    if best <= 0:
        return None
    name = f"{PITCH_CLASSES[tonic]} {mode}"
    confidence = round(max(0.0, min(1.0, (best - second) / best)), 3)
    return {"tonic": PITCH_CLASSES[tonic], "mode": mode, "name": name, "confidence": confidence}


def chords_json_path(video_id: str) -> Path:
    return settings.media_root / video_id / "analysis" / "chords.json"


# -- blocking DSP (runs in a thread) ----------------------------------------

ReportFn = Callable[[str, float], None]


def analyze_blocking(
    source: Path, report: ReportFn, is_cancelled: Callable[[], bool]
) -> dict:
    import librosa  # heavy import — keep lazy

    t0 = time.perf_counter()
    y, sr = librosa.load(str(source), sr=_SR, mono=True)
    if y.size < sr:  # < 1s of audio
        raise AnalysisError("Audio is too short to analyze.")
    if is_cancelled():
        raise JobCancelled()

    report("harmonics", 0.15)
    y_harm = librosa.effects.harmonic(y)
    if is_cancelled():
        raise JobCancelled()

    report("chroma", 0.40)
    chroma = librosa.feature.chroma_cqt(y=y_harm, sr=sr, hop_length=_HOP)
    if is_cancelled():
        raise JobCancelled()

    report("beats", 0.70)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, hop_length=_HOP)
    bpm = float(np.atleast_1d(tempo)[0])
    n_frames = chroma.shape[1]
    beat_frames = beat_frames[(beat_frames > 0) & (beat_frames < n_frames)]
    if len(beat_frames) < 4:
        # beat tracking failed (rubato/ambient) — fixed half-second grid
        step = int(round(0.5 * sr / _HOP))
        beat_frames = np.arange(step, n_frames, step)
    edges = np.unique(np.concatenate(([0], beat_frames, [n_frames])))

    report("chords", 0.80)
    segments = librosa.util.sync(chroma, beat_frames, aggregate=np.median)
    norms = np.linalg.norm(segments, axis=0, keepdims=True)
    segments = segments / np.maximum(norms, 1e-9)
    scores = chord_templates() @ segments
    # "No chord" is a fixed prior, not the uniform-template correlation:
    # real-audio chroma is diffuse enough that a flat template out-correlates
    # every triad. High N only for near-silence.
    scores[0, :] = _NO_CHORD_SCORE
    scores[0, (norms < 1e-6).ravel()] = 1.0

    labels = smooth_labels(scores)
    boundaries = librosa.frames_to_time(edges, sr=sr, hop_length=_HOP)
    spans = merge_short_spans(spans_from_labels(labels, boundaries))
    key = estimate_key(spans)
    logger.info(
        "Analyzed %s in %.1fs: %d chord spans, key=%s, bpm=%.1f",
        source.parent.name, time.perf_counter() - t0, len(spans),
        key["name"] if key else "?", bpm,
    )
    return {
        "version": 1,
        "duration": round(len(y) / sr, 3),
        "bpm": round(bpm, 1),
        "key": key,
        "chords": spans,
    }


# -- job handler ------------------------------------------------------------


async def analyze_song(ctx: JobContext) -> None:
    """Job handler for kind="analyze": chords + key -> analysis/chords.json."""
    video_id = ctx.song_id
    out = chords_json_path(video_id)

    if out.exists():
        logger.info("Analysis cache hit for %s — completing instantly", video_id)
        try:
            payload = json.loads(out.read_text(encoding="utf-8"))
        except (OSError, ValueError) as e:
            logger.warning("Corrupt chords.json for %s (%s) — reanalyzing", video_id, e)
            out.unlink(missing_ok=True)
        else:
            _store_song_analysis(video_id, payload)
            ctx.report("cached", 1.0)
            return

    source = settings.media_root / video_id / "source.wav"
    if not source.exists():
        raise AnalysisError("Source audio is missing — re-download the song first.")

    ctx.report("load", 0.05)
    payload = await asyncio.to_thread(
        analyze_blocking, source, ctx.report_threadsafe, lambda: ctx.cancelled
    )
    ctx.raise_if_cancelled()

    ctx.report("write", 0.95)
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = out.with_name("chords.json.tmp")
    tmp.write_text(json.dumps(payload), encoding="utf-8")
    os.replace(tmp, out)
    _store_song_analysis(video_id, payload)


def _store_song_analysis(video_id: str, payload: dict) -> None:
    with db_session() as db:
        song = db.get(Song, video_id)
        if song is None:  # deleted mid-run
            return
        key = payload.get("key") or {}
        song.key_name = key.get("name")
        song.bpm = payload.get("bpm")
