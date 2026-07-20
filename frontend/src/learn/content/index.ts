import type { CourseMeta } from '../types'

/**
 * The curriculum catalog. Eager and tiny — course bodies (all prose) are
 * separate lazy chunks via `load()`. `lessonIds` is the canonical curriculum
 * order and MUST exactly match each course module's lessons in order — the
 * content integrity test enforces it.
 */
export const COURSES: CourseMeta[] = [
  {
    id: 'foundations',
    title: 'Guitar Theory Foundations',
    description:
      'The musical alphabet, intervals as shapes, the major scale, keys, the circle of fifths, and where chords come from — everything else builds on this.',
    lessonIds: [
      'foundations-fretboard-map',
      'foundations-intervals',
      'foundations-major-scale',
      'foundations-keys-signatures',
      'foundations-circle-of-fifths',
      'foundations-relative-minor',
      'foundations-triads',
    ],
    load: () => import('./foundations').then((m) => m.default),
  },
  {
    id: 'pentatonics',
    title: 'Pentatonic Mastery',
    description:
      'The five boxes that unlock the whole neck — learn them, connect them, and solo in any key over any song.',
    lessonIds: [
      'pentatonics-box-1',
      'pentatonics-boxes-2-3',
      'pentatonics-boxes-4-5',
      'pentatonics-connecting',
      'pentatonics-major',
      'pentatonics-any-key',
    ],
    load: () => import('./pentatonics').then((m) => m.default),
  },
  {
    id: 'blues',
    title: 'Blues Language',
    description:
      'The blue note, the 12-bar form, dominant 7ths, and the major/minor blend — the vocabulary underneath rock, blues, and everything between.',
    lessonIds: [
      'blues-blue-note',
      'blues-12-bar',
      'blues-dominant-7',
      'blues-major-minor',
      'blues-phrasing',
      'blues-turnarounds',
    ],
    load: () => import('./blues').then((m) => m.default),
  },
  {
    id: 'harmony',
    title: 'Diatonic Harmony',
    description:
      'Why chords belong to keys: harmonizing the scale, Roman numerals, the progressions behind a thousand songs, cadences, and minor-key harmony.',
    lessonIds: [
      'harmony-seven-note-patterns',
      'harmony-harmonizing',
      'harmony-roman-numerals',
      'harmony-progressions',
      'harmony-cadences',
      'harmony-minor-keys',
      'harmony-find-the-key',
    ],
    load: () => import('./harmony').then((m) => m.default),
  },
  {
    id: 'caged',
    title: 'The CAGED System',
    description:
      'Five chord shapes that map the entire neck — and how scales and arpeggios live inside them.',
    lessonIds: [
      'caged-five-shapes',
      'caged-e-a-barres',
      'caged-c-g-d',
      'caged-scales-in-shapes',
      'caged-arpeggios',
      'caged-five-zones',
    ],
    load: () => import('./caged').then((m) => m.default),
  },
  {
    id: 'chord-tones',
    title: 'Chord Tone Targeting',
    description:
      'Stop playing the key and start playing the changes — arpeggio maps, targeting 3rds, and the on-off method over real songs.',
    lessonIds: [
      'chord-tones-landing-notes',
      'chord-tones-triad-arpeggios',
      'chord-tones-target-3rd',
      'chord-tones-on-off',
      'chord-tones-progressions',
      'chord-tones-real-songs',
    ],
    load: () => import('./chordTones').then((m) => m.default),
  },
  {
    id: 'modes',
    title: 'Modes & Beyond',
    description:
      'One parent scale, seven sounds: Dorian, Mixolydian, Lydian, Phrygian — plus harmonic minor and when to reach for it.',
    lessonIds: [
      'modes-what-are-modes',
      'modes-dorian',
      'modes-mixolydian',
      'modes-lydian',
      'modes-phrygian',
      'modes-harmonic-minor',
    ],
    load: () => import('./modes').then((m) => m.default),
  },
  {
    id: 'phrasing',
    title: 'Phrasing & Composition',
    description:
      'Notes into music: motifs, question-and-answer phrasing, bends and vibrato, rhythm, and composing a complete solo.',
    lessonIds: [
      'phrasing-motifs',
      'phrasing-question-answer',
      'phrasing-bends-vibrato',
      'phrasing-rhythm',
      'phrasing-solo-arc',
      'phrasing-compose',
    ],
    load: () => import('./phrasing').then((m) => m.default),
  },
]

export function courseMeta(id: string): CourseMeta | undefined {
  return COURSES.find((c) => c.id === id)
}
