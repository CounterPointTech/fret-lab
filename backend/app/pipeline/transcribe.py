"""Transcription stage: stem WAV -> Basic Pitch notes -> beat grid ->
DP fret assignment -> MIDI + MusicXML + alphaTex draft.

Outputs land in media/{videoId}/transcriptions/ as ai_{stem}_{uid}.{mid,
musicxml,atex} plus a .params.json sidecar with every parameter that produced
the draft (reproducibility). A Transcription row (source="generated") points
at the MusicXML, pre-filled with the detected sync bpm/offset so the tab
viewer cursor-syncs immediately.
"""

import asyncio
import json
import logging
import time
import uuid
import xml.etree.ElementTree as ET
from pathlib import Path

from app.config import settings
from app.db.models import Transcription
from app.db.session import db_session
from app.jobs.errors import JobError
from app.jobs.queue import JobContext
from app.pipeline.beats import NoteEvent, estimate_grid, quantize
from app.pipeline.fret_assign import TUNINGS, assign_frets, group_events
from app.pipeline.score_out import to_alphatex, to_musicxml

logger = logging.getLogger("fretlab.pipeline.transcribe")

BASIC_PITCH_MODEL = "icassp_2022"

DEFAULT_PARAMS = {
    "stem": "guitar",
    "tuning": None,  # None -> standard, or bass_standard for the bass stem
    "capo": 0,
    "onset_threshold": 0.5,
    "frame_threshold": 0.3,
    "min_note_length_ms": 58.0,
}

# progress budget: detect dominates
_P_DETECT = 0.10
_P_BEATS = 0.60
_P_FRETS = 0.75
_P_WRITE = 0.90


class TranscriptionError(JobError):
    """Transcription failed for a reason we can explain to the user."""


def resolve_params(raw: dict) -> dict:
    """Fill defaults and resolve the tuning name for the chosen stem."""
    params = {**DEFAULT_PARAMS, **{k: v for k, v in raw.items() if v is not None}}
    if params["tuning"] is None:
        params["tuning"] = "bass_standard" if params["stem"] == "bass" else "standard"
    if params["tuning"] not in TUNINGS:
        raise TranscriptionError(
            f"Unknown tuning {params['tuning']!r}. Available: {', '.join(sorted(TUNINGS))}"
        )
    return params


async def transcribe_song(ctx: JobContext) -> None:
    """Job handler for kind="transcribe"."""
    video_id = ctx.song_id
    params = resolve_params(ctx.params)
    stem = params["stem"]
    tuning = TUNINGS[params["tuning"]]
    capo = int(params["capo"])

    wav = settings.media_root / video_id / "stems" / f"{stem}.wav"
    if not wav.exists():
        raise TranscriptionError(
            f"The {stem} stem is missing — run separation first."
        )

    t0 = time.perf_counter()
    ctx.report("detect", _P_DETECT)
    notes, midi_data = await asyncio.to_thread(
        detect_notes,
        wav,
        float(params["onset_threshold"]),
        float(params["frame_threshold"]),
        float(params["min_note_length_ms"]),
        tuning,
        capo,
    )
    ctx.raise_if_cancelled()
    if not notes:
        raise TranscriptionError(
            f"No notes detected in the {stem} stem — try lowering the onset/frame "
            "thresholds, or pick a different stem."
        )
    logger.info("Basic Pitch found %d notes in %s/%s", len(notes), video_id, stem)

    ctx.report("beats", _P_BEATS)
    bpm, offset_s = await asyncio.to_thread(estimate_grid, wav)
    qnotes = quantize(notes, bpm, offset_s)
    ctx.raise_if_cancelled()

    ctx.report("frets", _P_FRETS)
    events = group_events(qnotes, max_polyphony=len(tuning))
    tab_events = await asyncio.to_thread(assign_frets, events, tuning, capo)
    ctx.raise_if_cancelled()

    ctx.report("write", _P_WRITE)
    title = f"AI draft — {stem}"
    tdir = settings.media_root / video_id / "transcriptions"
    tdir.mkdir(parents=True, exist_ok=True)
    base = f"ai_{stem}_{uuid.uuid4().hex[:8]}"

    xml_text = to_musicxml(tab_events, bpm, tuning, capo, title)
    try:
        ET.fromstring(xml_text)  # writer bug guard: never persist malformed XML
    except ET.ParseError as e:
        raise TranscriptionError(f"Generated MusicXML is malformed: {e}") from e

    params_payload = {
        **params,
        "model": BASIC_PITCH_MODEL,
        "detected_bpm": bpm,
        "detected_offset_s": offset_s,
        "note_count": len(notes),
        "event_count": len(tab_events),
    }
    midi_data.write(str(tdir / f"{base}.mid"))
    (tdir / f"{base}.musicxml").write_text(xml_text, encoding="utf-8")
    (tdir / f"{base}.atex").write_text(
        to_alphatex(tab_events, bpm, tuning, capo, title), encoding="utf-8"
    )
    (tdir / f"{base}.params.json").write_text(
        json.dumps(params_payload, indent=2), encoding="utf-8"
    )

    with db_session() as db:
        db.add(
            Transcription(
                song_id=video_id,
                name=title,
                kind="musicxml",
                path=f"{video_id}/transcriptions/{base}.musicxml",
                sync_bpm=bpm,
                sync_offset_s=offset_s,
                source="generated",
                params_json=json.dumps(params_payload),
            )
        )
    logger.info(
        "Transcribed %s/%s in %.1fs: %d notes -> %d events at %.1f BPM (offset %.2fs)",
        video_id, stem, time.perf_counter() - t0, len(notes), len(tab_events), bpm, offset_s,
    )


def detect_notes(
    wav: Path,
    onset_threshold: float,
    frame_threshold: float,
    min_note_length_ms: float,
    tuning: tuple[int, ...],
    capo: int,
) -> tuple[list[NoteEvent], object]:
    """Blocking Basic Pitch inference. Returns (note events, PrettyMIDI)."""
    import librosa

    from basic_pitch import ICASSP_2022_MODEL_PATH  # heavy import — keep lazy
    from basic_pitch.inference import predict

    # bound detection to the instrument's actual range to cut octave errors
    min_freq = librosa.midi_to_hz(tuning[0] + capo) * 0.95
    max_freq = librosa.midi_to_hz(tuning[-1] + capo + 24) * 1.2

    try:
        _model_output, midi_data, note_events = predict(
            str(wav),
            ICASSP_2022_MODEL_PATH,
            onset_threshold=onset_threshold,
            frame_threshold=frame_threshold,
            minimum_note_length=min_note_length_ms,
            minimum_frequency=float(min_freq),
            maximum_frequency=float(max_freq),
        )
    except Exception as e:
        raise TranscriptionError(f"Note detection failed: {e}") from e

    notes = [
        NoteEvent(start_s=float(s), end_s=float(e), pitch=int(p), amplitude=float(a))
        for s, e, p, a, *_bends in note_events
    ]
    notes.sort(key=lambda n: (n.start_s, n.pitch))
    return notes, midi_data
