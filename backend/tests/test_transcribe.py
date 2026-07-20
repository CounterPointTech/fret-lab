"""Transcription pipeline: quantization, fret assignment, score output, the
job handler, and the /transcribe endpoint (error paths included)."""

import asyncio
import json
import time
import xml.etree.ElementTree as ET

import pytest

from app.pipeline.beats import NoteEvent, QuantNote, quantize
from app.pipeline.fret_assign import (
    STANDARD_TUNING,
    TUNINGS,
    TabEvent,
    FrettedNote,
    assign_frets,
    group_events,
)
from app.pipeline.score_out import to_alphatex, to_musicxml


def _quant(pitches, dur=2, gap=2, velocity=100):
    return [
        QuantNote(step=i * gap, dur_steps=dur, pitch=p, velocity=velocity)
        for i, p in enumerate(pitches)
    ]


# -- quantization ----------------------------------------------------------


def test_quantize_snaps_to_sixteenth_grid():
    # 120 BPM -> 16th = 0.125s
    notes = [NoteEvent(start_s=0.13, end_s=0.62, pitch=60, amplitude=0.8)]
    out = quantize(notes, bpm=120, offset_s=0.0)
    assert out == [QuantNote(step=1, dur_steps=4, pitch=60, velocity=102)]


def test_quantize_clamps_notes_before_grid_start():
    notes = [NoteEvent(start_s=0.05, end_s=0.2, pitch=60, amplitude=0.5)]
    out = quantize(notes, bpm=120, offset_s=0.5)
    assert out[0].step == 0


def test_quantize_minimum_one_step_duration():
    notes = [NoteEvent(start_s=1.0, end_s=1.001, pitch=60, amplitude=0.5)]
    out = quantize(notes, bpm=120, offset_s=0.0)
    assert out[0].dur_steps == 1


def test_quantize_dedupes_same_step_and_pitch_keeping_longer():
    notes = [
        NoteEvent(start_s=1.0, end_s=1.05, pitch=60, amplitude=0.5),
        NoteEvent(start_s=1.02, end_s=1.5, pitch=60, amplitude=0.5),
    ]
    out = quantize(notes, bpm=120, offset_s=0.0)
    assert len(out) == 1
    assert out[0].dur_steps == 4


def test_quantize_rejects_nonpositive_bpm():
    with pytest.raises(ValueError):
        quantize([], bpm=0, offset_s=0.0)


# -- fret assignment -------------------------------------------------------


def test_open_string_riff_uses_open_strings():
    events = group_events(_quant(list(STANDARD_TUNING)), max_polyphony=6)
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    for i, ev in enumerate(tab):
        assert len(ev.notes) == 1
        assert ev.notes[0].fret == 0
        assert ev.notes[0].string == i


def test_ascending_scale_stays_in_position():
    c_major = [60, 62, 64, 65, 67, 69, 71, 72]
    events = group_events(_quant(c_major), max_polyphony=6)
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    fretted = [n.fret for ev in tab for n in ev.notes if n.fret > 0]
    assert fretted, "scale should not be all open strings"
    assert max(fretted) - min(fretted) <= 5, f"hand jumped around: {fretted}"
    assert max(fretted) <= 9, f"draft should prefer low positions: {fretted}"


def test_open_e_major_chord_gets_standard_voicing():
    # E2 B2 E3 G#3 B3 E4 -> 0-2-2-1-0-0
    events = group_events(
        [QuantNote(step=0, dur_steps=4, pitch=p, velocity=100)
         for p in (40, 47, 52, 56, 59, 64)],
        max_polyphony=6,
    )
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    assert len(tab) == 1
    voicing = {(n.string, n.fret) for n in tab[0].notes}
    assert voicing == {(0, 0), (1, 2), (2, 2), (3, 1), (4, 0), (5, 0)}


