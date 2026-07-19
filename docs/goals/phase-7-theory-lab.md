# Phase 7 — Theory Lab & Jam Mode (the zombieguitar layer)

## Objective
Interactive music-theory learning woven into real songs: fretboard visualizer (scales/CAGED/chords/tunings), chord timeline over playback, key detection, circle of fifths, metronome, and Jam Mode (solo over looped backing stems with the right scale on screen).

## Context
See `CLAUDE.md`. Inspiration: zombieguitar.com — "the fretboard is movable shapes and patterns"; theory is taught **through jamming over backing tracks with on-screen scale/chord overlays**, not memorization. Building blocks (from research):
- **tonal.js** (MIT): chords, scales, modes, keys, chord/scale detection from note sets, progressions.
- **Fretboard.js** (moonwave99, MIT): SVG fretboard, CAGED boxes, scale rendering, chord voicings, alternate tunings.
- **Chord detection**: server-side on the full mix or instrumental — try `autochord` (pip) first; fallback template-based chroma via librosa if install is painful on Windows. Output `analysis/chords.json` timeline `[{start, end, label}]`. Clean labels with tonal.js. Key estimate from chord histogram (tonal).
- **Metronome**: Web Audio lookahead scheduler (reuse Phase 3 scheduler), accent patterns, tap tempo.

## Tasks
- [ ] Job kind `analyze`: chord timeline + key estimate → `analysis/chords.json`, stored on Song; auto-run after separation.
- [ ] Song Workspace: chord timeline lane synced to playback (current chord highlighted, Chordify-style); transpose display with pitch-shift setting.
- [ ] Theory Lab page: fretboard explorer — pick key/scale/mode (pentatonic, diatonic, harmonic minor) → positions + CAGED boxes; chord explorer (voicings across neck); tuning selector; circle-of-fifths interactive (click key → related chords/scales, highlights fretboard).
- [ ] Jam Mode: from a song — one click mutes guitar stem, loops chosen section, shows detected key/scale on fretboard with chord-tone highlighting per current chord as the progression plays (the zombieguitar experience). Suggested scales from tonal (e.g., minor pentatonic over minor key).
- [ ] Metronome widget (BPM, time sig, accent) usable standalone and over loops.
- [ ] Stretch (only if time): ear-training quiz module (intervals/chords via tonal + AlphaTab synth or WebAudio osc).
- [ ] Tests: chord-label normalization, key-from-chords estimation, scale/CAGED position generation (known shapes), timeline lookup (time → chord).

## Acceptance criteria (demonstrate in transcript)
1. A real song shows a chord timeline scrolling in sync with playback (screenshots at two moments; chords plausibly match the song).
2. Detected key shown; Jam Mode: backing loop plays (guitar muted) while the fretboard displays the recommended scale and highlights current-chord tones (screenshots).
3. Theory Lab renders pentatonic + CAGED boxes for a chosen key and updates with tuning change (screenshots).
4. Metronome timing driven by the lookahead scheduler (no setTimeout beats — code pointer) and audibly steady.
5. Tests green; committed; ROADMAP checked off.

## Definition of done
Theory features link back to songs (per-song key/chords feed the fretboard), not a disconnected demo page.
