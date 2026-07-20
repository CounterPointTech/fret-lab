"""Separation stage: media/{videoId}/source.wav -> 6 stems + m4a + peaks.

Cascade recipe (see docs/goals/phase-2-separation.md): BS-RoFormer pulls
vocals off the full mix at top quality, then htdemucs_6s splits the
instrumental into drums/bass/guitar/piano/other. Models auto-download into
models/ on first use and stay loaded in-process between jobs (warm cache).

Cache semantics: if all stem artifacts already exist for the videoId the job
completes instantly — never reprocess.
"""

import asyncio
import gc
import json
import logging
import time
from collections.abc import Callable
from pathlib import Path

from sqlalchemy import select

from app.config import settings
from app.db.models import Stem
from app.db.session import db_session
from app.jobs.errors import JobCancelled, JobError
from app.jobs.queue import JobContext
from app.pipeline.encode import encode_stem
from app.pipeline.peaks import write_peaks

logger = logging.getLogger("fretlab.pipeline.separate")

VOCAL_MODEL = "model_bs_roformer_ep_317_sdr_12.9755.ckpt"
INSTRUMENT_MODEL = "htdemucs_6s.yaml"
STEM_NAMES = ("vocals", "drums", "bass", "guitar", "piano", "other")

# progress budget: [0, .45) vocals split, [.45, .80) instrument split,
# [.80, .92) encode, [.92, 1] peaks
_P_VOCALS_END = 0.45
_P_SEPARATE_END = 0.80
_P_ENCODE_END = 0.92

ReportFn = Callable[[str, float], None]


class SeparationError(JobError):
    """Separation failed for a reason we can explain to the user."""


# (model_filename, low_memory) -> loaded audio_separator Separator instance.
# Module-level so consecutive jobs skip the multi-second model load.
_separators: dict[tuple[str, bool], object] = {}


def reset_model_cache() -> None:
    _separators.clear()


async def separate_song(ctx: JobContext) -> None:
    """Job handler for kind="separate": separate -> encode -> peaks."""
    video_id = ctx.song_id
    song_dir = settings.media_root / video_id
    stems_dir = song_dir / "stems"
    peaks_dir = song_dir / "peaks"

    if _cache_complete(stems_dir, peaks_dir):
        logger.info("Separation cache hit for %s — completing instantly", video_id)
        _upsert_stems(video_id, _durations_from_peaks(peaks_dir))
        ctx.enqueue_followup("analyze")
        ctx.report("cached", 1.0)
        return

    source = song_dir / "source.wav"
    if not source.exists():
        raise SeparationError("Source audio is missing — re-download the song first.")

    t0 = time.perf_counter()
    await asyncio.to_thread(
        _separate_blocking, source, stems_dir, ctx.report_threadsafe, lambda: ctx.cancelled
    )
    ctx.raise_if_cancelled()

    for i, name in enumerate(STEM_NAMES):
        ctx.raise_if_cancelled()
        span = _P_ENCODE_END - _P_SEPARATE_END
        ctx.report("encode", _P_SEPARATE_END + span * i / len(STEM_NAMES))
        await encode_stem(stems_dir / f"{name}.wav", stems_dir / f"{name}.m4a")

    durations: dict[str, float | None] = {}
    for i, name in enumerate(STEM_NAMES):
        ctx.raise_if_cancelled()
        span = 1.0 - _P_ENCODE_END
        ctx.report("peaks", _P_ENCODE_END + span * i / len(STEM_NAMES))
        durations[name] = await asyncio.to_thread(
            write_peaks, stems_dir / f"{name}.wav", peaks_dir / f"{name}.json"
        )

    _upsert_stems(video_id, durations)
    # chord/key analysis chains automatically once stems exist (cache-aware)
    ctx.enqueue_followup("analyze")
    logger.info(
        "Separated %s end-to-end in %.1fs (6 stems + m4a + peaks)",
        video_id,
        time.perf_counter() - t0,
    )


# -- blocking GPU work (runs in a thread) ----------------------------------


def _separate_blocking(
    source: Path, stems_dir: Path, report: ReportFn, is_cancelled: Callable[[], bool]
) -> None:
    stems_dir.mkdir(parents=True, exist_ok=True)
    if is_cancelled():
        raise JobCancelled()

    # NB: audio-separator sanitizes custom names (strips leading "_."), so
    # intermediate files use a tmp_ prefix instead.
    _run_model(
        VOCAL_MODEL,
        source,
        stems_dir,
        {"Vocals": "vocals", "Instrumental": "tmp_instrumental"},
        report,
        stage="vocals",
        progress=0.02,
    )
    if is_cancelled():
        raise JobCancelled()

    instrumental = stems_dir / "tmp_instrumental.wav"
    if not (stems_dir / "vocals.wav").exists() or not instrumental.exists():
        raise SeparationError("Vocal separation did not produce the expected tracks.")

    _run_model(
        INSTRUMENT_MODEL,
        instrumental,
        stems_dir,
        {
            "Drums": "drums",
            "Bass": "bass",
            "Guitar": "guitar",
            "Piano": "piano",
            "Other": "other",
            # near-silent residual (input is already de-vocaled) — discarded
            "Vocals": "tmp_residual_vocals",
        },
        report,
        stage="instruments",
        progress=_P_VOCALS_END,
    )
    instrumental.unlink(missing_ok=True)
    (stems_dir / "tmp_residual_vocals.wav").unlink(missing_ok=True)

    missing = [n for n in STEM_NAMES if not (stems_dir / f"{n}.wav").exists()]
    if missing:
        raise SeparationError(
            "Separation finished but stems are missing: " + ", ".join(missing)
        )


