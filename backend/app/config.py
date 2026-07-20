"""Paths and settings.

`settings` is a mutable singleton so tests can point db/media at temp
locations (monkeypatch the attributes, then `reset_engine()`).
"""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent


class Settings:
    def __init__(self) -> None:
        self.db_path = Path(os.environ.get("FRETLAB_DB", BACKEND_DIR / "fretlab.db"))
        self.media_root = Path(os.environ.get("FRETLAB_MEDIA", REPO_ROOT / "media"))
        # AI model cache — audio-separator defaults to /tmp on Windows, so
        # always pass this explicitly.
        self.models_dir = Path(os.environ.get("FRETLAB_MODELS", REPO_ROOT / "models"))


settings = Settings()
