# Phase 4 — Tab & sheet music rendering

## Objective
AlphaTab in the Song Workspace: tab + standard notation rendered together, Guitar Pro / MusicXML import, playback cursor synced BOTH to AlphaTab's synth and to our real-audio StemPlayer.

## Context
See `CLAUDE.md`. Phase 3 delivered `StemPlayer` (position ticks, speed control). AlphaTab (`@coderline/alphatab`, MPL-2.0) provides rendering + SoundFont synth + cursor + click-to-seek + import (GP3-7, MusicXML, alphaTex) and has a Vite plugin and audio/video **external media sync** API (sync points mapping score ticks ↔ audio time). This phase makes the app useful with *existing* tabs before AI transcription exists (Phase 5).

## Tasks
- [ ] Integrate AlphaTab via its Vite plugin; `src/tab/TabViewer.tsx` wrapper (score load, render config: tab+notation staves, track selection, dark-theme render colors).
- [ ] Import UI: upload a `.gp*`/`.musicxml` file for a song → stored under `media/{videoId}/transcriptions/` via backend endpoint; listed per song.
- [ ] Mode A — synth playback: AlphaTab's own player (SoundFont), speed control, cursor, click-note-to-seek.
- [ ] Mode B — real-audio sync: drive AlphaTab cursor from `StemPlayer.onTick` using AlphaTab's external-media/sync-point API. Manual sync-point editor v1: set score BPM + audio offset (nudge buttons); persist per song. (Tap-to-sync polish can come later.)
- [ ] Click a bar in the tab → StemPlayer seeks there (inverse mapping). A-B loop can be set from a tab selection.
- [ ] Backend: transcription file CRUD endpoints + `Transcription` DB model (song_id, name, kind, path).
- [ ] Tests: sync-point mapping math (tick↔seconds at varying BPM/offset), file endpoints.

## Acceptance criteria (demonstrate in transcript)
1. A real Guitar Pro file renders as tab + standard notation in the workspace (screenshot).
2. AlphaTab synth playback works with moving cursor + click-to-seek (described/screenshot).
3. With stems playing at 0.7x, the tab cursor tracks the real audio (offset/BPM sync configured; evidence: screenshots at two positions + tick/seconds mapping logs).
4. Clicking a bar seeks the StemPlayer (log/state evidence). Tests green; committed; ROADMAP checked off.

## Definition of done
`TabViewer` exposes a clean interface (loadScore, setCursorTime, onBarClick) that Phases 5-6 reuse; sync-point data persists per song.
