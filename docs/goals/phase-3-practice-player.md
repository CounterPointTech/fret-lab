# Phase 3 â€” Practice player (core UX, biggest technical risk)

## Objective
The multi-stem practice player: sample-locked playback of all stems with per-stem volume/mute/solo, 0.5â€“1.0x speed **without pitch change**, pitch/transpose control, waveform with A-B loop, and a speed trainer.

## Context
See `CLAUDE.md`. Phase 2 delivered per-stem `.m4a` + peaks JSON. Engine decisions (from research):
- One shared `AudioContext`; decode stems to `AudioBuffer`s; per-stem chain â†’ `GainNode` â†’ master bus. Sources started with a common future `when` for phase lock; recreate sources on seek (they're single-use).
- **Time-stretch: `signalsmith-stretch` (npm, MIT, WASM AudioWorklet)** â€” one stretch instance per stem OR one multi-channel instance; driven by a shared transport position; resync on seek/loop-wrap. Pitch shift (semitones) comes free from the same worklet.
- Waveform: wavesurfer.js v7 with precomputed peaks + Regions plugin for the A-B loop.
- Metronome/loop scheduling: lookahead scheduler pattern ("A Tale of Two Clocks") â€” no setTimeout beat timing.

## âš  Do FIRST: sync prototype (the identified #1 project risk)
Before any player UI, build a throwaway page proving: 4-6 stems playing time-stretched at 0.7x stay in sync through (a) 60s of playback, (b) a seek, (c) an A-B loop wrap, (d) live speed change. Add a debug readout of per-stem position drift (ms). If per-stem stretching can't hold sync (< ~10ms drift), **fallback:** mix the active stems into one buffer and run a single stretch instance (re-mix on mute/solo change) â€” accept and note the tradeoff.
**Natural session split:** if context runs low, stop after the prototype + engine module; UI in next session.

## Tasks
- [x] `src/audio/engine.ts`: StemPlayer class â€” load(stems), play/pause/seek, per-stem gain/mute/solo, playbackRate (0.5â€“1.0), pitchSemitones (Â±12), loop(a,b), onTick(position). Clean AudioContext lifecycle (user-gesture resume).
- [x] Stretch worklet integration (signalsmith-stretch), drift monitor in dev mode.
- [x] Song Workspace page: master transport (play/pause, position, speed slider with % + pitch control), stacked per-stem lanes (name, volume slider, M/S buttons, mini waveform), main waveform w/ draggable A-B region (Regions plugin), loop toggle.
- [x] Speed trainer: configure loop A-B, start %, target %, step % per pass â†’ speed ramps automatically each loop wrap; progress indicator.
- [x] Keyboard shortcuts: space play/pause, L set loop, [ ] speed nudge, arrows seek.
- [x] Tests: engine unit tests where feasible (transport math, loop-wrap scheduling, solo/mute logic); the sync prototype doubles as the integration proof.

## Acceptance criteria (demonstrate in transcript)
1. Sync prototype evidence: drift readout stays < 10ms across playback/seek/loop/speed-change at 0.7x (numbers shown), OR documented fallback engaged with rationale.
2. In the workspace (screenshots + described audio behavior): drums muted, playback at 0.7x, pitch unchanged (subjective but note-able), A-B loop over a chosen section wraps seamlessly.
3. Speed trainer ramps 60%â†’100% in 10% steps across loop passes (state/log evidence).
4. Vitest/unit tests green; committed; ROADMAP checked off.

## Definition of done
`StemPlayer` is a self-contained module with a typed API that Phase 4 can drive (position ticks for tab-cursor sync).
