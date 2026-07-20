interface Props {
  playing: boolean
  position: number
  duration: number
  rate: number
  pitch: number
  loop: { a: number; b: number } | null
  pendingLoopA: number | null
  onTogglePlay: () => void
  onRateChange: (rate: number) => void
  onPitchChange: (semitones: number) => void
  onClearLoop: () => void
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s - m * 60
  return `${m}:${sec.toFixed(1).padStart(4, '0')}`
}

export function TransportBar({
  playing,
  position,
  duration,
  rate,
  pitch,
  loop,
  pendingLoopA,
  onTogglePlay,
  onRateChange,
  onPitchChange,
  onClearLoop,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-stage-700/60 bg-stage-900/80 px-5 py-4 shadow-lg shadow-black/30">
      <button
        onClick={onTogglePlay}
        title={playing ? 'Pause (space)' : 'Play (space)'}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amp-500 text-stage-950 shadow-lg shadow-amp-500/30 transition hover:bg-amp-400 active:scale-95"
      >
        {playing ? (
          <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="ml-0.5 h-5 w-5 fill-current">
            <path d="M4 2.5v11a1 1 0 0 0 1.52.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" />
          </svg>
        )}
      </button>

      <p className="font-mono text-lg tabular-nums text-stage-100">
        {fmtTime(position)}
        <span className="mx-1.5 text-stage-500">/</span>
        <span className="text-stage-300">{fmtTime(duration)}</span>
      </p>

      <label className="flex items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-stage-500">Speed</span>
        <input
          type="range"
          min={50}
          max={100}
          step={5}
          value={Math.round(rate * 100)}
          onChange={(e) => onRateChange(Number(e.target.value) / 100)}
          className="w-36 accent-amp-500"
        />
        <span className="w-12 font-mono text-sm font-bold text-amp-300">{Math.round(rate * 100)}%</span>
      </label>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-stage-500">Pitch</span>
        <button
          onClick={() => onPitchChange(pitch - 1)}
          className="h-7 w-7 rounded-md bg-stage-700/70 font-mono text-sm text-stage-300 transition hover:bg-stage-700 hover:text-stage-100"
          title="Down a semitone"
        >
          −
        </button>
        <span className="w-9 text-center font-mono text-sm font-bold text-stage-100">
          {pitch > 0 ? `+${pitch}` : pitch}
        </span>
        <button
          onClick={() => onPitchChange(pitch + 1)}
          className="h-7 w-7 rounded-md bg-stage-700/70 font-mono text-sm text-stage-300 transition hover:bg-stage-700 hover:text-stage-100"
          title="Up a semitone"
        >
          +
        </button>
        {pitch !== 0 && (
          <button
            onClick={() => onPitchChange(0)}
            className="font-mono text-[11px] uppercase tracking-wider text-stage-500 transition hover:text-amp-300"
          >
            reset
          </button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 font-mono text-xs">
        {loop ? (
          <>
            <span className="rounded-md bg-amp-500/15 px-2.5 py-1 font-bold tracking-wide text-amp-300">
              LOOP {fmtTime(loop.a)} – {fmtTime(loop.b)}
            </span>
            <button
              onClick={onClearLoop}
              className="rounded-md bg-stage-700/70 px-2.5 py-1 text-stage-300 transition hover:bg-stage-700 hover:text-stage-100"
              title="Clear loop (L)"
            >
              clear
            </button>
          </>
        ) : pendingLoopA != null ? (
          <span className="animate-glow-pulse rounded-md bg-amp-500/15 px-2.5 py-1 font-bold tracking-wide text-amp-300">
            LOOP A @ {fmtTime(pendingLoopA)} — press L for B
          </span>
        ) : (
          <span className="text-stage-500">drag on waveform or press L twice to loop</span>
        )}
      </div>
    </div>
  )
}
