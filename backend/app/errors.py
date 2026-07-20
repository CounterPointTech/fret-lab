"""Typed application errors surfaced at the API boundary.

Raise these from route handlers (or code they call) instead of building
HTTPException by hand; the handlers registered in app.main turn them into
``{"detail": <message>, "code": <code>}`` JSON with the right status.
The ``detail`` key matches what the frontend's api.ts already parses;
``code`` is extra machine-readable context.

HTTPException still works everywhere — this hierarchy is additive.
"""

from __future__ import annotations


class FretLabError(Exception):
    """Base class for typed, user-facing application errors."""

    code: str = "fretlab_error"
    http_status: int = 500

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(FretLabError):
    """A requested resource (song, transcription, ...) does not exist."""

    code = "not_found"
    http_status = 404


class ValidationError(FretLabError):
    """A request was well-formed JSON but semantically invalid."""

    code = "validation"
    http_status = 422
