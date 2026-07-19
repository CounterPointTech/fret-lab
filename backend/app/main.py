import logging

from fastapi import FastAPI

logger = logging.getLogger("fretlab")

app = FastAPI(title="Fret Lab")


@app.get("/api/health")
def health() -> dict:
    gpu: str | None = None
    try:
        import torch  # local import: torch takes seconds to load, keep app startup fast

        if torch.cuda.is_available():
            gpu = torch.cuda.get_device_name(0)
    except Exception:
        logger.exception("GPU probe failed; reporting health without GPU info")
    return {"status": "ok", "gpu": gpu}
