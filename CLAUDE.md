# Fret Lab

Personal (local, single-user) web app for learning guitar: search a song on YouTube, download its audio, AI-separate it into per-instrument stems, auto-transcribe guitar/bass to tab + sheet music with a correction editor, and practice with per-stem mixing, A-B looping, and slow-down-without-pitch-change. Plus an interactive music-theory lab (fretboard/CAGED/scales, chord timelines, jam mode).

**This is a personal tool that runs only on Daniel's own Windows machine.** The YouTube-download pipeline is acceptable in that context only — never turn this into a hosted/public service without switching to user-uploaded audio.

## Roadmap & session workflow

- `docs/ROADMAP.md` — phase checklist. **Work one phase per session.**
- `docs/goals/phase-N-*.md` — self-contained goal doc per phase (objective, context, tasks, measurable acceptance criteria). Each is written so a fresh session needs no prior conversation.
- Execution: `/goal implement docs/goals/phase-N-<name>.md: all acceptance criteria demonstrated, ROADMAP.md checked off, work committed, or stop after 25 turns`
- If context runs low mid-phase: `/prepare-next-session`, then re-issue the same `/goal` in a fresh session.
- Check off ROADMAP.md items as phases complete. Commit at phase boundaries.

## Stack (decided after research — don't relitigate)

- **Frontend:** Vite + React + TypeScript + Tailwind v4 (`frontend/`)
- **Backend:** Python 3.12, FastAPI + uvicorn, SQLite via SQLAlchemy (`backend/`), in-process asyncio job queue + SSE progress (NO Celery/Redis — single user, Windows)
- **Download:** yt-dlp (`ytsearch` for search — no YouTube API key), ffmpeg already on PATH
- **Separation:** `audio-separator` (PyPI) — BS-RoFormer for vocals/instrumental + `htdemucs_6s` for 6-stem (incl. guitar). GPU: RTX 4090 (CUDA torch from cu126 index — plain `pip install torch` on Windows gives CPU-only!)
- **Transcription:** Spotify Basic Pitch → MIDI → DP string/fret assignment → MusicXML/alphaTex
- **Tab/notation:** AlphaTab (`@coderline/alphatab`) — rendering, synth playback, cursor sync; our editor layer sits on its score model
- **Time-stretch/pitch:** signalsmith-stretch (WASM AudioWorklet); raw Web Audio engine (one shared AudioContext, per-stem gain, lookahead scheduler)
- **Waveform/loop:** wavesurfer.js v7 + Regions plugin
- **Theory:** tonal.js + Fretboard.js (moonwave99)

Full rationale, alternatives, and risks: `docs/ROADMAP.md` header + the approved plan in `docs/goals/`.

## Commands

- Backend dev: `backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000` (run from `backend/`)
- Frontend dev: `npm run dev` (from `frontend/`, port 5173, proxies `/api` → 8000)
- Backend tests: `backend\.venv\Scripts\python.exe -m pytest` (from `backend/`)
- Always use the venv python at `backend/.venv` — system python lacks the AI stack.

## Conventions

- Media cache: `media/{videoId}/` — source.wav, `stems/*.wav|.m4a`, `peaks/*.json`, `analysis/chords.json`, `transcriptions/*`. Keyed by YouTube video ID; **never reprocess on cache hit**. Gitignored.
- Pipeline stages live in `backend/app/pipeline/` as pure-ish functions with progress callbacks; the job queue (`backend/app/jobs/`) orchestrates and streams SSE.
- Error paths get tests, not just happy paths (global rule). No silent exception swallowing.
- Windows: asyncio subprocesses need ProactorEventLoop (uvicorn default is fine); quote paths (repo path contains a space: `Fret Lab`).
