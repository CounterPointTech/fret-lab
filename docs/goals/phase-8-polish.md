# Phase 8 — Beauty & polish pass

## Objective
Make Fret Lab look and feel extraordinary — a cohesive dark-studio aesthetic — and harden the rough edges of every flow.

## Context
See `CLAUDE.md`. All features exist (Phases 0-7). **Invoke the `frontend-aesthetics` (or `frontend-design`) skill before styling work** — the explicit goal is to avoid generic templated "AI slop" UI. Direction from research: dark studio aesthetic (near-black canvas), ONE saturated accent color, waveform-centric layout, stacked per-stem lanes with inline controls, subtle ambient glow on the transport, purposeful motion. Reference feel: Moises + Soundslice practice UIs.

## Tasks
- [ ] Design system: tokens (colors incl. dark theme, type scale with a distinctive display face, spacing, radii), applied app-wide; kill any default-Tailwind-look remnants.
- [ ] Song Workspace redesign: waveform as the hero, transport with glow accent, stem lanes as a cohesive mixer, chord lane + tab integrated without clutter; responsive down to laptop widths.
- [ ] Library redesign: rich cards, hover states, processing status as elegant progress, empty states that guide (first-run experience → search).
- [ ] Micro-interactions: play-button morph, loop-region pulse on wrap, speed-trainer ramp indicator, satisfying M/S toggles. Motion respects `prefers-reduced-motion`.
- [ ] Keyboard shortcut overlay (?), consistent toasts/error surfaces (actionable messages, esp. yt-dlp bot-check guidance), loading skeletons.
- [ ] Practice history: log practice sessions per song (time, sections looped, speeds reached) in SQLite; simple progress view ("you took this solo from 60% → 85% this week").
- [ ] Sweep: console errors, unhandled promise rejections, backend exception handlers at API boundary (typed errors → clean JSON), lighthouse-style perf sanity (bundle size, lazy-load AlphaTab/worklets).
- [ ] Full E2E walkthrough: search → download → separate → practice → transcribe → edit → jam. Fix what snags.

## Acceptance criteria (demonstrate in transcript)
1. Before/after screenshots of Library and Song Workspace; the after has a distinctive, cohesive visual identity (no default component-library look).
2. Full E2E flow completed on a fresh song with screenshots at each stage, no console errors (console output shown).
3. Keyboard overlay + reduced-motion support demonstrated (code + screenshot).
4. Practice history records a real session and renders (screenshot).
5. Tests green; committed; ROADMAP fully checked off. 🎸

## Definition of done
Daniel would show it to a friend unprompted.
