# Fret Lab — Roadmap

One phase per session. Each phase has a self-contained goal doc in `docs/goals/` — run it with:

```
/goal implement docs/goals/<file>: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed, or stop after 25 turns
```

| Phase | Goal doc | Status |
|---|---|---|
| 0. Foundation & environment proof | [phase-0-foundation.md](goals/phase-0-foundation.md) | ✅ 2026-07-19 |
| 1. Song acquisition & library | [phase-1-song-acquisition.md](goals/phase-1-song-acquisition.md) | ✅ 2026-07-19 |
| 2. Separation pipeline & caching | [phase-2-separation.md](goals/phase-2-separation.md) | ✅ 2026-07-19 |
| 3. Practice player (stems, speed, loop) | [phase-3-practice-player.md](goals/phase-3-practice-player.md) | ✅ 2026-07-19 |
| 4. Tab & sheet music rendering | [phase-4-tab-rendering.md](goals/phase-4-tab-rendering.md) | ✅ 2026-07-19 |
| 5. AI transcription draft | [phase-5-transcription.md](goals/phase-5-transcription.md) | ✅ 2026-07-19 |
| 6. Correction editor | [phase-6-editor.md](goals/phase-6-editor.md) | ✅ 2026-07-20 |
| 7. Theory Lab & Jam Mode | [phase-7-theory-lab.md](goals/phase-7-theory-lab.md) | ✅ 2026-07-20 |
| 8. Beauty & polish pass | [phase-8-polish.md](goals/phase-8-polish.md) | ☐ |

## Product vision

Search a song → YouTube audio downloaded locally → AI stem separation (vocals/drums/bass/guitar/piano/other) → practice player with per-stem mix, A-B loop, 0.5–1.0x speed without pitch change, speed trainer → AI-drafted guitar tab + sheet music with a correction editor (AlphaTab) → theory lab (fretboard/CAGED/scales, chord timeline, jam mode over backing stems — zombieguitar.com-inspired "theory through jamming").

Personal/local tool for Daniel's own machine (RTX 4090). Not a hosted service.

## Architecture snapshot

```
frontend/  Vite+React+TS+Tailwind — src/audio (stem engine), src/tab (AlphaTab), src/theory, src/pages
backend/   FastAPI — app/api (REST+SSE), app/jobs (asyncio queue), app/pipeline (ytdlp, separate,
           transcribe, fret_assign, chords, peaks, encode), app/db (SQLAlchemy: Song/Job/Stem/Transcription)
media/     cache per videoId: source.wav, stems/, peaks/, analysis/, transcriptions/  (gitignored)
```

Pipeline: yt-dlp → WAV → BS-RoFormer (vocals split) → htdemucs_6s (instrument split) → m4a + peaks → chords → [on demand] Basic Pitch → MIDI → DP fret assignment → MusicXML/alphaTex draft.

## Key risks (watch these)

1. **Multi-stem time-stretch sync** — ✅ resolved in Phase 3: per-stem signalsmith-stretch nodes driven by identical scheduled time maps hold < 6ms inter-stem spread through 60s playback, seeks, loop wraps, and live rate changes (measured; see `/proto/sync` + `frontend/scripts/run-sync-proto.mjs`). No fallback needed.
2. **YouTube bot detection** — keep yt-dlp updated; `--cookies-from-browser`; PO-token plugin if needed.
3. **Transcription accuracy on distorted guitar** — it's a *draft*; the editor (Phase 6) is the product. **Update after Phase 5 review: accuracy is a top priority (Daniel), not just editor fodder — see backlog below.**
4. **htdemucs_6s guitar-stem bleed** — validate on real songs; acceptable for practice use.

## Transcription accuracy backlog (post-Phase-5, priority: high)

Observed on Smoke on the Water guitar draft: extra notes in playback. Sources: Basic
Pitch overtone false positives (e.g. spurious fret-19 note), organ bleed in the guitar
stem, and 1/16 chord-merge folding near-simultaneous artifacts into chords. Work items,
roughly in order of leverage:

1. **Ground-truth eval harness first** — 4–8 bars of known riffs (Smoke intro, Paranoid
   riff, a bass line) with hand-written correct note lists; score note precision/recall
   (mir_eval is already installed). Every item below must move these numbers, not vibes.
2. **Overtone/octave suppression** — drop a detected note when a note 12/19/24 semitones
   below starts within the same grid step with substantially higher amplitude.
3. **Amplitude floor** — filter notes whose Basic Pitch amplitude is far below the local
   median (bleed and ghost notes are usually quiet).
4. **Per-stem threshold presets** — distorted guitar wants higher onset threshold than
   clean bass; expose "clean/crunchy/high-gain" presets in the popover.
5. **Heuristic voice separation (multi-guitar)** — the guitar stem contains *all*
   guitars mixed; cluster simultaneous notes by register/hand-position into 1–2 voices
   and emit separate MusicXML tracks. True guitar-vs-guitar source separation is
   research-grade; this is the pragmatic path. (Raised by Daniel 2026-07-19.)
