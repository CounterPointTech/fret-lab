"""Separation pipeline: cache-hit short-circuit, OOM retry, chained stages,
stems/media APIs, delete clearing the cache."""

import asyncio
import json
import time

import numpy as np
import pytest
import soundfile as sf

from app.config import settings
from app.db.models import Song, Stem
from app.db.session import db_session, init_db
from app.jobs.errors import JobCancelled
from app.pipeline import separate as sep_mod
from app.pipeline.encode import EncodeError, encode_stem
from app.pipeline.peaks import PeaksError, write_peaks
from app.pipeline.separate import STEM_NAMES, SeparationError, separate_song

VID = "vid_sep_00001"


class StubCtx:
    def __init__(self, song_id: str) -> None:
        self.job_id = "job_test"
        self.song_id = song_id
        self.reports: list[tuple[str, float]] = []
        self.cancelled = False

    def report(self, stage: str, progress: float) -> None:
        self.reports.append((stage, progress))

    def report_threadsafe(self, stage: str, progress: float) -> None:
        self.reports.append((stage, progress))

    def raise_if_cancelled(self) -> None:
        if self.cancelled:
            raise JobCancelled()


def _add_song(status: str = "ready") -> None:
    init_db()
    with db_session() as db:
        db.add(Song(video_id=VID, title="sep test song", status=status))


