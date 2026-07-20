import { useEffect, useRef, useState } from 'react'

import type { StemPlayer } from '../../audio/engine'
import { trainerPctForPass, trainerTotalPasses, type TrainerConfig } from '../../audio/transport'

interface Props {
  player: StemPlayer
  loop: { a: number; b: number } | null
  onRateApplied: (rate: number) => void
}

interface PassLogEntry {
  pass: number
  pct: number
}

/**
 * Speed trainer: with an A-B loop set, ramps playback speed from startPct to
 * targetPct in stepPct increments — one step per completed loop pass.
 */
export function SpeedTrainer({ player, loop, onRateApplied }: Props) {
  const [cfg, setCfg] = useState<TrainerConfig>({ startPct: 60, targetPct: 100, stepPct: 10 })
  const [running, setRunning] = useState(false)
  const [pass, setPass] = useState(0)
  const [log, setLog] = useState<PassLogEntry[]>([])
  const stateRef = useRef({ cfg, running, pass })
  stateRef.current = { cfg, running, pass }

  useEffect(() => {
    return player.onLoopWrap(() => {
      const { cfg, running, pass } = stateRef.current
      if (!running) return
      const nextPass = pass + 1
      const pct = trainerPctForPass(cfg, nextPass)
      setPass(nextPass)
      setLog((l) => [...l, { pass: nextPass, pct }])
      onRateApplied(pct / 100)
      console.info(`[trainer] pass ${nextPass} → ${pct}%`)
    })
  }, [player, onRateApplied])

  // Losing the loop stops the trainer — there is nothing to wrap anymore.
  useEffect(() => {
    if (!loop && running) setRunning(false)
  }, [loop, running])

  function start() {
    if (!loop) return
    const pct = trainerPctForPass(cfg, 0)
    setPass(0)
    setLog([{ pass: 0, pct }])
    setRunning(true)
    onRateApplied(pct / 100)
    player.seek(loop.a)
    void player.play()
    console.info(`[trainer] start at ${pct}% (target ${cfg.targetPct}%, step ${cfg.stepPct}%)`)
  }

  const totalPasses = trainerTotalPasses(cfg)
  const currentPct = running ? trainerPctForPass(cfg, pass) : null
  const atTarget = currentPct != null && currentPct >= cfg.targetPct

  const numInput = (label: string, key: keyof TrainerConfig, min: number, max: number) => (
    <label className="flex items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-widest text-stage-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={5}
        value={cfg[key]}
        disabled={running}
        onChange={(e) => setCfg((c) => ({ ...c, [key]: Number(e.target.value) }))}
        className="w-16 rounded-md border border-stage-700 bg-stage-950/60 px-2 py-1 font-mono text-sm text-stage-100 disabled:opacity-50"
      />
    </label>
  )

  return (
    <div className="rounded-xl border border-stage-700/60 bg-stage-900/80 px-5 py-4 shadow-lg shadow-black/30">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-amp-300">
          Speed trainer
        </h3>
        {numInput('start %', 'startPct', 50, 100)}
        {numInput('target %', 'targetPct', 50, 100)}
        {numInput('step %', 'stepPct', 5, 50)}

        {running ? (
          <button
            onClick={() => setRunning(false)}
            className="rounded-lg bg-stage-700 px-4 py-1.5 font-bold text-stage-100 transition hover:bg-stage-500"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={start}
            disabled={!loop}
            title={loop ? 'Start ramping' : 'Set an A-B loop first'}
            className="rounded-lg bg-amp-500 px-4 py-1.5 font-bold text-stage-950 shadow-md shadow-amp-500/25 transition hover:bg-amp-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start
          </button>
        )}

        {!loop && !running && (
          <span className="font-mono text-xs text-stage-500">set an A-B loop to enable</span>
        )}
      </div>

      {running && currentPct != null && (
        <div className="mt-3">
          <div className="flex items-center justify-between font-mono text-xs text-stage-300">
            <span>
              pass {pass + 1} · playing at{' '}
              <span className="font-bold text-amp-300">{currentPct}%</span>
              {atTarget && <span className="ml-2 text-emerald-400">at target — hold</span>}
            </span>
            <span>
              {Math.min(pass + 1, totalPasses)}/{totalPasses} passes to target
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stage-700">
            <div
              className="h-full rounded-full bg-amp-400 transition-[width] duration-300"
              style={{ width: `${(Math.min(pass + 1, totalPasses) / totalPasses) * 100}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-stage-500" data-testid="trainer-log">
            {log.map((e) => `${e.pct}%`).join(' → ')}
          </p>
        </div>
      )}
    </div>
  )
}
