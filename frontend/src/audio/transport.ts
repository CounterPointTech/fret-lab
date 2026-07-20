/**
 * Pure transport math for the stem player. No Web Audio dependencies so it
 * can be unit-tested directly.
 *
 * The model mirrors signalsmith-stretch's internal time map: playback is a
 * linear mapping from AudioContext ("output") time to song ("input") time,
 * anchored at the most recent transport change, with an optional loop window
 * that folds the input position back by whole loop lengths.
 */

export interface TransportSnapshot {
  /** True while playing (input position advances). */
  active: boolean
  /** Song position (seconds) at the anchor. */
  input: number
  /** AudioContext time (seconds) of the anchor. */
  output: number
  /** Playback rate, e.g. 0.7 = 70% speed. */
  rate: number
  /** Loop window; loopStart === loopEnd means looping is disabled. */
  loopStart: number
  loopEnd: number
}

export const IDLE_SNAPSHOT: TransportSnapshot = {
  active: false,
  input: 0,
  output: 0,
  rate: 1,
  loopStart: 0,
  loopEnd: 0,
}

/** Fold a raw input position into the loop window (no-op when not looping). */
export function foldIntoLoop(pos: number, loopStart: number, loopEnd: number): number {
  const len = loopEnd - loopStart
  if (len <= 0 || pos < loopEnd) return pos
  return loopStart + ((pos - loopStart) % len)
}

/** Song position at a given AudioContext time, honoring pause and loop fold. */
export function positionAt(snap: TransportSnapshot, contextTime: number): number {
  const elapsed = Math.max(0, contextTime - snap.output)
  const raw = snap.input + elapsed * (snap.active ? snap.rate : 0)
  return foldIntoLoop(raw, snap.loopStart, snap.loopEnd)
}

/**
 * Detect a loop wrap between two successive position samples. A backwards
 * jump of more than half the loop length is a wrap (small backwards jitter
 * from scheduling isn't).
 */
export function didWrap(
  prevPos: number,
  currPos: number,
  loopStart: number,
  loopEnd: number,
): boolean {
  const len = loopEnd - loopStart
  if (len <= 0) return false
  return currPos < prevPos && prevPos - currPos > len / 2
}

export interface StemControlState {
  volume: number
  muted: boolean
  soloed: boolean
}

/**
 * Effective gain for one stem given the whole mix's solo state: any active
 * solo silences all non-soloed stems; mute always wins.
 */
export function effectiveGain(stem: StemControlState, anySoloed: boolean): number {
  if (stem.muted) return 0
  if (anySoloed && !stem.soloed) return 0
  return stem.volume
}

export interface TrainerConfig {
  /** Starting speed in percent, e.g. 60. */
  startPct: number
  /** Target speed in percent, e.g. 100. */
  targetPct: number
  /** Increment per completed loop pass, e.g. 10. */
  stepPct: number
}

/** Speed (percent) for a given 0-based loop pass, clamped at the target. */
export function trainerPctForPass(cfg: TrainerConfig, pass: number): number {
  if (cfg.stepPct <= 0) return cfg.targetPct
  return Math.min(cfg.startPct + cfg.stepPct * pass, cfg.targetPct)
}

/** Total passes needed to reach (and play once at) the target speed. */
export function trainerTotalPasses(cfg: TrainerConfig): number {
  if (cfg.stepPct <= 0 || cfg.targetPct <= cfg.startPct) return 1
  return Math.ceil((cfg.targetPct - cfg.startPct) / cfg.stepPct) + 1
}

export function clampRate(rate: number): number {
  return Math.min(1.0, Math.max(0.5, rate))
}

export function clampSemitones(semi: number): number {
  return Math.min(12, Math.max(-12, Math.round(semi)))
}
