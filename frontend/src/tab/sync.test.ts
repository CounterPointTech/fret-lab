import { describe, expect, it } from 'vitest'

import { TICKS_PER_QUARTER, barSyncOffsetsMs, secondsToTick, tickToSeconds } from './sync'

describe('tickToSeconds', () => {
  it('maps tick 0 to the offset', () => {
    expect(tickToSeconds(0, { audioBpm: 112, offsetS: 1.25 })).toBeCloseTo(1.25, 10)
  })

  it('maps one quarter note to 60/bpm seconds', () => {
    expect(tickToSeconds(TICKS_PER_QUARTER, { audioBpm: 120, offsetS: 0 })).toBeCloseTo(0.5)
    expect(tickToSeconds(TICKS_PER_QUARTER, { audioBpm: 60, offsetS: 0 })).toBeCloseTo(1)
    expect(tickToSeconds(TICKS_PER_QUARTER, { audioBpm: 112, offsetS: 0 })).toBeCloseTo(60 / 112)
  })

  it('a 4/4 bar at 112 bpm with 1.25s offset: bar 8 starts at offset + 8*4*60/112', () => {
    const tick = 8 * 4 * TICKS_PER_QUARTER
    expect(tickToSeconds(tick, { audioBpm: 112, offsetS: 1.25 })).toBeCloseTo(
      1.25 + (8 * 4 * 60) / 112,
    )
  })

  it('rejects nonsense models', () => {
    expect(() => tickToSeconds(0, { audioBpm: 0, offsetS: 0 })).toThrow(/audioBpm/)
    expect(() => tickToSeconds(0, { audioBpm: -10, offsetS: 0 })).toThrow(/audioBpm/)
    expect(() => tickToSeconds(0, { audioBpm: NaN, offsetS: 0 })).toThrow(/audioBpm/)
    expect(() => tickToSeconds(0, { audioBpm: 120, offsetS: Infinity })).toThrow(/offsetS/)
  })
})

describe('secondsToTick', () => {
  it('is the inverse of tickToSeconds across bpm/offset combinations', () => {
    const models = [
      { audioBpm: 60, offsetS: 0 },
      { audioBpm: 112, offsetS: 1.25 },
      { audioBpm: 173.5, offsetS: -0.4 },
      { audioBpm: 90, offsetS: 30 },
    ]
    for (const sync of models) {
      for (const tick of [0, 1, 960, 3840, 123456]) {
        expect(secondsToTick(tickToSeconds(tick, sync), sync)).toBeCloseTo(tick, 6)
      }
    }
  })

  it('clamps times before the score start to tick 0', () => {
    expect(secondsToTick(0.5, { audioBpm: 112, offsetS: 1.25 })).toBe(0)
    expect(secondsToTick(-10, { audioBpm: 112, offsetS: 0 })).toBe(0)
  })

  it('playback rate does not appear anywhere: source-time in, ticks out', () => {
    // At 0.7x the StemPlayer still reports source-time positions, so the same
    // position always maps to the same tick.
    const sync = { audioBpm: 112, offsetS: 1.25 }
    expect(secondsToTick(10, sync)).toBeCloseTo(secondsToTick(10, sync))
  })
})

describe('barSyncOffsetsMs', () => {
  it('produces one millisecond offset per bar start', () => {
    const bars = [0, 4 * TICKS_PER_QUARTER, 8 * TICKS_PER_QUARTER]
    const offsets = barSyncOffsetsMs(bars, { audioBpm: 120, offsetS: 1 })
    expect(offsets).toHaveLength(3)
    expect(offsets[0]).toBeCloseTo(1000)
    expect(offsets[1]).toBeCloseTo(1000 + 2000) // 4 quarters at 120bpm = 2s
    expect(offsets[2]).toBeCloseTo(1000 + 4000)
  })
})
