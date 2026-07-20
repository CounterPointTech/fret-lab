"""Transcription CRUD: upload, list, serve, sync-settings patch, delete —
happy paths and the error paths (bad extension, empty file, missing song,
traversal attempts)."""

import time

from app import config

SONG_ID = "dQw4w9WgXcQ"


def _wait_job(client, job_id, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in ("done", "error", "cancelled"):
            return job
        time.sleep(0.02)
    raise TimeoutError(f"job {job_id} still {job['status']}")


def _add_song(client):
    resp = client.post("/api/songs", json={"video_id": SONG_ID, "title": "Test"})
    _wait_job(client, resp.json()["job_id"])


def _upload(client, filename, content=b"fake-gp-bytes", song_id=SONG_ID):
    return client.post(
        f"/api/songs/{song_id}/transcriptions",
        files={"file": (filename, content, "application/octet-stream")},
    )


def test_upload_list_and_serve(client):
    _add_song(client)
    resp = _upload(client, "My Song (ver 2).gp5")
    assert resp.status_code == 201, resp.text
    t = resp.json()["transcription"]
    assert t["kind"] == "guitarpro"
    assert t["name"] == "My Song (ver 2).gp5"
    assert t["sync_offset_s"] == 0.0
    assert t["sync_bpm"] is None

    listed = client.get(f"/api/songs/{SONG_ID}/transcriptions").json()["transcriptions"]
    assert [x["id"] for x in listed] == [t["id"]]

    served = client.get(t["file_url"])
    assert served.status_code == 200
    assert served.content == b"fake-gp-bytes"


def test_upload_kinds_detected(client):
    _add_song(client)
    for filename, kind in [
        ("a.gp", "guitarpro"),
        ("b.musicxml", "musicxml"),
        ("c.alphatex", "alphatex"),
    ]:
        resp = _upload(client, filename)
        assert resp.status_code == 201
        assert resp.json()["transcription"]["kind"] == kind


def test_upload_rejects_bad_input(client):
    _add_song(client)
    assert _upload(client, "notes.txt").status_code == 400
    assert _upload(client, "noextension").status_code == 400
    assert _upload(client, "empty.gp5", content=b"").status_code == 400
    assert _upload(client, "a.gp5", song_id="nosuchsong1").status_code == 404


def test_upload_sanitizes_traversal_filename(client):
    _add_song(client)
    resp = _upload(client, "..\\..\\evil.gp5")
    assert resp.status_code == 201
    t = resp.json()["transcription"]
    # stored inside the song's transcriptions dir, not wherever the name said
    files = list((config.settings.media_root / SONG_ID / "transcriptions").iterdir())
    assert len(files) == 1
    assert "evil" in files[0].name
    assert client.get(t["file_url"]).status_code == 200


def test_patch_sync_settings_persist(client):
    _add_song(client)
    tid = _upload(client, "tab.gp5").json()["transcription"]["id"]

    resp = client.patch(
        f"/api/transcriptions/{tid}", json={"sync_bpm": 112.0, "sync_offset_s": 1.25}
    )
    assert resp.status_code == 200
    t = resp.json()["transcription"]
    assert t["sync_bpm"] == 112.0
    assert t["sync_offset_s"] == 1.25

    # partial patch leaves other fields alone
    resp = client.patch(f"/api/transcriptions/{tid}", json={"sync_offset_s": 1.5})
    t = resp.json()["transcription"]
    assert t["sync_bpm"] == 112.0
    assert t["sync_offset_s"] == 1.5

    listed = client.get(f"/api/songs/{SONG_ID}/transcriptions").json()["transcriptions"]
    assert listed[0]["sync_bpm"] == 112.0

    assert client.patch("/api/transcriptions/9999", json={"sync_bpm": 100}).status_code == 404
    assert (
        client.patch(f"/api/transcriptions/{tid}", json={"sync_bpm": 0}).status_code == 422
    )


def test_delete_removes_row_and_file(client):
    _add_song(client)
    t = _upload(client, "tab.gp5").json()["transcription"]

    assert client.delete(f"/api/transcriptions/{t['id']}").status_code == 204
    assert client.get(t["file_url"]).status_code == 404
    listed = client.get(f"/api/songs/{SONG_ID}/transcriptions").json()["transcriptions"]
    assert listed == []
    files = list((config.settings.media_root / SONG_ID / "transcriptions").iterdir())
    assert files == []

    assert client.delete("/api/transcriptions/9999").status_code == 404
