import { describe, expect, it } from 'vitest'

import {
  chordAtTime,
  chordNotes,
  diatonicChords,
  displayChordLabel,
  keyPrefersFlats,
  parseChordLabel,
  transposeChordLabel,
  type ChordSpan,
} from './chords'
import { bpmFromTaps, clampBpm } from './metronome'
import {
  TUNINGS,
  chordPositions,
  chordVoicings,
  pentatonicBoxes,
  scaleBoxes,
  scaleNotes,
  scalePositions,
} from './scales'

const STANDARD = TUNINGS.standard.notes

// -- chord labels ----------------------------------------------------------

describe('chord label normalization', () => {
  it('parses backend labels', () => {
    expect(parseChordLabel('C')).toEqual({ root: 'C', minor: false })
    expect(parseChordLabel('F#m')).toEqual({ root: 'F#', minor: true })
    expect(parseChordLabel('N')).toBeNull()
    expect(parseChordLabel('??')).toBeNull()
  })

  it('resolves triad notes via tonal', () => {
    expect(chordNotes('C')).toEqual(['C', 'E', 'G'])
    expect(chordNotes('F#m')).toEqual(['F#', 'A', 'C#'])
    expect(chordNotes('N')).toEqual([])
  })

  it('transposes labels within the sharps vocabulary', () => {
    expect(transposeChordLabel('C', 2)).toBe('D')
    expect(transposeChordLabel('Am', -2)).toBe('Gm')
    expect(transposeChordLabel('B', 1)).toBe('C')
    expect(transposeChordLabel('C', -1)).toBe('B')
    expect(transposeChordLabel('N', 3)).toBe('N')
  })

  it('re-spells sharps as flats in flat keys', () => {
    const fMajor = { tonic: 'F', mode: 'major' as const, name: 'F major', confidence: 1 }
    const eMinor = { tonic: 'E', mode: 'minor' as const, name: 'E minor', confidence: 1 }
    expect(keyPrefersFlats(fMajor)).toBe(true)
    expect(keyPrefersFlats(eMinor)).toBe(false)
    expect(keyPrefersFlats(null)).toBe(false)
    expect(displayChordLabel('A#', true)).toBe('Bb')
    expect(displayChordLabel('A#m', true)).toBe('Bbm')
    expect(displayChordLabel('A#', false)).toBe('A#')
    expect(displayChordLabel('N', true)).toBe('·')
  })

  it('lists diatonic chords for the circle of fifths', () => {
    expect(diatonicChords('C', 'major')).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'])
    expect(diatonicChords('A', 'minor')[0]).toBe('Am')
  })
})

// -- timeline lookup -------------------------------------------------------

describe('chordAtTime', () => {
  const spans: ChordSpan[] = [
    { start: 0, end: 2, label: 'C' },
    { start: 2, end: 4, label: 'G' },
    { start: 5, end: 8, label: 'Am' },
  ]

  it('finds the covering span by binary search', () => {
    expect(chordAtTime(spans, 0)?.label).toBe('C')
    expect(chordAtTime(spans, 1.999)?.label).toBe('C')
    expect(chordAtTime(spans, 2)?.label).toBe('G')
    expect(chordAtTime(spans, 7.5)?.label).toBe('Am')
  })

  it('returns null in gaps and outside the timeline', () => {
    expect(chordAtTime(spans, 4.5)).toBeNull()
    expect(chordAtTime(spans, -1)).toBeNull()
    expect(chordAtTime(spans, 8)).toBeNull()
    expect(chordAtTime([], 1)).toBeNull()
  })
})

// -- scales & boxes --------------------------------------------------------

