"""Practice history API: create, list + summary math, validation, error paths."""

import logging
import time
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

GOOD_ID = "dQw4w9WgXcQ"


def _wait_job(client, job_id, timeout=5.0):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in ("done", "error", "cancelled"):
            return job
    raise TimeoutError(f"job {job_id} still {job['status']}")


def _add_song(client, video_id=GOOD_ID):
    resp = client.post("/api/songs", json={"video_id": video_id, "title": "Test Song"})
    assert resp.status_code == 201
    _wait_job(client, resp.json()["job_id"])


def test_create_practice_session_happy_path(client):
    _add_song(client)
    loops = [
        {"a": 12.5, "b": 24.0, "max_rate": 0.75, "plays": 4},
        {"a": 60.0, "b": 75.5, "max_rate": 1.0, "plays": 2},
    ]
    resp = client.post(
        f"/api/songs/{GOOD_ID}/practice-sessions",
        json={"play_seconds": 180.5, "max_rate": 0.9, "loops": loops},
    )
    assert resp.status_code == 201
    session = resp.json()["session"]
    assert session["song_id"] == GOOD_ID
    assert session["play_seconds"] == 180.5
    assert session["max_rate"] == 0.9
    assert session["loops"] == loops
    assert session["started_at"] is not None
    assert session["ended_at"] is not None  # set server-side


def test_create_session_client_started_at_and_empty_loops(client):
    _add_song(client)
    started = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    resp = client.post(
        f"/api/songs/{GOOD_ID}/practice-sessions",
        json={"started_at": started, "play_seconds": 60, "max_rate": 1.0, "loops": []},
    )
    assert resp.status_code == 201
    session = resp.json()["session"]
    assert session["loops"] == []
    # SQLite drops tzinfo on round-trip; compare the wall-clock instant
    assert session["started_at"].startswith(started[:19])


def test_create_session_unknown_song_404(client):
    resp = client.post(
        "/api/songs/nosuchvideo/practice-sessions",
        json={"play_seconds": 10, "max_rate": 1.0, "loops": []},
    )
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"] == "Song not found"  # shape the frontend parses
    assert body["code"] == "not_found"


def test_list_sessions_unknown_song_404(client):
    resp = client.get("/api/songs/nosuchvideo/practice-sessions")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Song not found"


@pytest.mark.parametrize(
    "payload",
    [
        # negative play time
        {"play_seconds": -1, "max_rate": 1.0, "loops": []},
        # rate out of range (zero, negative, above 2)
        {"play_seconds": 10, "max_rate": 0, "loops": []},
        {"play_seconds": 10, "max_rate": -0.5, "loops": []},
        {"play_seconds": 10, "max_rate": 2.5, "loops": []},
        # loop with a >= b
        {
            "play_seconds": 10,
            "max_rate": 1.0,
            "loops": [{"a": 20.0, "b": 20.0, "max_rate": 1.0, "plays": 1}],
        },
        {
            "play_seconds": 10,
            "max_rate": 1.0,
            "loops": [{"a": 30.0, "b": 10.0, "max_rate": 1.0, "plays": 1}],
        },
        # loop rate out of range
        {
            "play_seconds": 10,
            "max_rate": 1.0,
            "loops": [{"a": 1.0, "b": 2.0, "max_rate": 3.0, "plays": 1}],
        },
    ],
)
def test_create_session_invalid_payload_422(client, payload):
    _add_song(client)
    resp = client.post(f"/api/songs/{GOOD_ID}/practice-sessions", json=payload)
    assert resp.status_code == 422


def test_list_sessions_newest_first_and_summary_math(client):
    _add_song(client)
    now = datetime.now(timezone.utc)
    entries = [
        # (started_at, play_seconds) — one outside the 7-day window
        (now - timedelta(days=10), 100.0),
        (now - timedelta(days=1), 50.0),
        (now - timedelta(minutes=5), 25.0),
    ]
    for started_at, play_seconds in entries:
        resp = client.post(
            f"/api/songs/{GOOD_ID}/practice-sessions",
            json={
                "started_at": started_at.isoformat(),
                "play_seconds": play_seconds,
                "max_rate": 1.0,
                "loops": [],
            },
        )
        assert resp.status_code == 201

    body = client.get(f"/api/songs/{GOOD_ID}/practice-sessions").json()
    assert [s["play_seconds"] for s in body["sessions"]] == [25.0, 50.0, 100.0]
    summary = body["summary"]
    assert summary["session_count"] == 3
    assert summary["total_seconds"] == pytest.approx(175.0)
    assert summary["week_seconds"] == pytest.approx(75.0)  # 10-day-old one excluded


def test_summary_empty_for_song_with_no_sessions(client):
    _add_song(client)
    body = client.get(f"/api/songs/{GOOD_ID}/practice-sessions").json()
    assert body["sessions"] == []
    assert body["summary"] == {"total_seconds": 0, "session_count": 0, "week_seconds": 0}


def test_unhandled_exception_returns_clean_json_and_logs(tmp_env, caplog):
    """The catch-all handler must return {"detail", "code"} JSON and log the
    traceback via the fretlab logger — never a silent or HTML 500."""
    from app.main import app

    @app.get("/api/_test_boom")
    async def _boom() -> dict:  # pragma: no cover - body never completes
        raise RuntimeError("kaboom")

    try:
        with caplog.at_level(logging.ERROR, logger="fretlab"):
            with TestClient(app, raise_server_exceptions=False) as c:
                resp = c.get("/api/_test_boom")
        assert resp.status_code == 500
        assert resp.json() == {"detail": "kaboom", "code": "internal"}
        assert any(r.exc_info for r in caplog.records), "traceback not logged"
        assert "kaboom" in caplog.text
    finally:
        # don't leak the throwaway route into other tests
        app.router.routes[:] = [
            r for r in app.router.routes if getattr(r, "path", None) != "/api/_test_boom"
        ]