def _run_model(
    model_filename: str,
    input_path: Path,
    out_dir: Path,
    output_names: dict[str, str],
    report: ReportFn,
    *,
    stage: str,
    progress: float,
) -> None:
    """Run one model with a single low-memory retry on GPU OOM."""
    try:
        _run_model_once(
            model_filename, input_path, out_dir, output_names, report,
            stage=stage, progress=progress, low_memory=False,
        )
    except (JobError, JobCancelled):
        raise
    except Exception as e:
        if not _is_gpu_oom(e):
            raise
        logger.warning(
            "GPU OOM running %s on %s — freeing VRAM and retrying with smaller segments",
            model_filename, input_path.name,
        )
        _free_gpu()
        try:
            _run_model_once(
                model_filename, input_path, out_dir, output_names, report,
                stage=stage, progress=progress, low_memory=True,
            )
        except Exception as retry_err:
            if _is_gpu_oom(retry_err):
                raise SeparationError(
                    f"GPU ran out of memory separating {input_path.name}, even with "
                    "reduced segment size. Close other GPU apps and retry."
                ) from retry_err
            raise


def _run_model_once(
    model_filename: str,
    input_path: Path,
    out_dir: Path,
    output_names: dict[str, str],
    report: ReportFn,
    *,
    stage: str,
    progress: float,
    low_memory: bool,
) -> None:
    sep = _get_separator(model_filename, report, progress, low_memory=low_memory)
    # The loaded model captured output_dir at load time — re-point the warm
    # instance at this song's dir before every run.
    sep.output_dir = str(out_dir)
    if getattr(sep, "model_instance", None) is not None:
        sep.model_instance.output_dir = str(out_dir)
    report(stage, progress)
    t0 = time.perf_counter()
    sep.separate(str(input_path), custom_output_names=dict(output_names))
    logger.info(
        "%s on %s took %.1fs%s",
        model_filename, input_path.name, time.perf_counter() - t0,
        " (low-memory mode)" if low_memory else "",
    )


def _get_separator(
    model_filename: str, report: ReportFn, progress: float, *, low_memory: bool
):
    key = (model_filename, low_memory)
    cached = _separators.get(key)
    if cached is not None:
        logger.info("Model %s already loaded (warm cache, load time ≈ 0s)", model_filename)
        return cached

    from audio_separator.separator import Separator  # heavy import — keep lazy

    settings.models_dir.mkdir(parents=True, exist_ok=True)
    if not (settings.models_dir / model_filename).exists():
        # first use — audio-separator will download the checkpoint
        report("model-download", progress)

    kwargs: dict = {}
    if low_memory:
        kwargs = {
            "demucs_params": {
                "segment_size": 12, "shifts": 1, "overlap": 0.25, "segments_enabled": True,
            },
            "mdxc_params": {
                "segment_size": 128, "override_model_segment_size": True,
                "batch_size": 1, "overlap": 8, "pitch_shift": 0,
            },
        }
    sep = Separator(
        log_level=logging.WARNING,
        model_file_dir=str(settings.models_dir),
        output_format="WAV",
        **kwargs,
    )
    t0 = time.perf_counter()
    sep.load_model(model_filename=model_filename)
    logger.info(
        "Loaded model %s in %.1fs (low_memory=%s)",
        model_filename, time.perf_counter() - t0, low_memory,
    )
    _separators[key] = sep
    return sep


def _is_gpu_oom(e: BaseException) -> bool:
    return type(e).__name__ == "OutOfMemoryError" or "out of memory" in str(e).lower()


def _free_gpu() -> None:
    _separators.clear()
    gc.collect()
    try:
        import torch

        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except Exception:
        logger.exception("Could not empty CUDA cache after OOM")


# -- cache + DB bookkeeping ------------------------------------------------


def _cache_complete(stems_dir: Path, peaks_dir: Path) -> bool:
    return all(
        (stems_dir / f"{n}.wav").exists()
        and (stems_dir / f"{n}.m4a").exists()
        and (peaks_dir / f"{n}.json").exists()
        for n in STEM_NAMES
    )


def _durations_from_peaks(peaks_dir: Path) -> dict[str, float | None]:
    durations: dict[str, float | None] = {}
    for name in STEM_NAMES:
        try:
            payload = json.loads((peaks_dir / f"{name}.json").read_text(encoding="utf-8"))
            durations[name] = float(payload["duration"])
        except (OSError, ValueError, KeyError, TypeError) as e:
            logger.warning("Could not read duration from peaks for %s: %s", name, e)
            durations[name] = None
    return durations


def _upsert_stems(video_id: str, durations: dict[str, float | None]) -> None:
    with db_session() as db:
        for name in STEM_NAMES:
            stem = db.scalar(
                select(Stem).where(Stem.song_id == video_id, Stem.name == name)
            )
            if stem is None:
                stem = Stem(song_id=video_id, name=name)
                db.add(stem)
            stem.wav_path = f"{video_id}/stems/{name}.wav"
            stem.m4a_path = f"{video_id}/stems/{name}.m4a"
            stem.peaks_path = f"{video_id}/peaks/{name}.json"
            stem.duration_s = durations.get(name)
