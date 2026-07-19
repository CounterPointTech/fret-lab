# Fret Lab 🎸

A personal, local web app for learning music theory and songs on guitar:

- **Find & fetch** — search a song, pull its audio from YouTube (local personal use only)
- **Split** — AI stem separation into vocals / drums / bass / **guitar** / piano / other (GPU-accelerated)
- **Transcribe** — AI-drafted guitar tab + sheet music with an interactive correction editor
- **Practice** — per-stem mixing, A-B looping, 0.5–1.0x speed without pitch change, speed trainer
- **Learn** — fretboard/CAGED/scale explorers, chord timelines, and jam mode over real backing stems

See [docs/ROADMAP.md](docs/ROADMAP.md) for the build plan and [CLAUDE.md](CLAUDE.md) for stack, commands, and conventions.

## Dev setup

Prereqs: Python 3.12, Node 20+, ffmpeg on PATH, NVIDIA GPU (CUDA).

```powershell
# Backend
python -m venv backend\.venv
backend\.venv\Scripts\pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu126
backend\.venv\Scripts\pip install -r backend\requirements.txt
cd backend; .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend; npm install; npm run dev   # http://localhost:5173

# Validate the AI pipeline end-to-end (downloads a song, separates stems on GPU)
cd backend; .venv\Scripts\python scripts\validate_pipeline.py
```

## Status

Phase 0 complete: environment proven — song download working, 6-stem GPU separation of a 5:40 track in ~24s on an RTX 4090.
