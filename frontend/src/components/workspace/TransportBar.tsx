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
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
      <button
        onClick={onTogglePlay}
        title={playing ? 'Pause (space)' : 'Play (space)'}
        className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-amp-500 text-stage-950 transition-all duration-300 hover:bg-amp-400 active:scale-95 ${
          playing ? 'shadow-glow-lg' : 'shadow-glow-sm'
        }`}
      >
        {/* play/pause icons crossfade + spin into each other */}
        <svg
          viewBox="0 0 16 16"
          className={`absolute h-6 w-6 fill-current transition-all duration-300 ${
            playing ? 'scale-50 opacity-0 -rotate-90' : 'ml-1 scale-100 opacity-100 rotate-0'
          }`}
        >
          <path d="M4 2.5v11a1 1 0 0 0 1.52.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" />
        </svg>
        <svg
          viewBox="0 0 16 16"
          className={`absolute h-6 w-6 fill-current transition-all duration-300 ${
            playing ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-90'
          }`}
        >
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {playing && (
          <span aria-hidden className="flex h-4 items-end gap-[3px] motion-reduce:hidden">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom rounded-sm bg-amp-400"
                style={{ height: '100%', animation: `eq-bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </span>
        )}
        <p className="font-mono text-lg tabular-nums text-stage-100">
          {fmtTime(position)}
          <span className="mx-1.5 text-stage-500">/</span>
          <span className="text-stage-300">{fmtTime(duration)}</span>
        </p>
      </div>

      <label className="flex items-center gap-3">
        <span className="section-label">Speed</span>
        <input
          type="range"
          min={50}
          max={100}
          step={5}
          value={Math.round(rate * 100)}
          onChange={(e) => onRateChange(Number(e.target.value) / 100)}
          className="fader w-36"
          style={{ '--val': `${((rate * 100 - 50) / 50) * 100}%` } as React.CSSProperties}
        />
        <span className="w-12 font-mono text-sm font-bold text-amp-300">{Math.round(rate * 100)}%</span>
      </label>

      <div className="flex items-center gap-2">
        <span className="section-label">Pitch</span>
        <button
          onClick={() => onPitchChange(pitch - 1)}
          className="btn-quiet h-7 w-7 justify-center p-0 text-sm"
          title="Down a semitone"
        >
          −
        </button>
        <span className="w-9 text-center font-mono text-sm font-bold text-stage-100">
          {pitch > 0 ? `+${pitch}` : pitch}
        </span>
        <button
          onClick={() => onPitchChange(pitch + 1)}
          className="btn-quiet h-7 w-7 justify-center p-0 text-sm"
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
            <span className="chip font-bold tracking-wide">
              LOOP {fmtTime(loop.a)} – {fmtTime(loop.b)}
            </span>
            <button onClick={onClearLoop} className="btn-quiet" title="Clear loop (L)">
              clear
            </button>
          </>
        ) : pendingLoopA != null ? (
          <span className="chip animate-glow-pulse font-bold tracking-wide">
            LOOP A @ {fmtTime(pendingLoopA)} — press L for B
          </span>
        ) : (
          <span className="hidden text-stage-500 sm:inline">
            drag waveform or <kbd className="kbd">L</kbd>×2 to loop
          </span>
        )}
      </div>
    </div>
  )
}
