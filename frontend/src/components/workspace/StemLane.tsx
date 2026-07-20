import { useEffect, useRef } from 'react'

import type { StemMixState } from '../../hooks/useStemPlayer'

export interface StemVisual {
  label: string
  dot: string
  wave: string
}

export const STEM_VISUALS: Record<string, StemVisual> = {
  vocals: { label: 'Vocals', dot: 'bg-rose-400', wave: '#fb7185' },
  drums: { label: 'Drums', dot: 'bg-orange-400', wave: '#fb923c' },
  bass: { label: 'Bass', dot: 'bg-violet-400', wave: '#a78bfa' },
  guitar: { label: 'Guitar', dot: 'bg-amp-400', wave: '#ffb946' },
  piano: { label: 'Piano', dot: 'bg-sky-400', wave: '#38bdf8' },
  other: { label: 'Other', dot: 'bg-emerald-400', wave: '#34d399' },
}

interface Props {
  name: string
  mix: StemMixState
  /** Interleaved min/max peaks for this stem, or null while loading. */
  peaks: number[] | null
  /** True when another stem is soloed and this one isn't (rendered dimmed). */
  sidelined: boolean
  onVolume: (v: number) => void
  onToggleMute: () => void
  onToggleSolo: () => void
  /** Extra control rendered at the lane's right edge (e.g. transcribe). */
  action?: React.ReactNode
}

export function StemLane({ name, mix, peaks, sidelined, onVolume, onToggleMute, onToggleSolo, action }: Props) {
  const visual = STEM_VISUALS[name] ?? { label: name, dot: 'bg-stage-500', wave: '#a89e88' }
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const silenced = mix.muted || sidelined

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !peaks) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    const g = canvas.getContext('2d')
    if (!g) return
    g.scale(dpr, dpr)
    g.clearRect(0, 0, w, h)
    g.fillStyle = visual.wave
    g.globalAlpha = silenced ? 0.22 : 0.85
    const buckets = peaks.length / 2
    const mid = h / 2
    for (let x = 0; x < w; x++) {
      const i = Math.floor((x / w) * buckets)
      const lo = peaks[i * 2] ?? 0
      const hi = peaks[i * 2 + 1] ?? 0
      const top = mid - hi * mid * 0.92
      const bottom = mid - lo * mid * 0.92
      g.fillRect(x, top, 1, Math.max(1, bottom - top))
    }
  }, [peaks, visual.wave, silenced])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-opacity hover:bg-stage-850/60 ${
        silenced ? 'opacity-50' : ''
      }`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${visual.dot}`} />
      <span className="w-16 shrink-0 font-mono text-xs font-semibold uppercase tracking-wider text-stage-100">
        {visual.label}
      </span>

      <button
        onClick={onToggleMute}
        title={`${mix.muted ? 'Unmute' : 'Mute'} ${visual.label}`}
        aria-pressed={mix.muted}
        className={`h-7 w-7 shrink-0 rounded-md font-mono text-xs font-bold transition ${
          mix.muted
            ? 'animate-pop bg-rose-500/90 text-stage-950 shadow-md shadow-rose-500/30'
            : 'bg-stage-700/70 text-stage-300 hover:bg-stage-700 hover:text-stage-100'
        }`}
      >
        M
      </button>
      <button
        onClick={onToggleSolo}
        title={`${mix.soloed ? 'Unsolo' : 'Solo'} ${visual.label}`}
        aria-pressed={mix.soloed}
        className={`h-7 w-7 shrink-0 rounded-md font-mono text-xs font-bold transition ${
          mix.soloed
            ? 'animate-pop bg-amp-400 text-stage-950 shadow-glow-sm'
            : 'bg-stage-700/70 text-stage-300 hover:bg-stage-700 hover:text-stage-100'
        }`}
      >
        S
      </button>

      <input
        type="range"
        min={0}
        max={1.2}
        step={0.01}
        value={mix.volume}
        onChange={(e) => onVolume(Number(e.target.value))}
        title={`${visual.label} volume`}
        className="fader w-28 shrink-0"
        style={{ '--val': `${(mix.volume / 1.2) * 100}%` } as React.CSSProperties}
      />

      <canvas ref={canvasRef} className="h-9 min-w-0 flex-1" />
      {action}
    </div>
  )
}
