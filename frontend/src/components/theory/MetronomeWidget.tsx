import { useEffect, useRef, useState } from 'react'

import {
  ACCENT_PATTERNS,
  MAX_BPM,
  MIN_BPM,
  Metronome,
  bpmFromTaps,
  clampBpm,
} from '../../theory/metronome'

/**
 * Standalone metronome (Theory Lab) that also runs over song loops (Song
 * Workspace). Timing comes from the Web Audio lookahead scheduler in
 * src/theory/metronome.ts — never from UI timers.
 */
export function MetronomeWidget() {
  const metRef = useRef<Metronome | null>(null)
  const tapsRef = useRef<number[]>([])
  const [running, setRunning] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [patternIdx, setPatternIdx] = useState(0)
  const [beat, setBeat] = useState<number | null>(null)

  useEffect(() => {
    const met = new Metronome()
    met.onBeat = (b) => setBeat(b)
    metRef.current = met
    return () => {
      met.dispose()
      metRef.current = null
    }
  }, [])

  useEffect(() => {
    const met = metRef.current
    if (!met) return
    met.bpm = bpm
    met.pattern = ACCENT_PATTERNS[patternIdx]
  }, [bpm, patternIdx])

  const pattern = ACCENT_PATTERNS[patternIdx]

  function toggle() {
    const met = metRef.current
    if (!met) return
    if (met.running) {
      met.stop()
      setRunning(false)
      setBeat(null)
    } else {
      met.start()
      setRunning(true)
    }
  }

  function tap() {
    const now = performance.now()
    // a long pause starts a fresh tap sequence
    if (tapsRef.current.length > 0 && now - tapsRef.current[tapsRef.current.length - 1] > 3000) {
      tapsRef.current = []
    }
    tapsRef.current.push(now)
    const tapped = bpmFromTaps(tapsRef.current)
    if (tapped != null) setBpm(tapped)
  }

  return (
    <div className="rounded-xl border border-stage-700/60 bg-stage-900/80 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-stage-500">
          Metronome
        </span>
        <button
          onClick={toggle}
          className={`rounded-lg px-4 py-1.5 font-bold transition ${
            running
              ? 'bg-amp-500 text-stage-950 shadow-lg shadow-amp-500/20'
              : 'border border-stage-700 text-stage-300 hover:border-amp-500/60 hover:text-amp-300'
          }`}
        >
          {running ? '■ Stop' : '▶ Start'}
        </button>

        <label className="flex items-center gap-2 font-mono text-sm text-stage-300">
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) => setBpm(clampBpm(Number(e.target.value)))}
            className="w-36 accent-amp-500"
          />
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) => setBpm(clampBpm(Number(e.target.value)))}
            className="w-16 rounded-lg border border-stage-700 bg-stage-950 px-2 py-1 text-center text-amp-300"
          />
          BPM
        </label>

        <select
          value={patternIdx}
          onChange={(e) => setPatternIdx(Number(e.target.value))}
          className="rounded-lg border border-stage-700 bg-stage-950 px-2 py-1.5 font-mono text-sm text-stage-300"
        >
          {ACCENT_PATTERNS.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          onClick={tap}
          className="rounded-lg border border-stage-700 px-3 py-1.5 font-mono text-sm text-stage-300 transition hover:border-amp-500/60 hover:text-amp-300"
        >
          Tap tempo
        </button>

        <div className="flex items-center gap-1.5" aria-hidden>
          {Array.from({ length: pattern.beatsPerBar }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition ${
                beat === i
                  ? i === 0
                    ? 'scale-125 bg-amp-400'
                    : 'scale-110 bg-amp-300/80'
                  : 'bg-stage-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
