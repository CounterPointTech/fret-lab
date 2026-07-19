# Phase 5 — AI transcription draft

## Objective
"Transcribe" button on a stem → Basic Pitch note detection → beat-quantized MIDI → dynamic-programming string/fret assignment → MusicXML + alphaTex draft rendered in AlphaTab, cursor-synced to the real audio.

## Context
See `CLAUDE.md`. Phases 2-4 delivered stems, StemPlayer, TabViewer, transcription file storage. Research reality check: expect ~80% note accuracy on clean isolated stems, worse on distortion — the output is a **draft** for the Phase 6 editor; label it as such in the UI. Components:
- **Basic Pitch** (`basic-pitch` PyPI, Apache-2.0, ONNX runtime) on the isolated stem → note events (also handles pitch bends). Runs fine on CPU; GPU optional.
- **librosa** beat/tempo tracking on the stem (or full mix if cleaner) → tempo map for quantization (start with fixed BPM + offset; reuse Phase 4 sync points if set).
- **DP fret assignment**: pitches → (string, fret) minimizing hand movement/fret span/string changes; tuning + capo aware (default EADGBE). Reference approach: `V2arK/midi-to-guitar-tab`.
- Output: MIDI (raw), MusicXML (canonical persist), alphaTex (debug/diff) under `media/{videoId}/transcriptions/`.

## Tasks
- [ ] `pipeline/transcribe.py`: stem → Basic Pitch (tunable onset/frame thresholds, min-note-length filter) → note list; unit-testable pure functions.
- [ ] `pipeline/beats.py`: tempo estimate + beat grid; quantize note starts/durations to grid (configurable resolution, default 1/16).
- [ ] `pipeline/fret_assign.py`: DP over note sequence; chords handled (simultaneous notes → playable voicing); emits string/fret per note.
- [ ] `pipeline/score_out.py`: notes+grid → MusicXML (with TAB staff info: string/fret) + alphaTex; validate MusicXML loads in AlphaTab.
- [ ] Job kind `transcribe` (params: stem, tuning, capo, thresholds) with SSE progress; API + UI (transcribe button on a stem, settings popover, draft appears in TabViewer labeled "AI draft").
- [ ] Tests: fret assignment on known riffs (e.g., ascending scale stays in position; open-position riff uses open strings), quantization edge cases, empty/silent stem → clean "no notes found" error not a crash.

## Acceptance criteria (demonstrate in transcript)
1. End-to-end on a real song's guitar or bass stem: job completes; `.mid`, `.musicxml`, `.atex` files exist (listing shown).
2. Draft renders in AlphaTab as tab + notation (screenshot) and cursor-syncs to real audio playback.
3. A simple/clean riff section is recognizably correct (compare rendered tab vs known riff; state honest assessment in transcript).
4. Fret-assignment unit tests demonstrate playable positions (green run shown). Committed; ROADMAP checked off.

## Definition of done
Transcription parameters are persisted with the result (reproducibility); pipeline functions are pure enough to re-run with new thresholds without re-downloading/re-separating.
