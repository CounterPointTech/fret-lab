"""Search endpoint with yt-dlp mocked out."""

import yt_dlp

from app.api import search as search_module

FAKE_INFO = {
    "entries": [
        {
            "id": "dQw4w9WgXcQ",
            "title": "Never Gonna Give You Up",
            "channel": "Rick Astley",
            "duration": 213.0,
            "thumbnails": [{"url": "https://example.com/small.jpg"}, {"url": "https://example.com/big.jpg"}],
        },
        {
            "id": "abc123DEF-_",
            "title": None,  # missing title falls back to id
            "uploader": "Some Uploader",
            "duration": None,
            "thumbnails": [],
        },
        None,  # yt-dlp can yield None entries; must be skipped
        {"title": "no id, skipped"},
    ]
}


class FakeYDL:
    def __init__(self, opts):
        self.opts = opts

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def extract_info(self, url, download):
        assert url == "ytsearch8:test query"
        assert download is False
        return FAKE_INFO


def test_search_maps_results(client, monkeypatch):
    monkeypatch.setattr(search_module.yt_dlp, "YoutubeDL", FakeYDL)
    resp = client.get("/api/search", params={"q": "test query"})
    assert resp.status_code == 200
    results = resp.json()["results"]
    assert len(results) == 2

    first = results[0]
    assert first == {
        "video_id": "dQw4w9WgXcQ",
        "title": "Never Gonna Give You Up",
        "channel": "Rick Astley",
        "duration_s": 213,
        "thumbnail_url": "https://example.com/big.jpg",
    }

    second = results[1]
    assert second["title"] == "abc123DEF-_"
    assert second["channel"] == "Some Uploader"
    assert second["duration_s"] is None
    assert second["thumbnail_url"] == "https://i.ytimg.com/vi/abc123DEF-_/hqdefault.jpg"


def test_search_ytdlp_failure_returns_502(client, monkeypatch):
    class FailingYDL(FakeYDL):
        def extract_info(self, url, download):
            raise yt_dlp.utils.DownloadError("Unable to download webpage")

    monkeypatch.setattr(search_module.yt_dlp, "YoutubeDL", FailingYDL)
    resp = client.get("/api/search", params={"q": "test query"})
    assert resp.status_code == 502
    assert "YouTube search failed" in resp.json()["detail"]


def test_search_empty_query_rejected(client):
    assert client.get("/api/search", params={"q": ""}).status_code == 422
    assert client.get("/api/search").status_code == 422
