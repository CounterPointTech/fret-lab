import { Key } from 'tonal'

/** Static cheat-sheet data for /learn/reference. Key signatures are computed
 * via tonal so they can't drift from reality. */

export const INTERVALS: string[][] = [
  ['0', 'Unison (R)', 'Same note', 'The root itself'],
  ['1', 'Minor 2nd (b2)', 'One fret up', 'Jaws — maximum tension'],
  ['2', 'Major 2nd (2)', 'Two frets up', 'First two notes of a major scale'],
  ['3', 'Minor 3rd (b3)', 'Three frets', 'The minor sound'],
  ['4', 'Major 3rd (3)', 'Four frets', 'The major sound'],
  ['5', 'Perfect 4th (4)', 'Five frets (next string, same fret)', 'Here Comes the Bride'],
  ['6', 'Tritone (b5)', 'Six frets', 'The blue note / The Simpsons'],
  ['7', 'Perfect 5th (5)', 'Seven frets', 'Power chords, Star Wars'],
  ['8', 'Minor 6th (b6)', 'Eight frets', 'Dark, dramatic color'],
  ['9', 'Major 6th (6)', 'Nine frets', 'Sweet — the Dorian color note'],
  ['10', 'Minor 7th (b7)', 'Ten frets', 'Dominant/bluesy — one whole step below the octave'],
  ['11', 'Major 7th (7)', 'Eleven frets', 'Jazzy — one fret below the octave'],
  ['12', 'Octave', 'Twelve frets', 'Same note, higher'],
]

export const CHORD_FORMULAS: string[][] = [
  ['Major', 'R · 3 · 5', 'C = C E G', 'Bright, resolved'],
  ['Minor', 'R · b3 · 5', 'Cm = C Eb G', 'Dark, sad'],
  ['Diminished', 'R · b3 · b5', 'Cdim = C Eb Gb', 'Tense, unstable'],
  ['Augmented', 'R · 3 · #5', 'Caug = C E G#', 'Dreamlike, unresolved'],
  ['Sus2', 'R · 2 · 5', 'Csus2 = C D G', 'Open, ambiguous'],
  ['Sus4', 'R · 4 · 5', 'Csus4 = C F G', 'Suspended, wants to resolve'],
  ['Major 7', 'R · 3 · 5 · 7', 'Cmaj7 = C E G B', 'Smooth, jazzy'],
  ['Dominant 7', 'R · 3 · 5 · b7', 'C7 = C E G Bb', 'Bluesy, pushes to resolve'],
  ['Minor 7', 'R · b3 · 5 · b7', 'Cm7 = C Eb G Bb', 'Mellow minor'],
  ['Minor 7b5', 'R · b3 · b5 · b7', 'Cm7b5 = C Eb Gb Bb', 'The ii chord of minor keys'],
]

export const MODES: string[][] = [
  ['Ionian (major)', '1 2 3 4 5 6 7', '—', 'Home base, resolved, happy'],
  ['Dorian', '1 2 b3 4 5 6 b7', 'natural 6', 'The bright minor — funk, Santana'],
  ['Phrygian', '1 b2 b3 4 5 b6 b7', 'b2', 'Dark, flamenco, metal'],
  ['Lydian', '1 2 3 #4 5 6 7', '#4', 'Floating, dreamy, film scores'],
  ['Mixolydian', '1 2 3 4 5 6 b7', 'b7', 'The blues major — dominant grooves'],
  ['Aeolian (minor)', '1 2 b3 4 5 b6 b7', '—', 'The natural minor, melancholy'],
  ['Locrian', '1 b2 b3 4 b5 b6 b7', 'b5', 'Unstable — rarely a home'],
]

const MAJOR_TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']

export const KEY_SIGNATURES: string[][] = MAJOR_TONICS.map((tonic) => {
  const key = Key.majorKey(tonic)
  const sig = key.keySignature || '—'
  const count =
    sig === '—'
      ? 'none'
      : `${sig.length} ${sig[0] === '#' ? 'sharp' : 'flat'}${sig.length > 1 ? 's' : ''}`
  return [tonic, count, key.scale.join(' '), `${key.minorRelative} minor`]
})
