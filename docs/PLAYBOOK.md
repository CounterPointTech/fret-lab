# Fret Lab — Session Playbook

How to drive the build, phase by phase, with `/goal`. One phase = one fresh Claude Code session.

## The ritual (every phase)

1. **Open a fresh session** — terminal in `E:\Projects\Web-Projects\Fret Lab`, run `claude`. (Fresh session = fresh context window; don't reuse yesterday's.)
2. **Paste the phase's goal prompt** (below).
3. **Let it run.** Approve permission prompts as they come, or turn on auto-accept (Shift+Tab) if you want it hands-off. Check progress anytime by typing `/goal` with no arguments; stop early with `/goal clear`.
4. **When the goal completes, review before moving on:**
   - Skim what it reports against the acceptance criteria in the goal doc.
   - Actually try it: start both dev servers and click around (commands in `CLAUDE.md` / README).
   - Listen with your ears where relevant (stem quality, sync, pitch) — the evaluator can't hear.
5. **Push:** if the session only committed, tell it `push to origin` (or run `git push`).
6. **Close the session.** Next phase gets a new one.

## If a session runs low on context mid-phase

Run `/prepare-next-session`, close, open a fresh session, and paste the **same** goal prompt again — the goal docs + handoff notes make it resumable. (If you accidentally close a terminal mid-goal, `claude --resume` also restores it.)

## Goal prompts, in order

Phase 1 — Song acquisition & library:
```
/goal implement docs/goals/phase-1-song-acquisition.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 25 turns
```

Phase 2 — Separation pipeline & caching:
```
/goal implement docs/goals/phase-2-separation.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 25 turns
```

Phase 3 — Practice player (⚠ biggest phase; may need two sessions — the doc marks the split point):
```
/goal implement docs/goals/phase-3-practice-player.md: the sync prototype risk is resolved first, then all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 30 turns
```

Phase 4 — Tab & sheet music rendering:
```
/goal implement docs/goals/phase-4-tab-rendering.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 25 turns
```

Phase 5 — AI transcription draft:
```
/goal implement docs/goals/phase-5-transcription.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 25 turns
```

Phase 6 — Correction editor (large; doc marks the split point if it needs two sessions):
```
/goal implement docs/goals/phase-6-editor.md: all acceptance criteria demonstrated including the save/reload round-trip and undo/redo, ROADMAP.md checked off, work committed and pushed, or stop after 30 turns
```

Phase 7 — Theory Lab & Jam Mode:
```
/goal implement docs/goals/phase-7-theory-lab.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed and pushed, or stop after 25 turns
```

Phase 8 — Beauty & polish:
```
/goal implement docs/goals/phase-8-polish.md: the frontend-aesthetics skill is used before styling, all acceptance criteria demonstrated including the full end-to-end walkthrough, ROADMAP.md checked off, work committed and pushed, or stop after 30 turns
```

## Why the prompts are phrased this way

- **"acceptance criteria demonstrated"** — the goal evaluator only reads the transcript; it can't run commands itself. The criteria in each goal doc are written so Claude must *show* the evidence (test output, file listings, screenshots).
- **"or stop after N turns"** — runaway guard. If it stops on turns without finishing, review what's done, then re-issue the same prompt in a fresh session.
- **"committed and pushed"** — keeps GitHub current at every phase boundary.

## Between phases (optional but good)

- Play with the new feature for real — your feedback is worth more than any test. Jot issues into the *next* phase's goal doc under a "Carry-over fixes" heading before starting it.
- If stem quality, sync feel, or transcription accuracy disappoints, say so at the start of the next session — course corrections are cheapest at phase boundaries.
