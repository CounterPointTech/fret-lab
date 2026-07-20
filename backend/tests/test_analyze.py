"""Chord/key analysis: label smoothing, span merging, key estimation,
synthesized-audio chord detection, handler cache + error paths, API."""

import asyncio
import json
import time

import numpy as np
import pytest
import soundfile as sf

from app.config import settings
from app.db.models import Song
from app.db.session import db_session, init_db
from app.jobs.errors import JobCancelled
from app.pipeline.chords import (
    CHORD_LABELS,
    PITCH_CLASSES,
    AnalysisError,
    analyze_blocking,
    analyze_song,
    chord_templates,
    estimate_key,
    merge_short_spans,
    smooth_labels,
    spans_from_labels,
)

VID = "vid_ana_00001"


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
        db.add(Song(video_id=VID, title="analyze test song", status=status))


def _label_index(label: str) -> int:
    return CHORD_LABELS.index(label)


# -- pure helpers ----------------------------------------------------------


def test_templates_shape_and_normalization():
    t = chord_templates()
    assert t.shape == (25, 12)
    assert np.allclose(np.linalg.norm(t, axis=1), 1.0)
    # C major template hits C, E, G
    c_row = t[_label_index("C")]
    assert {i for i in range(12) if c_row[i] > 0} == {0, 4, 7}
    # A minor template hits A, C, E
    am_row = t[_label_index("Am")]
    assert {i for i in range(12) if am_row[i] > 0} == {9, 0, 4}


def test_smooth_labels_kills_single_beat_flicker():
    # 10 segments: C everywhere, but one beat where G barely wins
    n = 10
    scores = np.full((25, n), 0.1)
    scores[_label_index("C"), :] = 0.9
    scores[_label_index("G"), 5] = 0.93  # marginal — smoothing should ignore
    labels = smooth_labels(scores)
    assert all(CHORD_LABELS[i] == "C" for i in labels)


def test_smooth_labels_keeps_confident_changes():
    n = 8
    scores = np.full((25, n), 0.1)
    scores[_label_index("C"), :4] = 0.9
    scores[_label_index("F"), 4:] = 0.9
    labels = smooth_labels(scores)
    assert [CHORD_LABELS[i] for i in labels] == ["C"] * 4 + ["F"] * 4


def test_spans_from_labels_merges_and_validates():
    labels = np.array([_label_index("C")] * 2 + [_label_index("G")] * 2)
    boundaries = np.array([0.0, 0.5, 1.0, 1.5, 2.0])
    spans = spans_from_labels(labels, boundaries)
    assert spans == [
        {"start": 0.0, "end": 1.0, "label": "C"},
        {"start": 1.0, "end": 2.0, "label": "G"},
    ]
    with pytest.raises(ValueError, match="one more entry"):
        spans_from_labels(labels, boundaries[:-1])


def test_merge_short_spans_absorbs_runts():
    spans = [
        {"start": 0.0, "end": 2.0, "label": "C"},
        {"start": 2.0, "end": 2.1, "label": "G"},  # runt -> absorbed into C
        {"start": 2.1, "end": 4.0, "label": "C"},  # re-merges with C
        {"start": 4.0, "end": 6.0, "label": "F"},
    ]
    assert merge_short_spans(spans, min_duration=0.3) == [
        {"start": 0.0, "end": 4.0, "label": "C"},
        {"start": 4.0, "end": 6.0, "label": "F"},
    ]


def test_merge_short_spans_leading_runt_donates_forward():
    spans = [
        {"start": 0.0, "end": 0.1, "label": "N"},
        {"start": 0.1, "end": 3.0, "label": "Am"},
    ]
    assert merge_short_spans(spans, min_duration=0.3) == [
        {"start": 0.0, "end": 3.0, "label": "Am"}
    ]


# -- key estimation --------------------------------------------------------


def _spans_of(*items: tuple[str, float]) -> list[dict]:
    spans, t = [], 0.0
    for label, dur in items:
        spans.append({"start": t, "end": t + dur, "label": label})
        t += dur
    return spans


def test_estimate_key_major_progression():
    key = estimate_key(_spans_of(("C", 8), ("F", 4), ("G", 4), ("Am", 2), ("C", 6)))
    assert key is not None
    assert (key["tonic"], key["mode"]) == ("C", "major")
    assert 0.0 <= key["confidence"] <= 1.0


def test_estimate_key_minor_progression():
    key = estimate_key(_spans_of(("Am", 8), ("Dm", 4), ("E", 4), ("F", 2), ("G", 2), ("Am", 4)))
    assert key is not None
    assert key["name"] == "A minor"


def test_estimate_key_transposition_invariance():
    """G minor progression must not come out as some other key."""
    key = estimate_key(_spans_of(("Gm", 8), ("Cm", 4), ("D", 4), ("A#", 3), ("Gm", 4)))
    assert key is not None
    assert (key["tonic"], key["mode"]) == ("G", "minor")


def test_estimate_key_empty_or_no_chords():
    assert estimate_key([]) is None
    assert estimate_key(_spans_of(("N", 10))) is None


# -- synthesized-audio detection ------------------------------------------


def _write_progression(path, chords: list[tuple[str, bool, float]], sr: int = 22050) -> None:
    """Render sine-triad chords (label root, minor?, seconds) to a wav."""
    a4 = 440.0
    chunks = []
    for root_name, minor, seconds in chords:
        root_pc = PITCH_CLASSES.index(root_name)
        # MIDI around octave 4, with a lower octave doubling for chroma weight
        midi_root = 60 + ((root_pc - 0) % 12)
        third = 3 if minor else 4
        t = np.linspace(0, seconds, int(sr * seconds), endpoint=False)
        wave = np.zeros_like(t)
        for interval in (0, third, 7):
            for octave in (0, -12):
                freq = a4 * 2 ** ((midi_root + interval + octave - 69) / 12)
                wave += 0.15 * np.sin(2 * np.pi * freq * t)
        chunks.append(wave)
    audio = np.concatenate(chunks).astype(np.float32)
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, audio, sr)