def test_chord_notes_land_on_distinct_strings_with_playable_span():
    events = group_events(
        [QuantNote(step=0, dur_steps=4, pitch=p, velocity=100) for p in (45, 52, 57, 61)],
        max_polyphony=6,
    )
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    strings = [n.string for n in tab[0].notes]
    assert len(strings) == len(set(strings))
    fretted = [n.fret for n in tab[0].notes if n.fret > 0]
    if len(fretted) > 1:
        assert max(fretted) - min(fretted) <= 4


def test_out_of_range_pitch_is_octave_clamped():
    events = group_events(_quant([20, 110]), max_polyphony=6)  # below/above range
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    for ev in tab:
        n = ev.notes[0]
        sounding = STANDARD_TUNING[n.string] + n.fret
        assert STANDARD_TUNING[0] <= sounding <= STANDARD_TUNING[-1] + 22


def test_bass_tuning_low_open_e():
    bass = TUNINGS["bass_standard"]
    events = group_events(_quant([28]), max_polyphony=4)
    tab = assign_frets(events, bass, capo=0)
    assert tab[0].notes[0] == FrettedNote(pitch=28, string=0, fret=0)


def test_capo_shifts_frets():
    events = group_events(_quant([42]), max_polyphony=6)  # F#2, capo 2 -> open low E
    tab = assign_frets(events, STANDARD_TUNING, capo=2)
    assert tab[0].notes == (FrettedNote(pitch=42, string=0, fret=0),)


def test_group_events_truncates_overlap_at_next_event():
    q = [
        QuantNote(step=0, dur_steps=8, pitch=60, velocity=100),
        QuantNote(step=2, dur_steps=2, pitch=62, velocity=100),
    ]
    events = group_events(q, max_polyphony=6)
    assert events[0].dur_steps == 2


def test_group_events_caps_polyphony_at_string_count():
    q = [QuantNote(step=0, dur_steps=2, pitch=40 + i, velocity=50 + i) for i in range(8)]
    events = group_events(q, max_polyphony=6)
    assert len(events[0].pitches) == 6
    # kept the loudest ones (velocity 52..57 -> pitches 42..47)
    assert min(events[0].pitches) == 42


def test_max_span_chord_still_has_a_hand_position():
    # regression: a chord spanning the full 4-fret limit must yield DP states
    from app.pipeline.fret_assign import _hand_options

    voicing = (FrettedNote(pitch=42, string=0, fret=2), FrettedNote(pitch=61, string=3, fret=6))
    assert _hand_options(voicing), "span-4 voicing produced no hand positions"


def test_long_realistic_sequence_assigns_every_event():
    # dense mixed single-note/chord stream (regression for empty DP rows)
    q = []
    for i in range(120):
        q.append(QuantNote(step=i * 2, dur_steps=2, pitch=40 + (i * 7) % 32, velocity=90))
        if i % 5 == 0:
            q.append(QuantNote(step=i * 2, dur_steps=2, pitch=45 + (i * 5) % 24, velocity=80))
    events = group_events(q, max_polyphony=6)
    tab = assign_frets(events, STANDARD_TUNING, capo=0)
    assert len(tab) == len(events)
    assert all(ev.notes for ev in tab)


# -- score output ----------------------------------------------------------


def _tab(step, dur, *string_frets):
    notes = tuple(
        FrettedNote(pitch=STANDARD_TUNING[s] + f, string=s, fret=f) for s, f in string_frets
    )
    return TabEvent(step=step, dur_steps=dur, notes=notes)


def test_musicxml_is_wellformed_with_tab_info():
    xml = to_musicxml(
        [_tab(0, 4, (5, 3)), _tab(4, 4, (4, 0))], bpm=100, tuning=STANDARD_TUNING,
        capo=0, title="AI draft — guitar",
    )
    root = ET.fromstring(xml)
    assert root.tag == "score-partwise"
    notes = root.findall(".//note")
    techs = root.findall(".//technical")
    assert len(techs) == 2
    assert techs[0].find("string").text == "1"  # string 6-idx: highest-string numbering
    assert techs[0].find("fret").text == "3"
    # gap after beat 2 (steps 8..16) is filled with rests
    assert any(n.find("rest") is not None for n in notes)