def _write_wav(path, seconds: float = 0.25) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    t = np.linspace(0, seconds, int(44100 * seconds), endpoint=False)
    tone = (0.5 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    sf.write(path, np.stack([tone, tone], axis=1), 44100)


def _fake_cache(video_id: str) -> None:
    """Lay down a complete stems/peaks cache on disk."""
    song_dir = settings.media_root / video_id
    for name in STEM_NAMES:
        _write_wav(song_dir / "stems" / f"{name}.wav")
        (song_dir / "stems" / f"{name}.m4a").write_bytes(b"\x00" * 64)
        peaks = song_dir / "peaks" / f"{name}.json"
        peaks.parent.mkdir(parents=True, exist_ok=True)
        peaks.write_text(json.dumps({"version": 1, "duration": 0.25, "peaks": [0, 0]}))


# -- handler ---------------------------------------------------------------


def test_cache_hit_completes_instantly_and_upserts_rows(tmp_env):
    _add_song()
    _fake_cache(VID)
    ctx = StubCtx(VID)

    t0 = time.perf_counter()
    asyncio.run(separate_song(ctx))
    elapsed = time.perf_counter() - t0

    assert ctx.reports == [("cached", 1.0)]
    assert elapsed < 2.0  # no models, no ffmpeg
    with db_session() as db:
        stems = db.query(Stem).filter_by(song_id=VID).all()
        assert {s.name for s in stems} == set(STEM_NAMES)
        assert all(s.duration_s == 0.25 for s in stems)


def test_missing_source_raises_user_facing_error(tmp_env):
    _add_song()
    ctx = StubCtx(VID)
    with pytest.raises(SeparationError, match="re-download"):
        asyncio.run(separate_song(ctx))


def test_full_chain_encodes_and_writes_peaks(tmp_env, monkeypatch):
    """separate (mocked) -> encode (real ffmpeg) -> peaks (real) -> DB rows."""
    _add_song()
    song_dir = settings.media_root / VID
    _write_wav(song_dir / "source.wav")

    def fake_blocking(source, stems_dir, report, is_cancelled):
        report("vocals", 0.02)
        for name in STEM_NAMES:
            _write_wav(stems_dir / f"{name}.wav")

    monkeypatch.setattr(sep_mod, "_separate_blocking", fake_blocking)
    ctx = StubCtx(VID)
    asyncio.run(separate_song(ctx))

    stages = [s for s, _ in ctx.reports]
    assert "encode" in stages and "peaks" in stages
    for name in STEM_NAMES:
        assert (song_dir / "stems" / f"{name}.wav").exists()
        assert (song_dir / "stems" / f"{name}.m4a").stat().st_size > 0
        payload = json.loads((song_dir / "peaks" / f"{name}.json").read_text())
        assert payload["version"] == 1
        assert len(payload["peaks"]) == 2 * payload["bucket_count"]
        assert all(-1.0 <= v <= 1.0 for v in payload["peaks"])
    with db_session() as db:
        stems = db.query(Stem).filter_by(song_id=VID).all()
        assert {s.name for s in stems} == set(STEM_NAMES)
        assert all(abs(s.duration_s - 0.25) < 0.01 for s in stems)

    # second run: cache hit, near-instant
    ctx2 = StubCtx(VID)
    asyncio.run(separate_song(ctx2))
    assert ctx2.reports == [("cached", 1.0)]


# -- OOM retry -------------------------------------------------------------


def test_gpu_oom_retries_once_in_low_memory_mode(tmp_env, monkeypatch):
    calls: list[tuple[str, bool]] = []

    def fake_run_once(model, input_path, out_dir, names, report, *, stage, progress, low_memory):
        calls.append((model, low_memory))
        if not low_memory:
            raise RuntimeError("CUDA out of memory. Tried to allocate 20.00 GiB")
        for filename in names.values():
            _write_wav(out_dir / f"{filename}.wav")

    freed = []
    monkeypatch.setattr(sep_mod, "_run_model_once", fake_run_once)
    monkeypatch.setattr(sep_mod, "_free_gpu", lambda: freed.append(True))

    stems_dir = tmp_env / "media" / VID / "stems"
    source = tmp_env / "media" / VID / "source.wav"
    _write_wav(source)
    ctx = StubCtx(VID)
    sep_mod._separate_blocking(source, stems_dir, ctx.report_threadsafe, lambda: False)

    # both models OOM'd once then succeeded in low-memory mode
    assert calls == [
        (sep_mod.VOCAL_MODEL, False),
        (sep_mod.VOCAL_MODEL, True),
        (sep_mod.INSTRUMENT_MODEL, False),
        (sep_mod.INSTRUMENT_MODEL, True),
    ]
    assert len(freed) == 2
    for name in STEM_NAMES:
        assert (stems_dir / f"{name}.wav").exists()
    # intermediates cleaned up
    assert not (stems_dir / "tmp_instrumental.wav").exists()
    assert not (stems_dir / "tmp_residual_vocals.wav").exists()


def test_persistent_oom_becomes_user_facing_error(tmp_env, monkeypatch):
    def always_oom(*args, **kwargs):
        raise RuntimeError("CUDA out of memory")

    monkeypatch.setattr(sep_mod, "_run_model_once", always_oom)
    monkeypatch.setattr(sep_mod, "_free_gpu", lambda: None)

    stems_dir = tmp_env / "media" / VID / "stems"
    source = tmp_env / "media" / VID / "source.wav"
    _write_wav(source)
    with pytest.raises(SeparationError, match="out of memory"):
        sep_mod._separate_blocking(source, stems_dir, lambda s, p: None, lambda: False)


def test_non_oom_error_is_not_retried(tmp_env, monkeypatch):
    calls = []

    def boom(*args, **kwargs):
        calls.append(1)
        raise ValueError("model file corrupt")

    monkeypatch.setattr(sep_mod, "_run_model_once", boom)
    stems_dir = tmp_env / "media" / VID / "stems"
    source = tmp_env / "media" / VID / "source.wav"
    _write_wav(source)
    with pytest.raises(ValueError):
        sep_mod._separate_blocking(source, stems_dir, lambda s, p: None, lambda: False)
    assert len(calls) == 1


# -- encode / peaks error paths -------------------------------------------


def test_encode_missing_input_raises(tmp_env):
    with pytest.raises(EncodeError, match="ffmpeg AAC encode failed"):
        asyncio.run(encode_stem(tmp_env / "nope.wav", tmp_env / "out.m4a"))
    assert not (tmp_env / "out.m4a").exists()


def test_peaks_unreadable_input_raises(tmp_env):
    bad = tmp_env / "bad.wav"
    bad.write_bytes(b"not a wav at all")
    with pytest.raises(PeaksError):
        write_peaks(bad, tmp_env / "peaks.json")


# -- API -------------------------------------------------------------------


@pytest.fixture
def sep_client(tmp_env, monkeypatch):
    """TestClient whose separate handler is fake (no GPU)."""

    async def fake_separate(ctx):
        ctx.report("vocals", 0.1)
        await asyncio.sleep(0.3)  # long enough for the idempotency check
        ctx.report("peaks", 0.95)

    monkeypatch.setattr("app.main.separate_song", fake_separate)
    monkeypatch.setattr("app.main.download_song", fake_separate)  # unused here
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c


def _wait_done(client, job_id: str, timeout: float = 5.0) -> dict:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in ("done", "error", "cancelled"):
            return job
        time.sleep(0.02)
    raise TimeoutError(f"job {job_id} never finished")


def test_separate_endpoint_enqueues_and_is_idempotent(sep_client):
    _add_song()
    r1 = sep_client.post(f"/api/songs/{VID}/separate")
    assert r1.status_code == 202
    job_id = r1.json()["job_id"]

    r2 = sep_client.post(f"/api/songs/{VID}/separate")
    assert r2.status_code == 202
    assert r2.json() == {"job_id": job_id, "already_running": True}

    assert _wait_done(sep_client, job_id)["status"] == "done"


def test_separate_endpoint_rejects_unknown_and_unready(sep_client):
    assert sep_client.post("/api/songs/zzzzzzzzzzz/separate").status_code == 404
    _add_song(status="downloading")
    assert sep_client.post(f"/api/songs/{VID}/separate").status_code == 409


def test_stems_api_and_song_detail(sep_client):
    _add_song()
    with db_session() as db:
        for name in STEM_NAMES:
            db.add(
                Stem(
                    song_id=VID, name=name,
                    wav_path=f"{VID}/stems/{name}.wav",
                    m4a_path=f"{VID}/stems/{name}.m4a",
                    peaks_path=f"{VID}/peaks/{name}.json",
                    duration_s=1.5,
                )
            )

    stems = sep_client.get(f"/api/songs/{VID}/stems").json()["stems"]
    assert [s["name"] for s in stems] == list(STEM_NAMES)
    assert stems[0]["audio_url"] == f"/api/media/{VID}/stems/vocals.m4a"

    detail = sep_client.get(f"/api/songs/{VID}").json()
    assert detail["song"]["stem_count"] == 6
    assert len(detail["stems"]) == 6

    assert sep_client.get("/api/songs/zzzzzzzzzzz/stems").status_code == 404

    listing = sep_client.get("/api/songs").json()["songs"]
    assert listing[0]["stem_count"] == 6


def test_media_endpoint_serves_ranges_and_404s(sep_client):
    _add_song()
    m4a = settings.media_root / VID / "stems" / "guitar.m4a"
    m4a.parent.mkdir(parents=True, exist_ok=True)
    m4a.write_bytes(bytes(range(100)))

    full = sep_client.get(f"/api/media/{VID}/stems/guitar.m4a")
    assert full.status_code == 200
    assert full.headers["content-type"] == "audio/mp4"
    assert full.content == bytes(range(100))

    partial = sep_client.get(
        f"/api/media/{VID}/stems/guitar.m4a", headers={"Range": "bytes=10-19"}
    )
    assert partial.status_code == 206
    assert partial.content == bytes(range(10, 20))

    assert sep_client.get(f"/api/media/{VID}/stems/vocals.m4a").status_code == 404
    # traversal-shaped names never reach the filesystem
    assert sep_client.get("/api/media/..%2F..%2Fetc/stems/guitar.m4a").status_code in (404, 422)

    peaks = settings.media_root / VID / "peaks" / "guitar.json"
    peaks.parent.mkdir(parents=True, exist_ok=True)
    peaks.write_text('{"version": 1}')
    assert sep_client.get(f"/api/media/{VID}/peaks/guitar.json").status_code == 200


def test_delete_song_clears_stem_cache_and_rows(sep_client):
    _add_song()
    _fake_cache(VID)
    with db_session() as db:
        db.add(
            Stem(
                song_id=VID, name="guitar",
                wav_path=f"{VID}/stems/guitar.wav",
                m4a_path=f"{VID}/stems/guitar.m4a",
                peaks_path=f"{VID}/peaks/guitar.json",
            )
        )

    assert sep_client.delete(f"/api/songs/{VID}").status_code == 204
    assert not (settings.media_root / VID).exists()
    with db_session() as db:
        assert db.query(Stem).filter_by(song_id=VID).count() == 0
    assert sep_client.get(f"/api/songs/{VID}/stems").status_code == 404
