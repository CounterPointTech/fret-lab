/**
 * Fretboard math: scale positions, pentatonic/CAGED boxes, chord tones and
 * classic voicing shapes. Pure functions — the Fretboard.js component just
 * draws what these return.
 *
 * Conventions (matching Fretboard.js): tuning arrays run low→high pitch
 * (['E2','A2','D3','G3','B3','E4']); string 1 is the highest-pitched string.
 */
import { Note, Scale } from 'tonal'

import { SHARP_NAMES, chordNotes, parseChordLabel } from './chords'

export interface FretPosition {
  string: number
  fret: number
  note: string
  /** interval degree vs the current root: 'R', 'b3', '5', … */
  interval?: string
  isRoot?: boolean
  inChord?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface ScaleBox {
  name: string
  /** CAGED shape letter this position aligns with ('E', 'D', 'C', 'A', 'G') */
  caged: string
  minFret: number
  maxFret: number
  positions: FretPosition[]
}

export interface ChordVoicing {
  shape: string
  positions: FretPosition[]
}

export const TUNINGS: Record<string, { label: string; notes: string[] }> = {
  standard: { label: 'Standard (E A D G B E)', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  halfStepDown: { label: 'Half-step down (Eb)', notes: ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'] },
  dropD: { label: 'Drop D', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  dadgad: { label: 'DADGAD', notes: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'] },
  openG: { label: 'Open G', notes: ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'] },
}

export const SCALE_TYPES = [
  'minor pentatonic',
  'major pentatonic',
  'minor',
  'major',
  'blues',
  'harmonic minor',
  'dorian',
  'mixolydian',
] as const
export type ScaleType = (typeof SCALE_TYPES)[number]

const INTERVAL_NAMES = ['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7']

/** MIDI number of a string's open note (string 1 = highest). */
export function openMidi(tuning: string[], stringNum: number): number {
  const midi = Note.midi(tuning[tuning.length - stringNum])
  if (midi == null) throw new Error(`Unreadable tuning note for string ${stringNum}`)
  return midi
}

export function scaleNotes(tonic: string, type: string): string[] {
  return Scale.get(`${tonic} ${type}`).notes
}

function intervalName(chroma: number, rootChroma: number): string {
  return INTERVAL_NAMES[(((chroma - rootChroma) % 12) + 12) % 12]
}

/** Every occurrence of the scale on the neck, with interval-vs-root info. */
export function scalePositions(
  tuning: string[],
  tonic: string,
  type: string,
  fretCount = 15,
): FretPosition[] {
  const rootChroma = Note.chroma(tonic)
  const chromas = new Set(
    scaleNotes(tonic, type)
      .map((n) => Note.chroma(n))
      .filter((c): c is number => c != null),
  )
  if (rootChroma == null || chromas.size === 0) return []
  const positions: FretPosition[] = []
  for (let s = 1; s <= tuning.length; s++) {
    const open = openMidi(tuning, s)
    for (let fret = 0; fret <= fretCount; fret++) {
      const chroma = (open + fret) % 12
      if (!chromas.has(chroma)) continue
      positions.push({
        string: s,
        fret,
        note: SHARP_NAMES[chroma],
        interval: intervalName(chroma, rootChroma),
        isRoot: chroma === rootChroma,
      })
    }
  }
  return positions
}

/** Ordered CAGED letters for boxes anchored at successive scale notes on
 * the lowest string, starting from the root (root anchor = E shape). */
const CAGED_SEQUENCE = ['E', 'D', 'C', 'A', 'G']

function nextInScale(midi: number, chromas: Set<number>): number {
  for (let m = midi + 1; m <= midi + 12; m++) {
    if (chromas.has(m % 12)) return m
  }
  return midi + 12
}

/**
 * The five canonical pentatonic boxes: walk consecutive scale notes two per
 * string from an anchor on the lowest string (box 1 anchored at the root).
 */
export function pentatonicBoxes(
  tuning: string[],
  tonic: string,
  type: 'minor pentatonic' | 'major pentatonic',
  fretCount = 15,
): ScaleBox[] {
  const rootChroma = Note.chroma(tonic)
  const notes = scaleNotes(tonic, type)
  const chromas = new Set(
    notes.map((n) => Note.chroma(n)).filter((c): c is number => c != null),
  )
  if (rootChroma == null || chromas.size !== 5) return []

  const nStrings = tuning.length
  const lowOpen = openMidi(tuning, nStrings)
  const rootFret = (((rootChroma - lowOpen) % 12) + 12) % 12

  // anchors: the 5 scale-note frets on the lowest string, root first
  const anchors: number[] = []
  let midi = lowOpen + rootFret
  for (let k = 0; k < 5; k++) {
    anchors.push(midi)
    midi = nextInScale(midi, chromas)
  }

  const boxes: ScaleBox[] = []
  anchors.forEach((anchorMidi, k) => {
    // shift down an octave when the box would fall off the visible neck
    let start = anchorMidi
    while (start - 12 >= lowOpen && start - lowOpen + 4 > fretCount) start -= 12
    const positions: FretPosition[] = []
    let cur = start
    for (let s = nStrings; s >= 1; s--) {
      const open = openMidi(tuning, s)
      for (let i = 0; i < 2; i++) {
        while (cur < open) cur = nextInScale(cur, chromas) // non-standard tunings
        const chroma = cur % 12
        positions.push({
          string: s,
          fret: cur - open,
          note: SHARP_NAMES[chroma],
          interval: intervalName(chroma, rootChroma),
          isRoot: chroma === rootChroma,
        })
        cur = nextInScale(cur, chromas)
      }
    }
    const frets = positions.map((p) => p.fret)
    const minFret = Math.min(...frets)
    const maxFret = Math.max(...frets)
    if (maxFret <= fretCount && minFret >= 0) {
      boxes.push({ name: `Box ${k + 1}`, caged: CAGED_SEQUENCE[k], minFret, maxFret, positions })
    }
  })
  return boxes
}

/**
 * Position boxes for any supported scale. Pentatonics get their canonical
 * boxes; 7-note scales use the matching pentatonic skeleton's fret windows
 * (how CAGED is actually taught: pentatonic frame + passing tones) filled
 * with the full scale.
 */
export function scaleBoxes(
  tuning: string[],
  tonic: string,
  type: string,
  fretCount = 15,
): ScaleBox[] {
  if (type === 'minor pentatonic' || type === 'major pentatonic') {
    return pentatonicBoxes(tuning, tonic, type, fretCount)
  }
  const intervals = Scale.get(`${tonic} ${type}`).intervals
  const skeleton = intervals.includes('3M') ? 'major pentatonic' : 'minor pentatonic'
  const frames = pentatonicBoxes(tuning, tonic, skeleton, fretCount)
  const all = scalePositions(tuning, tonic, type, fretCount)
  return frames.map((frame) => {
    const positions = all.filter((p) => p.fret >= frame.minFret && p.fret <= frame.maxFret)
    return { ...frame, positions }
  })
}

/** Every chord tone on the neck for a triad label ("F#m"), R/3/5 tagged. */
export function chordPositions(
  tuning: string[],
  label: string,
  fretCount = 15,
): FretPosition[] {
  const parsed = parseChordLabel(label)
  if (!parsed) return []
  const rootChroma = Note.chroma(parsed.root)
  const chromas = new Set(
    chordNotes(label)
      .map((n) => Note.chroma(n))
      .filter((c): c is number => c != null),
  )
  if (rootChroma == null || chromas.size === 0) return []
  const positions: FretPosition[] = []
  for (let s = 1; s <= tuning.length; s++) {
    const open = openMidi(tuning, s)
    for (let fret = 0; fret <= fretCount; fret++) {
      const chroma = (open + fret) % 12
      if (!chromas.has(chroma)) continue
      positions.push({
        string: s,
        fret,
        note: SHARP_NAMES[chroma],
        interval: intervalName(chroma, rootChroma),
        isRoot: chroma === rootChroma,
      })
    }
  }
  return positions
}

// Classic CAGED voicing templates, standard 6-string tuning only.
// Frets are relative to the root fret r; null = string not played.
type ShapeTemplate = { rootString: number; frets: (number | null)[]; minRoot: number }
const MAJOR_SHAPES: Record<string, ShapeTemplate> = {
  E: { rootString: 6, frets: [0, 2, 2, 1, 0, 0], minRoot: 0 },
  A: { rootString: 5, frets: [null, 0, 2, 2, 2, 0], minRoot: 0 },
  D: { rootString: 4, frets: [null, null, 0, 2, 3, 2], minRoot: 0 },
  C: { rootString: 5, frets: [null, 0, -1, -3, -2, -3], minRoot: 3 },
  G: { rootString: 6, frets: [0, -1, -3, -3, -3, 0], minRoot: 3 },
}
const MINOR_SHAPES: Record<string, ShapeTemplate> = {
  E: { rootString: 6, frets: [0, 2, 2, 0, 0, 0], minRoot: 0 },
  A: { rootString: 5, frets: [null, 0, 2, 2, 1, 0], minRoot: 0 },
  D: { rootString: 4, frets: [null, null, 0, 2, 3, 1], minRoot: 0 },
}

/**
 * CAGED voicings for a triad label across the neck. Standard-tuning
 * shapes — returns [] for other tunings (chord tones still render there).
 */
export function chordVoicings(
  tuning: string[],
  label: string,
  fretCount = 15,
): ChordVoicing[] {
  if (tuning.join() !== TUNINGS.standard.notes.join()) return []
  const parsed = parseChordLabel(label)
  if (!parsed) return []
  const rootChroma = Note.chroma(parsed.root)
  if (rootChroma == null) return []
  const shapes = parsed.minor ? MINOR_SHAPES : MAJOR_SHAPES
  const voicings: ChordVoicing[] = []
  for (const [shape, tpl] of Object.entries(shapes)) {
    const open = openMidi(tuning, tpl.rootString)
    let rootFret = (((rootChroma - open) % 12) + 12) % 12
    if (rootFret < tpl.minRoot) rootFret += 12
    const chordChromas = chordNotes(label).map((n) => Note.chroma(n))
    const positions: FretPosition[] = []
    let valid = true
    tpl.frets.forEach((rel, i) => {
      if (rel == null) return
      const stringNum = 6 - i // template arrays run low→high string
      const fret = rootFret + rel
      if (fret < 0 || fret > fretCount) {
        valid = false
        return
      }
      const chroma = (openMidi(tuning, stringNum) + fret) % 12
      if (!chordChromas.includes(chroma)) {
        valid = false
        return
      }
      positions.push({
        string: stringNum,
        fret,
        note: SHARP_NAMES[chroma],
        interval: intervalName(chroma, rootChroma),
        isRoot: chroma === rootChroma,
      })
    })
    if (valid && positions.length >= 3) {
      voicings.push({ shape: `${shape} shape`, positions })
    }
  }
  voicings.sort(
    (a, b) =>
      Math.min(...a.positions.map((p) => p.fret)) -
      Math.min(...b.positions.map((p) => p.fret)),
  )
  return voicings
}

export interface ScaleSuggestion {
  label: string
  tonic: string
  type: ScaleType
  why: string
}

/** Jam-friendly scales for a detected key, best first (tonal-derived). */
export function suggestScales(tonic: string, mode: 'major' | 'minor'): ScaleSuggestion[] {
  if (mode === 'minor') {
    return [
      { label: `${tonic} minor pentatonic`, tonic, type: 'minor pentatonic', why: 'safest choice — five can’t-miss notes' },
      { label: `${tonic} natural minor`, tonic, type: 'minor', why: 'the full key — adds the 2nd and b6' },
      { label: `${tonic} blues`, tonic, type: 'blues', why: 'pentatonic plus the b5 for grit' },
      { label: `${tonic} dorian`, tonic, type: 'dorian', why: 'jazzier minor — natural 6th' },
      { label: `${tonic} harmonic minor`, tonic, type: 'harmonic minor', why: 'raised 7th over the V chord' },
    ]
  }
  return [
    { label: `${tonic} major pentatonic`, tonic, type: 'major pentatonic', why: 'safest choice — five can’t-miss notes' },
    { label: `${tonic} major`, tonic, type: 'major', why: 'the full key' },
    { label: `${tonic} mixolydian`, tonic, type: 'mixolydian', why: 'bluesier major — b7 over dominant grooves' },
  ]
}
