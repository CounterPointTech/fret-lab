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
| 3. Practice player (stems, speed, loop) | [phase-3-practice-player.md](goals/phase-3-practice-player.md) | ☐ |
| 4. Tab & sheet music rendering | [phase-4-tab-rendering.md](goals/phase-4-tab-rendering.md) | ☐ |
| 5. AI transcription draft | [phase-5-transcription.md](goals/phase-5-transcription.md) | ☐ |
| 6. Correction editor | [phase-6-editor.md](goals/phase-6-editor.md) | ☐ |
| 7. Theory Lab & Jam Mode | [phase-7-theory-lab.md](goals/phase-7-theory-lab.md) | ☐ |
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

1. **Multi-stem time-stretch sync** — prototype first thing in Phase 3; fallback = pre-mixed single stretch bus.
2. **YouTube bot detection** — keep yt-dlp updated; `--cookies-from-browser`; PO-token plugin if needed.
3. **Transcription accuracy on distorted guitar** — it's a *draft*; the editor (Phase 6) is the product.
4. **htdemucs_6s guitar-stem bleed** — validate on real songs; acceptable for practice use.
