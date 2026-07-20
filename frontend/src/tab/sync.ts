/**
 * Manual score↔audio sync model v1.
 *
 * The user supplies two numbers per transcription:
 *  - `audioBpm`  — the tempo (quarter notes per minute) the *real recording*
 *    plays the score at. This intentionally ignores the score's own tempo
 *    marking: the recording's tempo is what matters.
 *  - `offsetS`   — where score tick 0 falls on the audio timeline (seconds).
 *
 * Both mappings are linear, so they are exact for constant-tempo audio; per-bar
 * sync points derived from this model feed AlphaTab's external-media API
 * (piecewise-linear interpolation between bar starts reproduces the same line).
 *
 * Note: StemPlayer positions are *source-time* seconds — time-stretching to
 * 0.7x slows how fast position advances in wall time but does not change the
 * position values themselves, so playback rate never enters this mapping.
 */

/** AlphaTab's MIDI resolution (MidiUtils.QuarterTime). */
export const TICKS_PER_QUARTER = 960

export interface SyncModel {
  audioBpm: number
  offsetS: number
}

function assertValid(sync: SyncModel): void {
  if (!Number.isFinite(sync.audioBpm) || sync.audioBpm <= 0) {
    throw new Error(`invalid audioBpm: ${sync.audioBpm}`)
  }
  if (!Number.isFinite(sync.offsetS)) {
    throw new Error(`invalid offsetS: ${sync.offsetS}`)
  }
}

/** Score tick → audio time in seconds. */
export function tickToSeconds(tick: number, sync: SyncModel): number {
  assertValid(sync)
  return sync.offsetS + (tick / TICKS_PER_QUARTER) * (60 / sync.audioBpm)
}

/** Audio time in seconds → score tick (clamped to ≥ 0, i.e. before the score
 * starts the cursor stays at the beginning). */
export function secondsToTick(seconds: number, sync: SyncModel): number {
  assertValid(sync)
  return Math.max(0, (seconds - sync.offsetS) * (sync.audioBpm / 60) * TICKS_PER_QUARTER)
}

/**
 * Millisecond audio offsets for a list of bar-start ticks — one AlphaTab
 * sync point per master bar pins the external time axis to our linear model.
 */
export function barSyncOffsetsMs(barStartTicks: number[], sync: SyncModel): number[] {
  return barStartTicks.map((tick) => tickToSeconds(tick, sync) * 1000)
}