def test_musicxml_note_across_barline_is_tied():
    xml = to_musicxml(
        [_tab(14, 4, (2, 5))], bpm=120, tuning=STANDARD_TUNING, capo=0, title="t"
    )
    root = ET.fromstring(xml)
    measures = root.findall(".//measure")
    assert len(measures) == 2
    ties = root.findall(".//tie")
    assert {t.get("type") for t in ties} == {"start", "stop"}


def test_musicxml_chord_marks_second_note():
    xml = to_musicxml(
        [_tab(0, 4, (0, 0), (1, 2))], bpm=120, tuning=STANDARD_TUNING, capo=0, title="t"
    )
    root = ET.fromstring(xml)
    notes = [n for n in root.findall(".//note") if n.find("rest") is None]
    assert notes[0].find("chord") is None
    assert notes[1].find("chord") is not None


def test_musicxml_empty_events_still_valid():
    xml = to_musicxml([], bpm=120, tuning=STANDARD_TUNING, capo=0, title="empty")
    assert ET.fromstring(xml).find(".//measure") is not None


def test_alphatex_smoke():
    atex = to_alphatex(
        [_tab(0, 4, (5, 3)), _tab(4, 2, (0, 0), (1, 2))],
        bpm=99.6, tuning=STANDARD_TUNING, capo=2, title="AI draft — guitar",
    )
    assert atex.startswith('\\title "AI draft — guitar"')
    assert "\\tempo 100" in atex
    assert "\\capo 2" in atex
    assert "3.1.4" in atex  # fret 3, string 1 (high e), quarter
    assert "(0.6 2.5).8" in atex


# -- job handler -----------------------------------------------------------


class StubCtx:
    def __init__(self, song_id, params=None):
        self.song_id = song_id
        self.job_id = "test-job"
        self.params = params or {}
        self.cancelled = False
        self.reports = []

    def report(self, stage, progress):
        self.reports.append((stage, progress))

    def report_threadsafe(self, stage, progress):
        self.report(stage, progress)

    def raise_if_cancelled(self):
        pass


class FakeMidi:
    def write(self, path):
        with open(path, "wb") as f:
            f.write(b"MThd")


def _add_song(video_id="vid00000001"):
    from app.db.models import Song
    from app.db.session import db_session, init_db

    init_db()
    with db_session() as db:
        db.add(Song(video_id=video_id, title="Test Song", status="ready"))
    return video_id


def _add_stem_file(tmp_env, video_id, name="guitar"):
    from app.config import settings
    from app.db.models import Stem
    from app.db.session import db_session

    stems_dir = settings.media_root / video_id / "stems"
    stems_dir.mkdir(parents=True, exist_ok=True)
    wav = stems_dir / f"{name}.wav"
    wav.write_bytes(b"RIFFfake")
    with db_session() as db:
        db.add(Stem(
            song_id=video_id, name=name,
            wav_path=f"{video_id}/stems/{name}.wav",
            m4a_path=f"{video_id}/stems/{name}.m4a",
            peaks_path=f"{video_id}/peaks/{name}.json",
        ))
    return wav


def test_handler_missing_stem_errors_cleanly(tmp_env):
    from app.pipeline.transcribe import TranscriptionError, transcribe_song

    video_id = _add_song()
    ctx = StubCtx(video_id, {"stem": "guitar"})
    with pytest.raises(TranscriptionError, match="missing"):
        asyncio.run(transcribe_song(ctx))


def test_handler_silent_stem_reports_no_notes(tmp_env, monkeypatch):
    from app.pipeline import transcribe as mod

    video_id = _add_song()
    _add_stem_file(tmp_env, video_id)
    monkeypatch.setattr(mod, "detect_notes", lambda *a, **k: ([], FakeMidi()))
    ctx = StubCtx(video_id, {"stem": "guitar"})
    with pytest.raises(mod.TranscriptionError, match="No notes detected"):
        asyncio.run(mod.transcribe_song(ctx))


