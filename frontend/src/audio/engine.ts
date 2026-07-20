/**
 * StemPlayer — multi-stem, sample-locked practice playback engine.
 *
 * One shared AudioContext; one signalsmith-stretch AudioWorklet node per stem
 * (time-stretch + pitch-shift), each followed by a per-stem GainNode into a
 * master bus.
 *
 * Sync strategy: every transport change (play/pause/seek/rate/loop) is
 * scheduled on ALL stretch nodes as the same full state change at the same
 * explicit future AudioContext time (`output`). The worklet derives its read
 * position deterministically from that time map against the shared context
 * clock, so the stems cannot drift apart as long as the maps are identical —
 * which passing the full state with explicit `output`/`input` guarantees.
 * The lookahead gives the message port time to deliver before the deadline.
 * A dev drift monitor verifies this against the worklets' reported positions.
 */
import SignalsmithStretch, { type StretchNode } from 'signalsmith-stretch'

import {
  IDLE_SNAPSHOT,
  clampRate,
  clampSemitones,
  didWrap,
  effectiveGain,
  foldIntoLoop,
  positionAt,
  type StemControlState,
  type TransportSnapshot,
} from './transport'

export interface StemSource {
  name: string
  url: string
}

export interface LoadProgress {
  loaded: number
  total: number
  stem: string
}

export interface DriftStats {
  /** Per-stem drift (ms) relative to the ensemble median — inter-stem sync. */
  perStem: Record<string, number>
  /** max - min of per-stem medians, ms. The number that must stay < 10ms. */
  spreadMs: number
  /** Shared constant offset (ms) between worklet reports and the JS mirror
   * (worklet input latency + message delay) — informational only. */
  ensembleOffsetMs: number
  sampleCount: number
}

/** How far ahead transport changes are scheduled so all worklets receive the
 * message before the deadline. */
const LOOKAHEAD_S = 0.1
const DRIFT_WINDOW = 40

interface StemChannel {
  name: string
  node: StretchNode
  gain: GainNode
  control: StemControlState
  driftSamples: number[]
}

