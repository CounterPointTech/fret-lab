# Phase 2 — Separation pipeline & caching

## Objective
One click turns a library song into 6 cached, browser-playable stems (vocals, drums, bass, guitar, piano, other) with waveform peak data.

## Context
See `CLAUDE.md`. Phase 1 delivered the job queue + SSE + Library. `audio-separator` is installed and GPU-validated (Phase 0). Recipe from research: **BS-RoFormer** (`model_bs_roformer_ep_317_sdr_12.9755.ckpt`) splits vocals/instrumental at top quality, then **htdemucs_6s** on the instrumental yields guitar/bass/drums/piano/other. Models auto-download on first use (cache under `models/`, gitignored). Keep models warm-loaded in the worker between jobs.

## Tasks
- [x] `pipeline/separate.py`: cascade recipe above; write `media/{videoId}/stems/{vocals,drums,bass,guitar,piano,other}.wav`; progress callbacks per stage; handle model-download progress, GPU OOM (retry with segment option), missing source.
- [x] `pipeline/encode.py`: ffmpeg each stem → `.m4a` (AAC ~192k) for browser delivery.
- [x] `pipeline/peaks.py`: per-stem min/max peaks JSON (e.g. ~1000 buckets/track) → `media/{videoId}/peaks/{stem}.json` (wavesurfer can consume precomputed peaks).
- [x] `Stem` DB model (song_id, name, wav_path, m4a_path, peaks_path, duration). Job kind `separate` chained stages: separate → encode → peaks.
- [x] **Cache semantics:** if stems exist for videoId, job completes instantly (no reprocessing). Deleting a song clears cache.
- [x] API: `POST /api/songs/{id}/separate`, `GET /api/songs/{id}/stems`, static/streamed audio at `GET /api/media/{videoId}/stems/{stem}.m4a` (support Range requests).
- [x] Frontend: "Separate" action on library card with SSE progress (stage labels: "Isolating vocals… / Splitting instruments… / Encoding…"); song page lists stems with bare `<audio>` players (real player is Phase 3).
- [x] Tests: cache-hit short-circuit, OOM-retry path (mock), stems API, delete clears media.

## Acceptance criteria (demonstrate in transcript)
1. A real library song separates end-to-end; job SSE shows staged progress; 6 `.wav` + 6 `.m4a` + 6 peaks JSON exist (dir listing shown); total time printed (expect < ~90s on 4090 incl. both models).
2. Re-running separate on the same song returns done near-instantly (cache hit shown in logs/timing).
3. Guitar stem `.m4a` plays in the browser (screenshot / audio element state) and is audibly guitar (spot-check by Daniel later — note any obvious bleed in a comment).
4. `pytest` green; committed; ROADMAP checked off.

## Definition of done
`media/{videoId}/` layout matches CLAUDE.md conventions; worker keeps models loaded across consecutive jobs (second job's model-load time ≈ 0, shown in logs).