def test_handler_happy_path_writes_all_artifacts(tmp_env, monkeypatch):
    from app.config import settings
    from app.db.models import Transcription
    from app.db.session import db_session
    from app.pipeline import transcribe as mod

    video_id = _add_song()
    _add_stem_file(tmp_env, video_id)
    notes = [
        NoteEvent(start_s=i * 0.25, end_s=i * 0.25 + 0.2, pitch=p, amplitude=0.7)
        for i, p in enumerate([64, 67, 69, 64])
    ]
    monkeypatch.setattr(mod, "detect_notes", lambda *a, **k: (notes, FakeMidi()))
    monkeypatch.setattr(mod, "estimate_grid", lambda wav: (120.0, 0.05))

    ctx = StubCtx(video_id, {"stem": "guitar", "onset_threshold": 0.4})
    asyncio.run(mod.transcribe_song(ctx))

    tdir = settings.media_root / video_id / "transcriptions"
    for ext in ("mid", "musicxml", "atex", "params.json"):
        assert list(tdir.glob(f"ai_guitar_*.{ext}")), f"missing .{ext}"

    with db_session() as db:
        row = db.query(Transcription).one()
        assert row.source == "generated"
        assert row.kind == "musicxml"
        assert row.sync_bpm == 120.0
        assert row.sync_offset_s == 0.05
        params = json.loads(row.params_json)
        assert params["onset_threshold"] == 0.4
        assert params["tuning"] == "standard"
        assert params["detected_bpm"] == 120.0
        xml_path = settings.media_root / row.path

    ET.parse(xml_path)  # persisted MusicXML parses

    stages = [s for s, _ in ctx.reports]
    assert stages == ["detect", "beats", "frets", "write"]


# -- API endpoint ----------------------------------------------------------


def _wait_job(client, job_id, timeout=10.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in ("done", "error", "cancelled"):
            return job
        time.sleep(0.05)
    raise AssertionError("job did not finish in time")


def test_transcribe_endpoint_404_unknown_song(client):
    r = client.post("/api/songs/nosuchvid00/transcribe", json={})
    assert r.status_code == 404


def test_transcribe_endpoint_409_missing_stem(client, tmp_env):
    video_id = _add_song()
    r = client.post(f"/api/songs/{video_id}/transcribe", json={"stem": "guitar"})
    assert r.status_code == 409
    assert "separation" in r.json()["detail"]


def test_transcribe_endpoint_400_bad_tuning(client, tmp_env):
    video_id = _add_song()
    _add_stem_file(tmp_env, video_id)
    r = client.post(f"/api/songs/{video_id}/transcribe", json={"tuning": "ukulele"})
    assert r.status_code == 400


def test_transcribe_endpoint_end_to_end(client, tmp_env, monkeypatch):
    from app.pipeline import transcribe as mod

    video_id = _add_song()
    _add_stem_file(tmp_env, video_id)
    notes = [NoteEvent(start_s=0.0, end_s=0.5, pitch=64, amplitude=0.9)]
    monkeypatch.setattr(mod, "detect_notes", lambda *a, **k: (notes, FakeMidi()))
    monkeypatch.setattr(mod, "estimate_grid", lambda wav: (100.0, 0.0))

    r = client.post(
        f"/api/songs/{video_id}/transcribe",
        json={"stem": "guitar", "capo": 0, "onset_threshold": 0.35},
    )
    assert r.status_code == 202
    job = _wait_job(client, r.json()["job_id"])
    assert job["status"] == "done", job

    rows = client.get(f"/api/songs/{video_id}/transcriptions").json()["transcriptions"]
    assert len(rows) == 1
    row = rows[0]
    assert row["source"] == "generated"
    assert row["name"] == "AI draft — guitar"
    assert row["sync_bpm"] == 100.0
    assert json.loads(row["params_json"])["onset_threshold"] == 0.35
    assert row["file_url"].endswith(".musicxml")
