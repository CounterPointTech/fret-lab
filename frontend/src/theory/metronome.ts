/**
 * Metronome on a Web Audio lookahead scheduler (same pattern as the stem
 * engine's transport): a coarse setInterval only *wakes* the scheduler;
 * every click is an OscillatorNode started at a sample-accurate
 * AudioContext time — beat timing never rides on timer callbacks.
 */

export interface AccentPattern {
  label: string
  beatsPerBar: number
  /** gain multiplier per beat in the bar; index 0 is the downbeat */
  accents: number[]
}

export const ACCENT_PATTERNS: AccentPattern[] = [
  { label: '4/4', beatsPerBar: 4, accents: [1, 0.5, 0.65, 0.5] },
  { label: '3/4', beatsPerBar: 3, accents: [1, 0.5, 0.5] },
  { label: '6/8', beatsPerBar: 6, accents: [1, 0.4, 0.4, 0.75, 0.4, 0.4] },
  { label: '2/4', beatsPerBar: 2, accents: [1, 0.5] },
  { label: 'none', beatsPerBar: 1, accents: [0.7] },
]

export const MIN_BPM = 30
export const MAX_BPM = 260

export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return 120
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)))
}

/**
 * Tap tempo: median inter-tap interval of the recent taps (median resists
 * one sloppy tap). Needs >= 2 taps within a plausible spacing.
 */
export function bpmFromTaps(tapTimesMs: number[]): number | null {
  const taps = tapTimesMs.slice(-6)
  if (taps.length < 2) return null
  const gaps: number[] = []
  for (let i = 1; i < taps.length; i++) {
    const gap = taps[i] - taps[i - 1]
    if (gap > 0 && gap < 3000) gaps.push(gap)
  }
  if (gaps.length === 0) return null
  gaps.sort((a, b) => a - b)
  const mid = gaps.length >> 1
  const median = gaps.length % 2 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2
  return clampBpm(60000 / median)
}

const LOOKAHEAD_MS = 25 // scheduler wake interval (not beat timing!)
const SCHEDULE_AHEAD_S = 0.12 // how far ahead clicks are committed to the clock

export class Metronome {
  bpm = 120
  pattern: AccentPattern = ACCENT_PATTERNS[0]
  volume = 0.8

  private ctx: AudioContext | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextBeatTime = 0
  private beatIndex = 0
  /** UI callback; fires from a scheduled AudioContext-time lookup, display only */
  onBeat: ((beatInBar: number) => void) | null = null

  get running(): boolean {
    return this.timer != null
  }

  start(): void {
    if (this.timer != null) return
    this.ctx ??= new AudioContext()
    void this.ctx.resume()
    this.beatIndex = 0
    this.nextBeatTime = this.ctx.currentTime + 0.08
    this.timer = setInterval(() => this.scheduleWindow(), LOOKAHEAD_MS)
    this.scheduleWindow()
  }

  stop(): void {
    if (this.timer != null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  dispose(): void {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }

  /** Commit every beat that falls inside the lookahead window. */
  private scheduleWindow(): void {
    const ctx = this.ctx
    if (!ctx) return
    while (this.nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beatInBar = this.beatIndex % this.pattern.beatsPerBar
      this.scheduleClick(ctx, this.nextBeatTime, beatInBar)
      this.nextBeatTime += 60 / this.bpm
      this.beatIndex += 1
    }
  }

  private scheduleClick(ctx: AudioContext, time: number, beatInBar: number): void {
    const accent = this.pattern.accents[beatInBar] ?? 0.5
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    // woodblock-ish tick: high sine with a fast exponential decay,
    // downbeat a fifth higher and louder
    osc.frequency.value = beatInBar === 0 ? 1568 : 1046
    gain.gain.setValueAtTime(this.volume * accent, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
    osc.connect(gain).connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.06)
    if (this.onBeat) {
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000)
      setTimeout(() => this.onBeat?.(beatInBar), delayMs)
    }
  }
}