def test_analyze_blocking_detects_synthesized_progression(tmp_env):
    source = tmp_env / "media" / VID / "source.wav"
    _write_progression(
        source, [("C", False, 3.0), ("F", False, 3.0), ("G", False, 3.0), ("C", False, 3.0)]
    )
    payload = analyze_blocking(source, lambda s, p: None, lambda: False)

    assert payload["version"] == 1
    assert abs(payload["duration"] - 12.0) < 0.1
    labels = [s["label"] for s in payload["chords"] if s["label"] != "N"]
    # every rendered chord must appear; nothing outside the progression
    assert set(labels) <= {"C", "F", "G"}
    assert {"C", "F", "G"} <= set(labels)
    assert payload["key"] is not None
    assert payload["key"]["name"] == "C major"
    # spans tile the duration in order
    spans = payload["chords"]
    assert spans[0]["start"] == 0.0
    for prev, cur in zip(spans, spans[1:]):
        assert cur["start"] == prev["end"]


def test_analyze_blocking_rejects_too_short_audio(tmp_env):
    source = tmp_env / "media" / VID / "source.wav"
    _write_progression(source, [("C", False, 0.2)])
    with pytest.raises(AnalysisError, match="too short"):
        analyze_blocking(source, lambda s, p: None, lambda: False)


def test_analyze_blocking_cancellation(tmp_env):
    source = tmp_env / "media" / VID / "source.wav"
    _write_progression(source, [("C", False, 2.0)])
    with pytest.raises(JobCancelled):
        analyze_blocking(source, lambda s, p: None, lambda: True)


# -- job handler -----------------------------------------------------------


def test_handler_missing_source_raises(tmp_env):
    _add_song()
    ctx = StubCtx(VID)
    with pytest.raises(AnalysisError, match="re-download"):
        asyncio.run(analyze_song(ctx))


def test_handler_writes_json_and_updates_song(tmp_env):
    _add_song()
    source = settings.media_root / VID / "source.wav"
    _write_progression(
        source, [("A", True, 3.0), ("D", True, 3.0), ("E", False, 3.0), ("A", True, 3.0)]
    )
    ctx = StubCtx(VID)
    asyncio.run(analyze_song(ctx))

    out = settings.media_root / VID / "analysis" / "chords.json"
    payload = json.loads(out.read_text(encoding="utf-8"))
    assert payload["key"]["name"] == "A minor"
    with db_session() as db:
        song = db.get(Song, VID)
        assert song.key_name == "A minor"
        assert song.bpm is not None

    # second run: cache hit, near-instant, no recompute
    ctx2 = StubCtx(VID)
    t0 = time.perf_counter()
    asyncio.run(analyze_song(ctx2))
    assert time.perf_counter() - t0 < 1.0
    assert ctx2.reports == [("cached", 1.0)]


def test_handler_corrupt_cache_invalidates(tmp_env):
    """A corrupt chords.json must not be served — it gets deleted and the
    job recomputes (here: fails on the missing source, proving recompute)."""
    _add_song()
    out = settings.media_root / VID / "analysis" / "chords.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("{not json", encoding="utf-8")
    ctx = StubCtx(VID)
    with pytest.raises(AnalysisError, match="re-download"):
        asyncio.run(analyze_song(ctx))
    assert not out.exists()


# -- API -------------------------------------------------------------------


@pytest.fixture
def ana_client(tmp_env, monkeypatch):
    """TestClient whose analyze handler is fake (no librosa)."""

    async def fake_analyze(ctx):
        ctx.report("chords", 0.5)
        await asyncio.sleep(0.3)  # long enough for the idempotency check

    async def unused(ctx):
        pass

    monkeypatch.setattr("app.main.analyze_song", fake_analyze)
    monkeypatch.setattr("app.main.download_song", unused)
    monkeypatch.setattr("app.main.separate_song", unused)
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c


def test_analyze_endpoint_enqueues_and_is_idempotent(ana_client):
    _add_song()
    r1 = ana_client.post(f"/api/songs/{VID}/analyze")
    assert r1.status_code == 202
    job_id = r1.json()["job_id"]

    r2 = ana_client.post(f"/api/songs/{VID}/analyze")
    assert r2.status_code == 202
    assert r2.json() == {"job_id": job_id, "already_running": True}


def test_analyze_endpoint_rejects_unknown_and_unready(ana_client):
    assert ana_client.post("/api/songs/zzzzzzzzzzz/analyze").status_code == 404
    _add_song(status="downloading")
    assert ana_client.post(f"/api/songs/{VID}/analyze").status_code == 409


def test_song_detail_exposes_chords_url_and_media_serves_it(ana_client):
    _add_song()
    detail = ana_client.get(f"/api/songs/{VID}").json()
    assert detail["song"]["chords_url"] is None
    assert ana_client.get(f"/api/media/{VID}/analysis/chords.json").status_code == 404

    out = settings.media_root / VID / "analysis" / "chords.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"version": 1, "chords": []}), encoding="utf-8")

    detail = ana_client.get(f"/api/songs/{VID}").json()
    assert detail["song"]["chords_url"] == f"/api/media/{VID}/analysis/chords.json"
    served = ana_client.get(f"/api/media/{VID}/analysis/chords.json")
    assert served.status_code == 200
    assert served.json()["version"] == 1
