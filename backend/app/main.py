import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import jobs as jobs_api
from app.api import media as media_api
from app.api import practice as practice_api
from app.api import search as search_api
from app.api import songs as songs_api
from app.api import transcriptions as transcriptions_api
from app.db.session import init_db
from app.errors import FretLabError
from app.jobs.queue import JobQueue
from app.pipeline.chords import analyze_song
from app.pipeline.separate import separate_song
from app.pipeline.transcribe import transcribe_song
from app.pipeline.ytdlp_download import download_song

# uvicorn only configures its own loggers — give the app's fretlab.* loggers
# a handler so pipeline INFO lines (timings, cache hits) reach the console.
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

logger = logging.getLogger("fretlab")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    queue = JobQueue()
    queue.register("download", download_song)
    queue.register("separate", separate_song)
    queue.register("transcribe", transcribe_song)
    queue.register("analyze", analyze_song)
    queue.start()
    app.state.job_queue = queue
    logger.info("Job queue started")
    try:
        yield
    finally:
        await queue.stop()
        logger.info("Job queue stopped")


app = FastAPI(title="Fret Lab", lifespan=lifespan)
app.include_router(search_api.router)
app.include_router(songs_api.router)
app.include_router(jobs_api.router)
app.include_router(media_api.router)
app.include_router(transcriptions_api.router)
app.include_router(practice_api.router)


# Both handlers keep the {"detail": ...} shape the frontend's api.ts parses;
# "code" is extra machine-readable context. HTTPException behavior is untouched.
@app.exception_handler(FretLabError)
async def fretlab_error_handler(request: Request, exc: FretLabError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content={"detail": exc.message, "code": exc.code},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Never silent: full traceback to the fretlab logger before responding.
    logger.error(
        "Unhandled error on %s %s", request.method, request.url.path, exc_info=exc
    )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "code": "internal"},
    )


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
