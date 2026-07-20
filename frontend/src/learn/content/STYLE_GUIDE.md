# Learn content authoring guide

Each course is ONE TypeScript module in `frontend/src/learn/content/` that default-exports a
`Course` (see `../types.ts`). Content is rendered by `LessonBlocks.tsx`; diagrams resolve
through `../resolve.ts` → `src/theory/scales.ts`, so every spec is validated by tests.

## Hard rules (enforced by content.test.ts)

1. `course.id` and lesson ids must EXACTLY match the entries in `content/index.ts`
   (`COURSES[n].lessonIds`) — same ids, same order, flattened across modules.
2. Every lesson: `id`, `title`, `synopsis` (one sentence), `blocks`.
3. Quizzes: 2–4 choices per question, `answer` is a valid index, non-empty `explanation`.
   3–5 questions per lesson quiz, exactly ONE quiz block per lesson, placed LAST (or
   second-to-last if followed by a `jam` block).
4. Every `fretboard` spec must resolve (standard tuning) — run the test to confirm.
5. Lesson prose: 400–900 words total across its `text` blocks. Do not exceed 900.
6. `table` rows must all have the same length as `head`.

## Vocabulary constraints (the resolvers are strict)

- `scale` specs: tonic is a pitch class like `'A'`, `'F#'`, `'Bb'`; scale is one of
  `'minor pentatonic' | 'major pentatonic' | 'minor' | 'major' | 'blues' | 'harmonic minor' | 'dorian' | 'mixolydian'`;
  `box` is 0–4 (5 boxes; omit for whole-neck).
- `chordTones` / `voicing` labels: PLAIN TRIADS ONLY — `[A-G][#b]?` + optional `m`
  (e.g. `'C'`, `'F#m'`, `'Bbm'`). No 7ths/sus/dim in diagrams — describe those in prose/tables.
- `voicing` shapes: major chords have all of `'C'|'A'|'G'|'E'|'D'`; minor chords ONLY
  `'E'|'A'|'D'`. Omit `shape` to take the lowest-position voicing.
- `literal` diagrams: escape hatch, MAX 2 per course, only for shapes the generators can't
  express (e.g. an isolated interval pair). `FretPosition` = `{string, fret, note, interval?,
  isRoot?}` where **string 1 = high E, string 6 = low E** and `note` is the real pitch class at
  that fret in standard tuning (E A D G B E low→high). Double-check every literal by hand.
- `jam` blocks: `tonic` + `mode` ('major'|'minor') pick matching library songs; `scale` is the
  suggested scale. Use keys real songs live in (A minor, E minor, G major…).
- `metronome` blocks: `bpm` 40–200, with a one-line `label` describing the drill.

## Voice & pedagogy (the zombieguitar ethos)

- **Shapes first, names second.** Introduce the fretboard pattern, THEN name it. Every concept
  must land on a diagram or an instruction to play something within a paragraph or two.
- Second person, direct, encouraging, zero academic hedging. Contractions fine. One idea per
  paragraph. Bold the term being defined ONCE at first use.
- Constant "now play this" framing: end most text sections with a concrete instruction.
- Connect forward/backward: "you met this in Lesson X" / "Course Y digs deeper."
- No tab notation, no audio references — diagrams, tables, and prose only.
- Markdown subset ONLY: paragraphs, `**bold**`, `*italic*`, `` `code` ``, `-` lists, `1.` lists.
  No headings inside `md` (use the block's `heading` field), no links, no HTML.

## Exemplar lesson (gold standard — match this density and rhythm)

```ts
{
  id: 'foundations-fretboard-map',
  title: 'The Musical Alphabet & the Fretboard Map',
  synopsis: 'Twelve notes, one repeating map — learn the low strings and own the neck.',
  blocks: [
    {
      kind: 'text',
      md: `Music has exactly **twelve notes**. That's the whole alphabet: A, A#, B, C, C#, D, D#, E, F, F#, G, G# — then it repeats, higher. Every riff you love is built from these twelve, and on the guitar they're laid out in a dead-simple pattern: **one fret = one step** up the alphabet.

Two quirks to memorize now: there's no sharp between **B and C**, and none between **E and F**. Those pairs sit on neighboring frets. Everything else has a sharp (or, seen from above, a flat) between them.`,
    },
    {
      kind: 'text',
      heading: 'Why the low strings matter most',
      md: `Almost everything you'll learn — power chords, barre chords, scale boxes, the CAGED system — is **anchored to a root note on the low E or A string**. Know those two strings cold and every shape in this curriculum snaps into place.

Play fret 3 on the low E string: that's **G**. Fret 5 is **A**. Fret 7 is **B**, fret 8 is **C**. Say each note out loud as you play it — slowly, no metronome yet. That's the map forming.`,
    },
    {
      kind: 'fretboard',
      spec: { type: 'scale', tonic: 'C', scale: 'major' },
      caption: 'Every C major note on the neck — notice how the same notes repeat in octaves as you move up.',
    },
    {
      kind: 'table',
      caption: 'The low E string, frets 0–12. The A string works identically, starting from A.',
      head: ['Fret', '0', '1', '2', '3', '5', '7', '8', '10', '12'],
      rows: [['Note', 'E', 'F', 'F#', 'G', 'A', 'B', 'C', 'D', 'E']],
    },
    {
      kind: 'quiz',
      questions: [
        {
          prompt: 'Which two pairs of notes have NO sharp between them?',
          choices: ['A–B and C–D', 'B–C and E–F', 'F–G and G–A', 'D–E and A–B'],
          answer: 1,
          explanation: 'B→C and E→F are the two natural half steps — neighboring frets with nothing between.',
        },
        {
          prompt: 'What note is at fret 5 of the low E string?',
          choices: ['G', 'A', 'B', 'C'],
          answer: 1,
          explanation: 'E (0) → F (1) → F# (2) → G (3) → G# (4) → A (5). Fret 5 of any string is also the next string\\'s open note — except B.',
        },
        {
          prompt: 'One fret on the guitar equals…',
          choices: ['One whole step', 'One half step', 'One octave', 'It depends on the string'],
          answer: 1,
          explanation: 'Each fret is a half step (semitone) — the smallest distance in Western music. Two frets make a whole step.',
        },
      ],
    },
  ],
}
```

## Module structure

Split each course's lessons into 2 modules with short evocative titles (e.g. "The Map" /
"Using the Map"). The flattened lesson order MUST equal the `lessonIds` order in index.ts.

## File shape

```ts
import type { Course } from '../types'

const course: Course = {
  id: '<course-id>',
  title: '<exact title from index.ts>',
  description: '<exact description from index.ts>',
  modules: [ { title: '...', lessons: [...] }, { title: '...', lessons: [...] } ],
}

export default course
```
