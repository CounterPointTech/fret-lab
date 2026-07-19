# Phase 0 — Foundation & environment proof

## Objective
Working monorepo skeleton + hard proof that the two riskiest externals work on this machine: yt-dlp audio download and GPU stem separation.

## Context
Greenfield repo (github.com/CounterPointTech/fret-lab). Stack decisions are final — see `CLAUDE.md`. Machine: Windows 11, Python 3.12, Node 20, ffmpeg on PATH, RTX 4090. CUDA torch must come from the `cu126` index (PyPI torch on Windows is CPU-only).

## Tasks
- [ ] Scaffold `frontend/` (Vite react-ts + Tailwind v4 via `@tailwindcss/vite`)
- [ ] Scaffold `backend/` — venv at `backend/.venv`; install: torch/torchaudio (cu126 index), `audio-separator[gpu]`, yt-dlp, fastapi, uvicorn[standard], sqlalchemy, aiosqlite, sse-starlette, httpx, pytest. Freeze to `backend/requirements.txt`.
- [ ] Minimal FastAPI app (`backend/app/main.py`) with `GET /api/health` → `{"status":"ok","gpu":<torch.cuda.get_device_name>}`
- [ ] Vite dev proxy `/api` → `http://localhost:8000`; App shows health response (proves frontend↔backend)
- [ ] Validation script `backend/scripts/validate_pipeline.py`: yt-dlp `ytsearch1:` a song → download bestaudio → ffmpeg to WAV in `media/_validation/` → run `htdemucs_6s` via audio-separator → print stem paths + timing + `torch.cuda.is_available()`
- [ ] Run it; confirm 6 stems on disk and GPU was used (separation time well under a minute)
- [ ] `CLAUDE.md`, `docs/ROADMAP.md`, all goal docs committed; `.gitignore` excludes media/, .venv/, node_modules/, models/

## Acceptance criteria (demonstrate in transcript)
1. `validate_pipeline.py` output shows: download succeeded, `cuda_available True`, 6 stem files listed, separation wall-time printed (< 60s expected on 4090).
2. `GET /api/health` returns 200 with GPU name (curl/httpx output shown).
3. Frontend dev server renders a page displaying the health payload (screenshot or fetched HTML/console evidence).
4. `pytest` runs green (at least a health-endpoint test).
5. All of the above committed on `main`.

## Definition of done
A fresh clone + documented commands reproduces the dev environment; ROADMAP Phase 0 checked off.
