"""Songs API: add/enqueue, list, cache hit, delete cleanup, error path, SSE."""

import json
import time

from app import config

GOOD_ID = "dQw4w9WgXcQ"
BAD_ID = "bad_id_0000"  # conftest's fake download handler fails ids starting with "bad"


def _wait_job(client, job_id, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in ("done", "error", "cancelled"):
            return job
        time.sleep(0.02)
    raise TimeoutError(f"job {job_id} still {job['status']}")


def test_add_song_enqueues_download(client):
    resp = client.post(
        "/api/songs",
        json={"video_id": GOOD_ID, "title": "Test Song", "channel": "Test", "duration_s": 213},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["song"]["video_id"] == GOOD_ID
    assert body["job_id"]

    job = _wait_job(client, body["job_id"])
    assert job["status"] == "done"
    assert job["kind"] == "download"

    songs = client.get("/api/songs").json()["songs"]
    assert len(songs) == 1
    assert songs[0]["video_id"] == GOOD_ID
    assert songs[0]["active_job_id"] is None


def test_add_song_invalid_id_rejected(client):
    for bad in ("../../etc", "a", "id with spaces", "x" * 30):
        resp = client.post("/api/songs", json={"video_id": bad, "title": "t"})
        assert resp.status_code == 422, bad


def test_cache_hit_returns_no_job(client):
    resp = client.post("/api/songs", json={"video_id": GOOD_ID, "title": "Test"})
    _wait_job(client, resp.json()["job_id"])
    # simulate a completed download on disk + ready status
    song_dir = config.settings.media_root / GOOD_ID
    song_dir.mkdir(parents=True, exist_ok=True)
    (song_dir / "source.wav").write_bytes(b"RIFF")
    from app.db.models import Song
    from app.db.session import db_session

    with db_session() as db:
        db.get(Song, GOOD_ID).status = "ready"

    resp = client.post("/api/songs", json={"video_id": GOOD_ID, "title": "Test"})
    assert resp.status_code == 201
    assert resp.json()["job_id"] is None  # never reprocess on cache hit


def test_failed_download_persists_error(client):
    resp = client.post("/api/songs", json={"video_id": BAD_ID, "title": "Bad"})
    job = _wait_job(client, resp.json()["job_id"])
    assert job["status"] == "error"
    assert "Video unavailable" in job["error"]

    songs = client.get("/api/songs").json()["songs"]
    assert songs[0]["status"] == "error"
    assert "Video unavailable" in songs[0]["last_error"]


def test_delete_removes_media_dir_and_rows(client):
    resp = client.post("/api/songs", json={"video_id": GOOD_ID, "title": "Test"})
    _wait_job(client, resp.json()["job_id"])
    song_dir = config.settings.media_root / GOOD_ID
    song_dir.mkdir(parents=True, exist_ok=True)
    (song_dir / "source.wav").write_bytes(b"RIFF")
    (song_dir / "metadata.json").write_text("{}")

    assert client.delete(f"/api/songs/{GOOD_ID}").status_code == 204
    assert not song_dir.exists()
    assert client.get("/api/songs").json()["songs"] == []
    assert client.delete(f"/api/songs/{GOOD_ID}").status_code == 404


def test_sse_stream_reaches_terminal_event(client):
    resp = client.post("/api/songs", json={"video_id": GOOD_ID, "title": "Test"})
    job_id = resp.json()["job_id"]
    events = []
    with client.stream("GET", f"/api/jobs/{job_id}/events") as stream:
        data_lines = []
        for line in stream.iter_lines():
            if line.startswith("data:"):
                data_lines.append(line[5:].strip())
            elif line == "" and data_lines:
                payload = "".join(data_lines)
                data_lines = []
                if payload:
                    events.append(json.loads(payload))
                if events and events[-1].get("status") in ("done", "error", "cancelled"):
                    break
    assert events, "expected at least one SSE event"
    assert events[-1]["status"] == "done"
    assert events[-1]["progress"] == 1.0


def test_sse_unknown_job_404(client):
    assert client.get("/api/jobs/doesnotexist/events").status_code == 404
