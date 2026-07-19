# Phase 1 — Song acquisition & library

## Objective
Search YouTube, pick a result, download+normalize audio as a background job with live progress, and show a persistent song library.

## Context
See `CLAUDE.md` for stack. Phase 0 delivered: FastAPI + Vite talking, venv with yt-dlp, validated download path. This phase builds the **generic job infrastructure** every later phase reuses: in-process asyncio job queue (single worker is fine — one GPU), job records in SQLite, progress via SSE.

## Tasks
- [ ] DB models (`backend/app/db/`): `Song` (video_id PK, title, artist/channel, duration, thumbnail_url, status, created_at), `Job` (id, song_id, kind, status, progress, stage, error, timestamps). SQLite at `backend/fretlab.db`.
- [ ] Job queue (`backend/app/jobs/queue.py`): enqueue(kind, song_id) → job id; async worker loop; stages with progress callbacks; typed errors persisted to job.error; cancellation support.
- [ ] SSE endpoint `GET /api/jobs/{id}/events` (sse-starlette) streaming `{stage, progress, status}`; terminal event on done/error.
- [ ] Pipeline stage `ytdlp_download.py`: given video_id → bestaudio → `media/{videoId}/source.wav` (ffmpeg, 44.1kHz stereo) + metadata + thumbnail. Use yt-dlp progress hooks → job progress. Handle: video unavailable, network fail, bot-check (surface actionable error message re: `--cookies-from-browser`).
- [ ] API: `GET /api/search?q=` (yt-dlp `ytsearch8:`, flat extraction — title/id/channel/duration/thumb), `POST /api/songs` (enqueue download), `GET /api/songs`, `DELETE /api/songs/{id}` (removes media dir + rows).
- [ ] Frontend: Library page (grid of songs w/ artwork, status badges), Search modal (query → results → click to add), job progress UI driven by SSE (EventSource), toasts on error. React Router if not already present.
- [ ] Tests: queue happy path + failure path (bad video id → job status=error, error message persisted), search endpoint mocked, cache-dir cleanup on delete.

## Acceptance criteria (demonstrate in transcript)
1. Search for a real song via the UI (or curl `GET /api/search?q=...` showing results JSON).
2. Adding a song creates a job; SSE stream output shows progress advancing to `done`; `media/{videoId}/source.wav` exists (ffprobe output shown).
3. Library GET returns the song with metadata; UI screenshot shows it with artwork.
4. A deliberately bad video id produces a failed job with a persisted, meaningful error (shown).
5. `pytest` green; work committed; ROADMAP checked off.

## Definition of done
Job/SSE infrastructure is generic (kind-based) and documented in code, ready for Phase 2 to plug `separate` jobs in.
