# Phase 6 — Correction editor

## Objective
Interactive editing layer over AlphaTab's score model so AI drafts become accurate tabs: select/change notes, techniques, undo/redo, loop-while-editing.

## Context
See `CLAUDE.md`. Phase 5 produces AI drafts (MusicXML/alphaTex). AlphaTab renders and exposes its score data model + an alphaTex exporter, but has **no built-in editor** — this layer is ours and it's where "accurate transcription" actually happens (AI drafts are ~80% right). The workflow to optimize: *loop 2 bars at 0.5x with the guitar stem soloed while fixing those bars.*

**Natural session split if needed:** (a) selection + read-only inspection + note-property panel; (b) mutations + undo/redo + persistence.

## Tasks
- [ ] Selection model: click note in TabViewer → selected (visual highlight); keyboard nav between notes/beats.
- [ ] Mutations on the AlphaTab score model with re-render: change fret; move to adjacent string (auto-recompute fret for same pitch); change pitch ±semitone; change duration; insert/delete note & rest; toggle techniques: hammer-on/pull-off, slide, bend (simple full/half), palm mute, vibrato; per-note string override "lock".
- [ ] Undo/redo stack (command pattern over mutations).
- [ ] Persistence: serialize edited score → MusicXML + alphaTex back to `media/{videoId}/transcriptions/` (autosave debounced + explicit save); "AI draft" label clears to "edited" on first change.
- [ ] Edit-in-context: "loop selection" button — selected bars become the StemPlayer A-B loop (via Phase 4 sync mapping) with one-click 0.5x + solo-stem preset.
- [ ] Audition: play edited notes via AlphaTab synth (bar-level) to hear corrections.
- [ ] Tests: mutation commands (apply/undo symmetry), fret-recompute-on-string-change math, save/reload round-trip preserves edits.

## Acceptance criteria (demonstrate in transcript)
1. Open an AI draft, change a wrong note's fret and string, hear it via synth (described), and the change survives save + full reload (round-trip shown).
2. Insert and delete a note; undo/redo both (state evidence/screenshots).
3. A technique (bend or hammer-on) toggled and rendered in the tab (screenshot).
4. "Loop selection" sets the real-audio A-B loop at 0.5x with the stem soloed (state evidence).
5. Unit tests green (incl. undo symmetry + round-trip); committed; ROADMAP checked off.

## Definition of done
Editing feels usable for real correction work (keyboard-first where sensible); serialization is lossless for everything the editor can produce.
