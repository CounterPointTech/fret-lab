# Phase 9 — "Learn": structured guitar-theory curriculum

## Objective
Turn the theory area from a toolbox into a school: a professional 8-course curriculum
(zombieguitar.com-style — shapes first, learn by doing) with quizzes, progress tracking,
and jam-mode integration. Restructure the nav: **Learn** first, songs tab renamed **Songs**.

## Context
See `CLAUDE.md`. Phases 0–8 complete. The theory layer (`frontend/src/theory/`) is pure and
tested; `FretboardView` renders any `FretPosition[]`. Jam mode over separated stems is the
app's "backing tracks". Approved plan (2026-07-20) is authoritative:
`C:\Users\Daniel\.claude\plans\so-this-is-looking-glittery-wilkes.md`.

## Tasks
- [x] Backend: `LessonProgress` model + `/api/learn/progress` (GET/PUT upsert/DELETE) + tests.
- [x] Learn scaffolding: `frontend/src/learn/` — types (Course/Module/Lesson/Block/DiagramSpec),
      resolver (computed diagrams via theory fns), Markdown subset, QuizBlock, LessonFretboard,
      JamCTA (matching library songs by key), CourseCard/ProgressRing, useLearnProgress.
- [x] Routes: /learn (catalog), /learn/tools (relocated Theory Lab → "Theory Tools"),
      /learn/reference (data-driven cheat sheets), /learn/:courseId(/:lessonId);
      /theory → redirect preserving query; nav Learn-first, "Songs".
- [x] Content: 8 courses / 50 lessons (foundations, pentatonics, blues, harmony, caged,
      chord-tones, modes, phrasing) — per-course lazy chunks, quizzes, jam CTAs.
- [x] Theory-accuracy review pass (re-derive quiz answers, spec↔prose agreement) —
      ~150 questions re-derived, 0 wrong answer indices, 6 prose fixes.
- [x] Verification: content integrity vitest, tsc/build (8 course chunks ~9-11 KB gz each),
      pytest 125, driven-browser pass (catalog, quiz feedback, progress API round-trip,
      /theory redirect with params, nav Learn-first) — zero console errors.

**Done 2026-07-20.**

## Acceptance criteria (demonstrate in transcript)
1. /learn catalog with 8 courses + progress rings; lesson page with rendered diagrams,
   working quiz (wrong → rose + explanation, right → amber), completion recorded via API.
2. Content integrity tests green (unique ids, quiz answers in range, all diagrams resolve);
   full test suites green (backend + frontend).
3. /theory?key=…&song=… redirects to /learn/tools with params intact; nav shows Learn first.
4. Jam CTA lists a real library song in a matching key.
5. ROADMAP checked off; committed and pushed. 🎓

## Definition of done
Daniel can sit down at lesson 1 knowing nothing and come out the far end composing solos —
without the app ever feeling like a textbook.
