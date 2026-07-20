import { describe, expect, it } from 'vitest'

import { resolveDiagram } from './resolve'

describe('resolveDiagram', () => {
  it('resolves a whole-neck scale', () => {
    const { dots, window } = resolveDiagram({ type: 'scale', tonic: 'A', scale: 'minor pentatonic' })
    expect(dots.length).toBeGreaterThan(20)
    expect(window).toBeNull()
    expect(dots.some((d) => d.isRoot)).toBe(true)
  })

  it('resolves a scale box with a fret window', () => {
    const { dots, window } = resolveDiagram({
      type: 'scale',
      tonic: 'A',
      scale: 'minor pentatonic',
      box: 0,
    })
    expect(dots.length).toBeGreaterThan(0)
    expect(window).not.toBeNull()
    expect(window!.minFret).toBeLessThanOrEqual(window!.maxFret)
  })

  it('throws on an out-of-range box', () => {
    expect(() =>
      resolveDiagram({ type: 'scale', tonic: 'A', scale: 'minor pentatonic', box: 9 }),
    ).toThrow(/box 9/)
  })

  it('resolves chord tones', () => {
    const { dots } = resolveDiagram({ type: 'chordTones', label: 'Em' })
    expect(dots.length).toBeGreaterThan(10)
    expect(dots.every((d) => ['E', 'G', 'B'].includes(d.note))).toBe(true)
  })

  it('resolves a specific CAGED voicing', () => {
    const { dots, window } = resolveDiagram({ type: 'voicing', label: 'C', shape: 'E' })
    expect(dots.length).toBeGreaterThanOrEqual(4)
    expect(window).not.toBeNull()
  })

  it('throws on a minor voicing shape that does not exist', () => {
    expect(() => resolveDiagram({ type: 'voicing', label: 'Am', shape: 'G' })).toThrow(/G-shape/)
  })

  it('throws on empty literal', () => {
    expect(() => resolveDiagram({ type: 'literal', positions: [] })).toThrow(/no positions/)
  })
})