describe('scale positions and CAGED boxes', () => {
  it('computes scale notes via tonal', () => {
    expect(scaleNotes('A', 'minor pentatonic')).toEqual(['A', 'C', 'D', 'E', 'G'])
    expect(scaleNotes('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
  })

  it('marks roots and intervals across the neck', () => {
    const positions = scalePositions(STANDARD, 'A', 'minor pentatonic', 12)
    const lowRoot = positions.find((p) => p.string === 6 && p.fret === 5)
    expect(lowRoot).toMatchObject({ note: 'A', isRoot: true, interval: 'R' })
    const c = positions.find((p) => p.string === 6 && p.fret === 8)
    expect(c).toMatchObject({ note: 'C', interval: 'b3' })
    // nothing outside the scale
    const chromas = new Set(['A', 'C', 'D', 'E', 'G'])
    expect(positions.every((p) => chromas.has(p.note))).toBe(true)
  })

  it('produces the canonical A minor pentatonic box 1 (frets 5-8)', () => {
    const boxes = pentatonicBoxes(STANDARD, 'A', 'minor pentatonic', 15)
    expect(boxes.length).toBeGreaterThanOrEqual(4)
    const box1 = boxes[0]
    expect(box1.caged).toBe('E')
    const byString = (s: number) =>
      box1.positions.filter((p) => p.string === s).map((p) => p.fret).sort((a, b) => a - b)
    expect(byString(6)).toEqual([5, 8])
    expect(byString(5)).toEqual([5, 7])
    expect(byString(4)).toEqual([5, 7])
    expect(byString(3)).toEqual([5, 7])
    expect(byString(2)).toEqual([5, 8])
    expect(byString(1)).toEqual([5, 8])
  })

  it('produces the canonical A minor pentatonic box 2 (frets 7-10)', () => {
    const boxes = pentatonicBoxes(STANDARD, 'A', 'minor pentatonic', 15)
    const box2 = boxes[1]
    const byString = (s: number) =>
      box2.positions.filter((p) => p.string === s).map((p) => p.fret).sort((a, b) => a - b)
    expect(byString(6)).toEqual([8, 10])
    expect(byString(5)).toEqual([7, 10])
    expect(byString(4)).toEqual([7, 10])
    expect(byString(3)).toEqual([7, 9])
    expect(byString(2)).toEqual([8, 10])
    expect(byString(1)).toEqual([8, 10])
  })

  it('anchors boxes to the tuning: drop D moves the low-string root', () => {
    const standard = pentatonicBoxes(STANDARD, 'A', 'minor pentatonic', 15)
    const dropD = pentatonicBoxes(TUNINGS.dropD.notes, 'A', 'minor pentatonic', 15)
    const lowRootStd = standard[0].positions.find((p) => p.string === 6 && p.isRoot)
    const lowRootDrop = dropD[0].positions.find((p) => p.string === 6 && p.isRoot)
    expect(lowRootStd?.fret).toBe(5) // A on E string
    expect(lowRootDrop?.fret).toBe(7) // A on D string
  })

  it('fills diatonic boxes from the pentatonic skeleton, scale-only notes', () => {
    const boxes = scaleBoxes(STANDARD, 'A', 'minor', 15)
    expect(boxes.length).toBeGreaterThanOrEqual(4)
    const scale = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    for (const box of boxes) {
      expect(box.positions.length).toBeGreaterThan(12) // denser than pentatonic
      expect(box.positions.every((p) => scale.has(p.note))).toBe(true)
      expect(box.positions.every((p) => p.fret >= box.minFret && p.fret <= box.maxFret)).toBe(true)
    }
  })

  it('supports harmonic minor through the same box machinery', () => {
    const boxes = scaleBoxes(STANDARD, 'A', 'harmonic minor', 15)
    const notes = new Set(boxes.flatMap((b) => b.positions.map((p) => p.note)))
    expect(notes.has('G#')).toBe(true) // raised 7th present
    expect(notes.has('G')).toBe(false)
  })
})

// -- chord positions & voicings -------------------------------------------

describe('chord tones and voicings', () => {
  it('tags R/3/5 across the neck', () => {
    const positions = chordPositions(STANDARD, 'C', 12)
    const roots = positions.filter((p) => p.isRoot)
    expect(roots.length).toBeGreaterThan(0)
    expect(new Set(positions.map((p) => p.note))).toEqual(new Set(['C', 'E', 'G']))
    expect(new Set(positions.map((p) => p.interval))).toEqual(new Set(['R', '3', '5']))
  })

  it('generates the open C major voicing from the C shape', () => {
    const voicings = chordVoicings(STANDARD, 'C', 15)
    const cShape = voicings.find((v) => v.shape === 'C shape')
    expect(cShape).toBeDefined()
    const frets = new Map(cShape!.positions.map((p) => [p.string, p.fret]))
    expect(frets.get(5)).toBe(3)
    expect(frets.get(4)).toBe(2)
    expect(frets.get(3)).toBe(0)
    expect(frets.get(2)).toBe(1)
    expect(frets.get(1)).toBe(0)
  })

  it('generates the E-shape barre for F# minor at fret 2', () => {
    const voicings = chordVoicings(STANDARD, 'F#m', 15)
    const eShape = voicings.find((v) => v.shape === 'E shape')
    expect(eShape).toBeDefined()
    const s6 = eShape!.positions.find((p) => p.string === 6)
    expect(s6).toMatchObject({ fret: 2, isRoot: true })
  })

  it('returns no shape voicings outside standard tuning', () => {
    expect(chordVoicings(TUNINGS.dadgad.notes, 'C', 15)).toEqual([])
  })
})

// -- metronome math --------------------------------------------------------

describe('metronome', () => {
  it('derives bpm from median tap gap', () => {
    expect(bpmFromTaps([0, 500, 1000, 1500])).toBe(120)
    expect(bpmFromTaps([0, 500, 480, 1000].map((_, i, a) => a.slice(0, i + 1).reduce((x, y) => x + y, 0)))).not.toBeNull()
    expect(bpmFromTaps([0])).toBeNull()
    expect(bpmFromTaps([])).toBeNull()
    expect(bpmFromTaps([0, 5000])).toBeNull() // too slow to be a tap
  })

  it('resists one sloppy tap via the median', () => {
    // steady 500ms taps with one 900ms outlier
    expect(bpmFromTaps([0, 500, 1000, 1900, 2400])).toBe(120)
  })

  it('clamps bpm to a sane range', () => {
    expect(clampBpm(10)).toBe(30)
    expect(clampBpm(1000)).toBe(260)
    expect(clampBpm(Number.NaN)).toBe(120)
  })
})
