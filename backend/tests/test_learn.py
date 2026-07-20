"""Learn progress API: upsert (create/update), list order, validation, delete."""

from datetime import datetime

import pytest

LESSON = "open-chords-basics"


def test_put_creates_progress_without_quiz(client):
    resp = client.put(f"/api/learn/progress/{LESSON}")
    assert resp.status_code == 200
    progress = resp.json()["progress"]
    assert progress["lesson_id"] == LESSON
    assert isinstance(progress["id"], int)
    assert progress["completed_at"] is not None
    assert progress["quiz_correct"] is None
    assert progress["quiz_total"] is None


def test_put_empty_json_body_allowed(client):
    resp = client.put(f"/api/learn/progress/{LESSON}", json={})
    assert resp.status_code == 200
    progress = resp.json()["progress"]
    assert progress["quiz_correct"] is None
    assert progress["quiz_total"] is None


def test_put_with_quiz_score(client):
    resp = client.put(
        f"/api/learn/progress/{LESSON}", json={"quiz_correct": 4, "quiz_total": 5}
    )
    assert resp.status_code == 200
    progress = resp.json()["progress"]
    assert progress["quiz_correct"] == 4
    assert progress["quiz_total"] == 5


def test_reput_updates_in_place(client):
    first = client.put(
        f"/api/learn/progress/{LESSON}", json={"quiz_correct": 2, "quiz_total": 5}
    ).json()["progress"]
    second = client.put(
        f"/api/learn/progress/{LESSON}", json={"quiz_correct": 5, "quiz_total": 5}
    ).json()["progress"]

    assert second["id"] == first["id"]  # same row, not a duplicate
    assert second["quiz_correct"] == 5
    assert second["quiz_total"] == 5
    # completed_at refreshed to now (never moves backwards)
    assert datetime.fromisoformat(second["completed_at"]) >= datetime.fromisoformat(
        first["completed_at"]
    )

    rows = client.get("/api/learn/progress").json()["progress"]
    assert len(rows) == 1


def test_reput_without_body_clears_quiz_score(client):
    client.put(f"/api/learn/progress/{LESSON}", json={"quiz_correct": 3, "quiz_total": 5})
    progress = client.put(f"/api/learn/progress/{LESSON}").json()["progress"]
    assert progress["quiz_correct"] is None
    assert progress["quiz_total"] is None


def test_list_progress_newest_first_and_shape(client):
    for lesson_id in ("lesson-a", "lesson-b", "lesson-c"):
        assert client.put(f"/api/learn/progress/{lesson_id}").status_code == 200

    body = client.get("/api/learn/progress").json()
    assert [p["lesson_id"] for p in body["progress"]] == ["lesson-c", "lesson-b", "lesson-a"]
    for progress in body["progress"]:
        assert set(progress) == {"id", "lesson_id", "completed_at", "quiz_correct", "quiz_total"}


def test_list_progress_empty(client):
    assert client.get("/api/learn/progress").json() == {"progress": []}


@pytest.mark.parametrize(
    "payload",
    [
        # correct above total
        {"quiz_correct": 6, "quiz_total": 5},
        # negative values
        {"quiz_correct": -1, "quiz_total": 5},
        {"quiz_correct": 0, "quiz_total": -5},
        # total must be >= 1 when present
        {"quiz_correct": 0, "quiz_total": 0},
        # both fields or neither
        {"quiz_correct": 3},
        {"quiz_total": 5},
    ],
)
def test_put_invalid_quiz_payload_422(client, payload):
    resp = client.put(f"/api/learn/progress/{LESSON}", json=payload)
    assert resp.status_code == 422
    # nothing persisted on a rejected request
    assert client.get("/api/learn/progress").json() == {"progress": []}


@pytest.mark.parametrize(
    "lesson_id",
    [
        "Bad_ID!",  # uppercase / underscore / punctuation
        "-leading-hyphen",  # must start with [a-z0-9]
        "a" * 81,  # over the 80-char cap
    ],
)
def test_put_invalid_lesson_id_422(client, lesson_id):
    resp = client.put(f"/api/learn/progress/{lesson_id}")
    assert resp.status_code == 422


def test_delete_progress(client):
    client.put(f"/api/learn/progress/{LESSON}")
    resp = client.delete(f"/api/learn/progress/{LESSON}")
    assert resp.status_code == 204
    assert client.get("/api/learn/progress").json() == {"progress": []}


def test_delete_missing_progress_404(client):
    resp = client.delete("/api/learn/progress/never-completed")
    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"] == "Lesson progress not found"  # shape the frontend parses
    assert body["code"] == "not_found"
