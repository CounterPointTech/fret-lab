"""Phase 0 validation: prove the two riskiest externals work on this machine.

1. yt-dlp searches YouTube and downloads a song's audio to WAV.
2. audio-separator runs htdemucs_6s on the GPU and produces 6 stems.

Usage (from backend/):  .venv\\Scripts\\python.exe scripts\\validate_pipeline.py ["search query"]
Output lands in media/_validation/ (gitignored, safe to delete).
"""

import sys
import time
from pathlib import Path

MEDIA = Path(__file__).resolve().parents[2] / "media" / "_validation"


def download(query: str) -> Path:
    import yt_dlp

    MEDIA.mkdir(parents=True, exist_ok=True)
    opts = {
        "format": "bestaudio/best",
        "outtmpl": str(MEDIA / "source.%(ext)s"),
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "wav"},
        ],
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }
    t0 = time.perf_counter()
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"ytsearch1:{query}", download=True)
    entry = info["entries"][0]
    print(f"downloaded: {entry['title']!r} (id={entry['id']}, {entry.get('duration')}s) "
          f"in {time.perf_counter() - t0:.1f}s")
    wav = MEDIA / "source.wav"
    if not wav.exists():
        raise FileNotFoundError(f"expected {wav} after download/extract")
    return wav


def separate(wav: Path) -> list[str]:
    import torch
    from audio_separator.separator import Separator

    print(f"cuda_available: {torch.cuda.is_available()} "
          f"({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'cpu'})")

    sep = Separator(output_dir=str(MEDIA / "stems"))
    t0 = time.perf_counter()
    sep.load_model(model_filename="htdemucs_6s.yaml")
    print(f"model loaded in {time.perf_counter() - t0:.1f}s")

    t0 = time.perf_counter()
    outputs = sep.separate(str(wav))
    print(f"separated in {time.perf_counter() - t0:.1f}s")
    return outputs


def main() -> None:
    query = sys.argv[1] if len(sys.argv) > 1 else "Deep Purple Smoke on the Water official audio"
    wav = download(query)
    outputs = separate(wav)
    print(f"stems ({len(outputs)}):")
    for name in outputs:
        path = MEDIA / "stems" / name
        print(f"  {name}  ({path.stat().st_size / 1e6:.1f} MB)" if path.exists() else f"  {name}")
    print("VALIDATION OK")


if __name__ == "__main__":
    main()
