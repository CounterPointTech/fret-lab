/**
 * Chord-label helpers over the backend's analysis vocabulary.
 *
 * The analyze job emits sharps-only triad labels: "C", "F#m", or "N"
 * (no chord). tonal does the music-theory lifting; this module owns the
 * label format and the timeline lookup.
 */
import { Chord, Key, Note } from 'tonal'

export interface ChordSpan {
  start: number
  end: number
  label: string
}

export interface SongKey {
  tonic: string
  mode: 'major' | 'minor'
  name: string
  confidence: number
}

export interface ChordsPayload {
  version: number
  duration: number
  bpm: number | null
  key: SongKey | null
  chords: ChordSpan[]
}

export const SHARP_NAMES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
] as const

export function parseChordLabel(label: string): { root: string; minor: boolean } | null {
  if (label === 'N' || label === '') return null
  const minor = label.endsWith('m')
  const root = minor ? label.slice(0, -1) : label
  // strict vocabulary check — tonal is lenient about junk input
  return /^[A-G][#b]?$/.test(root) ? { root, minor } : null
}

/** Pitch classes of a triad label; [] for "N" / unparseable. */
export function chordNotes(label: string): string[] {
  const parsed = parseChordLabel(label)
  if (!parsed) return []
  return Chord.getChord(parsed.minor ? 'minor' : 'major', parsed.root).notes
}

/** Shift a label by n semitones, staying in the sharps-only vocabulary. */
export function transposeChordLabel(label: string, semitones: number): string {
  const parsed = parseChordLabel(label)
  if (!parsed) return label
  const chroma = Note.chroma(parsed.root)
  if (chroma == null) return label
  const next = SHARP_NAMES[(((chroma + semitones) % 12) + 12) % 12]
  return parsed.minor ? `${next}m` : next
}

/** Does this key's signature prefer flat spellings? (F major, D minor, …) */
export function keyPrefersFlats(key: SongKey | null): boolean {
  if (!key) return false
  const majorTonic =
    key.mode === 'major'
      ? key.tonic
      : SHARP_NAMES[(Note.chroma(key.tonic)! + 3) % 12] // relative major
  return Key.majorKey(majorTonic).alteration < 0
}

/**
 * Display form of a label: re-spells sharps as flats when the key calls
 * for it ("A#m" -> "Bbm" in F/Dm contexts). "N" renders as a dash.
 */
export function displayChordLabel(label: string, preferFlats: boolean): string {
  if (label === 'N') return '·'
  const parsed = parseChordLabel(label)
  if (!parsed) return label
  let root = parsed.root
  if (preferFlats && root.includes('#')) {
    root = Note.enharmonic(root)
  }
  return parsed.minor ? `${root}m` : root
}

/** Binary search the span covering time t (spans sorted, non-overlapping). */
export function chordAtTime(spans: ChordSpan[], t: number): ChordSpan | null {
  let lo = 0
  let hi = spans.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const span = spans[mid]
    if (t < span.start) hi = mid - 1
    else if (t >= span.end) lo = mid + 1
    else return span
  }
  return null
}

/** Diatonic triads for a key (for the circle-of-fifths panel). */
export function diatonicChords(tonic: string, mode: 'major' | 'minor'): string[] {
  if (mode === 'major') return [...Key.majorKey(tonic).triads]
  return [...Key.minorKey(tonic).natural.triads]
}