export class StemPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private stems = new Map<string, StemChannel>()
  private snap: TransportSnapshot = { ...IDLE_SNAPSHOT }
  private prevSnap: TransportSnapshot = { ...IDLE_SNAPSHOT }
  private semitones = 0
  private durationS = 0
  private tickHandle: number | null = null
  private lastTickPos = 0
  private tickCbs = new Set<(pos: number) => void>()
  private wrapCbs = new Set<() => void>()
  private disposed = false

  // ---- lifecycle ----------------------------------------------------------

  /** Fetch, decode, and hand all stems to their stretch nodes. */
  async load(sources: StemSource[], onProgress?: (p: LoadProgress) => void): Promise<void> {
    if (this.disposed) throw new Error('StemPlayer was disposed')
    if (this.stems.size > 0) throw new Error('load() may only be called once')
    if (sources.length === 0) throw new Error('no stems to load')

    const ctx = new AudioContext({ latencyHint: 'playback' })
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.connect(ctx.destination)

    let loaded = 0
    await Promise.all(
      sources.map(async (src) => {
        const resp = await fetch(src.url)
        if (!resp.ok) throw new Error(`fetching stem ${src.name}: HTTP ${resp.status}`)
        const encoded = await resp.arrayBuffer()
        if (this.disposed) throw new Error('disposed during load')
        const buffer = await ctx.decodeAudioData(encoded)
        if (this.disposed) throw new Error('disposed during load')
        const channels: Float32Array[] = []
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          channels.push(buffer.getChannelData(c))
        }

        const node = await SignalsmithStretch(ctx)
        const endS = await node.addBuffers(channels)
        this.durationS = Math.max(this.durationS, endS)

        const gain = ctx.createGain()
        node.connect(gain)
        gain.connect(this.master!)
        this.stems.set(src.name, {
          name: src.name,
          node,
          gain,
          control: { volume: 1, muted: false, soloed: false },
          driftSamples: [],
        })
        loaded += 1
        onProgress?.({ loaded, total: sources.length, stem: src.name })
      }),
    )
  }

  dispose(): void {
    this.disposed = true
    this.stopTicking()
    for (const stem of this.stems.values()) {
      void stem.node.stop()
      stem.node.disconnect()
      stem.gain.disconnect()
    }
    this.stems.clear()
    this.master?.disconnect()
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close().catch(() => undefined) // already closing is fine
    }
    this.ctx = null
  }

  // ---- transport ----------------------------------------------------------

  async play(): Promise<void> {
    const ctx = this.requireCtx()
    if (ctx.state === 'suspended') await ctx.resume()
    if (this.snap.active) return
    this.scheduleAll({ active: true })
    this.startTicking()
  }

  pause(): void {
    if (!this.snap.active) return
    this.scheduleAll({ active: false })
    this.stopTicking()
    this.emitTick()
  }

  seek(positionS: number): void {
    const pos = Math.min(Math.max(0, positionS), this.durationS)
    this.scheduleAll({ input: pos })
    this.lastTickPos = pos
    this.emitTick()
  }

  setRate(rate: number): void {
    this.scheduleAll({ rate: clampRate(rate) })
  }

  setPitchSemitones(semitones: number): void {
    this.semitones = clampSemitones(semitones)
    this.scheduleAll({})
  }

  /** Set the A-B loop. Jumps to A when the playhead is outside the window —
   * setting a practice loop means "play me this section". */
  setLoop(aS: number, bS: number): void {
    if (!(bS > aS)) throw new Error(`invalid loop: [${aS}, ${bS}]`)
    const pos = this.position
    const patch: Partial<TransportSnapshot> = { loopStart: aS, loopEnd: bS }
    if (pos < aS || pos >= bS) patch.input = aS
    this.scheduleAll(patch)
  }

  clearLoop(): void {
    this.scheduleAll({ loopStart: 0, loopEnd: 0 })
  }

  // ---- mix ----------------------------------------------------------------

  setVolume(name: string, volume: number): void {
    const stem = this.requireStem(name)
    stem.control.volume = Math.min(Math.max(0, volume), 1.5)
    this.applyGains()
  }

  setMute(name: string, muted: boolean): void {
    this.requireStem(name).control.muted = muted
    this.applyGains()
  }

  setSolo(name: string, soloed: boolean): void {
    this.requireStem(name).control.soloed = soloed
    this.applyGains()
  }

  getControl(name: string): StemControlState {
    return { ...this.requireStem(name).control }
  }

  // ---- state --------------------------------------------------------------

  get stemNames(): string[] {
    return [...this.stems.keys()]
  }

  get duration(): number {
    return this.durationS
  }

  get playing(): boolean {
    return this.snap.active
  }

  get rate(): number {
    return this.snap.rate
  }

  get pitchSemitones(): number {
    return this.semitones
  }

  get loop(): { a: number; b: number } | null {
    return this.snap.loopEnd > this.snap.loopStart
      ? { a: this.snap.loopStart, b: this.snap.loopEnd }
      : null
  }

  /** Current song position (seconds) from the JS transport mirror. */
  get position(): number {
    if (!this.ctx) return 0
    const t = this.ctx.currentTime
    // During the lookahead window the new anchor isn't live yet — follow the
    // previous segment so the UI cursor doesn't freeze on rate changes.
    const snap = t < this.snap.output ? this.prevSnap : this.snap
    return Math.min(positionAt(snap, t), this.durationS)
  }

  onTick(cb: (positionS: number) => void): () => void {
    this.tickCbs.add(cb)
    return () => this.tickCbs.delete(cb)
  }

  /** Fires when the playhead wraps from loop end back to loop start. */
  onLoopWrap(cb: () => void): () => void {
    this.wrapCbs.add(cb)
    return () => this.wrapCbs.delete(cb)
  }

  // ---- drift monitor (dev) -------------------------------------------------

  /** Ask every worklet to report positions every `intervalS`; keeps a rolling
   * window of (reported - mirror) samples per stem. */
  async enableDriftMonitor(intervalS = 0.05): Promise<void> {
    const ctx = this.requireCtx()
    await Promise.all(
      [...this.stems.values()].map((stem) =>
        stem.node.setUpdateInterval(intervalS, (inputTime) => {
          if (!this.snap.active) return
          const t = ctx.currentTime
          const snap = t < this.snap.output ? this.prevSnap : this.snap
          const drift = inputTime - positionAt(snap, t)
          stem.driftSamples.push(drift)
          if (stem.driftSamples.length > DRIFT_WINDOW) stem.driftSamples.shift()
        }),
      ),
    )
  }

  getDriftStats(): DriftStats {
    const medians: Record<string, number> = {}
    let count = 0
    for (const stem of this.stems.values()) {
      if (stem.driftSamples.length === 0) continue
      medians[stem.name] = median(stem.driftSamples)
      count += stem.driftSamples.length
    }
    const values = Object.values(medians)
    if (values.length === 0) {
      return { perStem: {}, spreadMs: 0, ensembleOffsetMs: 0, sampleCount: 0 }
    }
    const ensemble = median(values)
    const perStem: Record<string, number> = {}
    for (const [name, m] of Object.entries(medians)) {
      perStem[name] = (m - ensemble) * 1000
    }
    return {
      perStem,
      spreadMs: (Math.max(...values) - Math.min(...values)) * 1000,
      ensembleOffsetMs: ensemble * 1000,
      sampleCount: count,
    }
  }

  resetDriftStats(): void {
    for (const stem of this.stems.values()) stem.driftSamples.length = 0
  }

  // ---- internals -----------------------------------------------------------

  /**
   * Apply a transport change to the mirror and schedule the SAME full state
   * on every stretch node at the same explicit future context time. Passing
   * the complete state (with explicit input) keeps all worklet time maps
   * byte-identical — the core of the sync guarantee.
   */
  private scheduleAll(patch: Partial<TransportSnapshot>): void {
    const ctx = this.requireCtx()
    const t = ctx.currentTime + LOOKAHEAD_S
    const input = patch.input ?? positionAt(this.snap, t)
    this.prevSnap = this.snap
    const next: TransportSnapshot = { ...this.snap, ...patch, input, output: t }
    next.input = foldIntoLoop(next.input, next.loopStart, next.loopEnd)
    this.snap = next
    // Drift samples from the old segment are stale after a transport change.
    for (const stem of this.stems.values()) {
      stem.driftSamples.length = 0
      void stem.node.schedule({
        output: t,
        active: next.active,
        input: next.input,
        rate: next.rate,
        semitones: this.semitones,
        loopStart: next.loopStart,
        loopEnd: next.loopEnd,
      })
    }
  }

  private applyGains(): void {
    const ctx = this.requireCtx()
    const anySoloed = [...this.stems.values()].some((s) => s.control.soloed)
    for (const stem of this.stems.values()) {
      const target = effectiveGain(stem.control, anySoloed)
      // Short ramp avoids clicks without audible lag.
      stem.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.015)
    }
  }

  private startTicking(): void {
    if (this.tickHandle != null) return
    this.lastTickPos = this.position
    const loop = () => {
      this.tickHandle = requestAnimationFrame(loop)
      this.emitTick()
    }
    this.tickHandle = requestAnimationFrame(loop)
  }

  private stopTicking(): void {
    if (this.tickHandle != null) {
      cancelAnimationFrame(this.tickHandle)
      this.tickHandle = null
    }
  }

  private emitTick(): void {
    const pos = this.position
    if (didWrap(this.lastTickPos, pos, this.snap.loopStart, this.snap.loopEnd)) {
      for (const cb of this.wrapCbs) cb()
    }
    this.lastTickPos = pos
    for (const cb of this.tickCbs) cb(pos)
  }

  private requireCtx(): AudioContext {
    if (!this.ctx) throw new Error('StemPlayer not loaded')
    return this.ctx
  }

  private requireStem(name: string): StemChannel {
    const stem = this.stems.get(name)
    if (!stem) throw new Error(`unknown stem: ${name}`)
    return stem
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
