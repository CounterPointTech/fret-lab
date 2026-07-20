import { describe, expect, it } from 'vitest'

import {
  clampRate,
  clampSemitones,
  didWrap,
  effectiveGain,
  foldIntoLoop,
  positionAt,
  trainerPctForPass,
  trainerTotalPasses,
  type TransportSnapshot,
} from './transport'

const base: TransportSnapshot = {
  active: true,
  input: 10,
  output: 100,
  rate: 0.7,
  loopStart: 0,
  loopEnd: 0,
}

describe('positionAt', () => {
  it('advances by rate while playing', () => {
    expect(positionAt(base, 110)).toBeCloseTo(10 + 10 * 0.7)
  })

  it('freezes when paused', () => {
    expect(positionAt({ ...base, active: false }, 200)).toBe(10)
  })

  it('returns the anchor before the anchor time (scheduled in the future)', () => {
    expect(positionAt(base, 99)).toBe(10)
  })

  it('folds into the loop window', () => {
    const looped = { ...base, input: 60, output: 0, rate: 1, loopStart: 60, loopEnd: 68 }
    expect(positionAt(looped, 4)).toBeCloseTo(64)
    expect(positionAt(looped, 9)).toBeCloseTo(61) // 69 folds to 61
    expect(positionAt(looped, 25)).toBeCloseTo(61) // 85 folds by 3 whole loops
  })

  it('does not fold before reaching loop end', () => {
    const looped = { ...base, input: 0, output: 0, rate: 1, loopStart: 60, loopEnd: 68 }
    expect(positionAt(looped, 30)).toBeCloseTo(30) // approaching from before the window
  })
})

describe('foldIntoLoop', () => {
  it('is a no-op when looping is disabled', () => {
    expect(foldIntoLoop(123, 0, 0)).toBe(123)
    expect(foldIntoLoop(123, 50, 50)).toBe(123)
  })

  it('maps loopEnd exactly back to loopStart', () => {
    expect(foldIntoLoop(68, 60, 68)).toBe(60)
  })
})

describe('didWrap', () => {
  it('detects a wrap as a large backwards jump', () => {
    expect(didWrap(67.9, 60.1, 60, 68)).toBe(true)
  })

  it('ignores small backwards jitter', () => {
    expect(didWrap(64.0, 63.9, 60, 68)).toBe(false)
  })

  it('never fires without a loop', () => {
    expect(didWrap(100, 0, 0, 0)).toBe(false)
  })

  it('ignores forward motion', () => {
    expect(didWrap(61, 65, 60, 68)).toBe(false)
  })
})

describe('effectiveGain (mute/solo)', () => {
  const stem = (volume: number, muted: boolean, soloed: boolean) => ({ volume, muted, soloed })

  it('passes volume through with no solo/mute', () => {
    expect(effectiveGain(stem(0.8, false, false), false)).toBe(0.8)
  })

  it('mute silences the stem', () => {
    expect(effectiveGain(stem(0.8, true, false), false)).toBe(0)
  })

  it('an active solo elsewhere silences non-soloed stems', () => {
    expect(effectiveGain(stem(0.8, false, false), true)).toBe(0)
  })

  it('a soloed stem plays at its volume', () => {
    expect(effectiveGain(stem(0.8, false, true), true)).toBe(0.8)
  })

  it('mute beats solo on the same stem', () => {
    expect(effectiveGain(stem(0.8, true, true), true)).toBe(0)
  })
})

describe('speed trainer math', () => {
  const cfg = { startPct: 60, targetPct: 100, stepPct: 10 }

  it('ramps 60→100 in 10% steps and clamps at target', () => {
    const pcts = [0, 1, 2, 3, 4, 5, 6].map((p) => trainerPctForPass(cfg, p))
    expect(pcts).toEqual([60, 70, 80, 90, 100, 100, 100])
  })

  it('counts total passes to reach target', () => {
    expect(trainerTotalPasses(cfg)).toBe(5)
    expect(trainerTotalPasses({ startPct: 60, targetPct: 100, stepPct: 15 })).toBe(4) // 60,75,90,100
    expect(trainerTotalPasses({ startPct: 100, targetPct: 100, stepPct: 10 })).toBe(1)
  })

  it('degenerate step goes straight to target', () => {
    expect(trainerPctForPass({ ...cfg, stepPct: 0 }, 0)).toBe(100)
  })
})

describe('clamps', () => {
  it('clamps rate to 0.5–1.0', () => {
    expect(clampRate(0.3)).toBe(0.5)
    expect(clampRate(1.4)).toBe(1.0)
    expect(clampRate(0.7)).toBe(0.7)
  })

  it('clamps pitch to ±12 semitones and rounds', () => {
    expect(clampSemitones(14)).toBe(12)
    expect(clampSemitones(-13)).toBe(-12)
    expect(clampSemitones(2.4)).toBe(2)
  })
})
