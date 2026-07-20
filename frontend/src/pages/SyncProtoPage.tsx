/**
 * Throwaway sync prototype (Phase 3 risk gate): proves N stems through
 * independent signalsmith-stretch worklets stay sample-locked at 0.7x
 * through long playback, seeks, A-B loop wraps, and live speed changes.
 * Not linked from the app UI — visit /proto/sync?v=<videoId> directly.
 */
import { useEffect, useRef, useState } from 'react'

import { StemPlayer, type DriftStats } from '../audio/engine'
import { getSong } from '../lib/api'

interface PhaseResult {
  name: string
  maxSpreadMs: number
  ensembleOffsetMs: number
  samples: number
}

declare global {
  interface Window {
    __syncProto?: {
      player: StemPlayer
      runScenario: () => Promise<PhaseResult[]>
      results: PhaseResult[] | null
      wrapCount: number
      state: string
    }
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function SyncProtoPage() {
  const playerRef = useRef<StemPlayer | null>(null)
  const [state, setState] = useState('idle')
  const [log, setLog] = useState<string[]>([])
  const [stats, setStats] = useState<DriftStats | null>(null)
  const [position, setPosition] = useState(0)
  const [wrapCount, setWrapCount] = useState(0)
  const [results, setResults] = useState<PhaseResult[] | null>(null)

  const append = (line: string) => setLog((l) => [...l, line])

  useEffect(() => {
    const iv = setInterval(() => {
      const p = playerRef.current
      if (p) {
        setStats(p.getDriftStats())
        setPosition(p.position)
      }
    }, 250)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => () => playerRef.current?.dispose(), [])

  async function loadStems(): Promise<StemPlayer> {
    if (playerRef.current) return playerRef.current
    setState('loading')
    const videoId = new URLSearchParams(location.search).get('v') ?? '3pVQj2v7tBI'
    const { stems } = await getSong(videoId)
    if (stems.length === 0) throw new Error(`song ${videoId} has no stems`)
    const player = new StemPlayer()
    await player.load(
      stems.map((s) => ({ name: s.name, url: s.audio_url })),
      (p) => append(`decoded ${p.stem} (${p.loaded}/${p.total})`),
    )
    await player.enableDriftMonitor(0.05)
    player.onLoopWrap(() => setWrapCount((c) => c + 1))
    playerRef.current = player
    window.__syncProto = {
      player,
      runScenario,
      results: null,
      wrapCount: 0,
      state: 'loaded',
    }
    player.onLoopWrap(() => {
      if (window.__syncProto) window.__syncProto.wrapCount += 1
    })
    setState('loaded')
    append(`loaded ${stems.length} stems, duration ${player.duration.toFixed(1)}s`)
    return player
  }

  /** Watch drift for `seconds`, recording the max inter-stem spread seen. */
  async function watch(player: StemPlayer, name: string, seconds: number): Promise<PhaseResult> {
    player.resetDriftStats()
    let maxSpread = 0
    let last: DriftStats = player.getDriftStats()
    const start = performance.now()
    const end = start + seconds * 1000
    let beats = 0
    while (performance.now() < end) {
      await delay(250)
      last = player.getDriftStats()
      // wait until each stem has a few samples before trusting the medians
      if (last.sampleCount >= 20) maxSpread = Math.max(maxSpread, last.spreadMs)
      if (++beats % 40 === 0) {
        append(
          `… ${name} t=${((performance.now() - start) / 1000).toFixed(0)}s ` +
            `pos=${player.position.toFixed(1)} spread=${last.spreadMs.toFixed(3)}ms`,
        )
      }
    }
    const result: PhaseResult = {
      name,
      maxSpreadMs: maxSpread,
      ensembleOffsetMs: last.ensembleOffsetMs,
      samples: last.sampleCount,
    }
    append(
      `${name}: max inter-stem spread ${maxSpread.toFixed(3)}ms ` +
        `(mirror offset ${last.ensembleOffsetMs.toFixed(1)}ms, n=${last.sampleCount})`,
    )
    return result
  }

  async function runScenario(): Promise<PhaseResult[]> {
    const player = await loadStems()
    const phases: PhaseResult[] = []
    setState('running scenario')
    if (window.__syncProto) window.__syncProto.state = 'running'
    // ?fast=1 shrinks phases for quick pipeline debugging
    const fast = new URLSearchParams(location.search).has('fast')
    const secs = fast ? { a: 12, b: 4, c: 12, d: 5 } : { a: 60, b: 8, c: 26, d: 10 }
    const loopLen = fast ? 3 : 8

    player.setRate(0.7)
    await player.play()
    append('play() resolved — starting phase (a)')
    phases.push(await watch(player, `(a) ${secs.a}s playback @0.7x`, secs.a))

    player.seek(120)
    phases.push(await watch(player, '(b) after seek to 120s', secs.b))

    player.seek(60)
    player.setLoop(60, 60 + loopLen)
    phases.push(await watch(player, `(c) A-B loop 60-${60 + loopLen}s (wraps)`, secs.c))

    player.setRate(0.9)
    phases.push(await watch(player, '(d) after live speed change to 0.9x', secs.d))

    player.pause()
    setResults(phases)
    setState('done')
    if (window.__syncProto) {
      window.__syncProto.results = phases
      window.__syncProto.state = 'done'
    }
    const verdict = phases.every((p) => p.maxSpreadMs < 10) ? 'PASS' : 'FAIL'
    append(`SCENARIO ${verdict}: all phases ${verdict === 'PASS' ? '<' : 'not <'} 10ms`)
    return phases
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 font-mono text-sm text-stage-100">
      <h1 className="text-xl font-bold text-amp-300">Sync prototype — Phase 3 risk gate</h1>
      <p className="mt-1 text-stage-300">
        state: {state} · pos {position.toFixed(2)}s · loop wraps: {wrapCount}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded bg-amp-500 px-3 py-1.5 font-bold text-stage-950" onClick={() => void runScenario()}>
          Run full scenario (~105s)
        </button>
        <button className="rounded bg-stage-700 px-3 py-1.5" onClick={() => void loadStems().then((p) => { p.setRate(0.7); void p.play() })}>
          Play @0.7x
        </button>
        <button className="rounded bg-stage-700 px-3 py-1.5" onClick={() => playerRef.current?.pause()}>
          Pause
        </button>
        <button className="rounded bg-stage-700 px-3 py-1.5" onClick={() => playerRef.current?.seek(playerRef.current.position + 30)}>
          Seek +30s
        </button>
        <button className="rounded bg-stage-700 px-3 py-1.5" onClick={() => { const p = playerRef.current; if (p) p.setLoop(p.position, p.position + 8) }}>
          Loop next 8s
        </button>
        <button className="rounded bg-stage-700 px-3 py-1.5" onClick={() => playerRef.current?.clearLoop()}>
          Clear loop
        </button>
      </div>

      {stats && stats.sampleCount > 0 && (
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-stage-700 text-stage-400">
              <th className="py-1 pr-4">stem</th>
              <th className="py-1">drift vs ensemble (ms)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.perStem).map(([name, d]) => (
              <tr key={name} className="border-b border-stage-800">
                <td className="py-1 pr-4">{name}</td>
                <td className={`py-1 ${Math.abs(d) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {d.toFixed(3)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="py-1 pr-4 font-bold">spread</td>
              <td className={`py-1 font-bold ${stats.spreadMs > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats.spreadMs.toFixed(3)} ms (mirror offset {stats.ensembleOffsetMs.toFixed(1)} ms)
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {results && (
        <pre className="mt-6 whitespace-pre-wrap rounded bg-stage-900 p-4 text-xs" data-testid="results">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}

      <div className="mt-6 space-y-1 text-xs text-stage-400">
        {log.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  )
}
