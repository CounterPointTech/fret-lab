import type { FretPosition, ScaleType } from '../theory/scales'

export type Mode = 'major' | 'minor'

/**
 * Declarative diagram spec resolved at render time through the theory
 * functions (src/theory/scales.ts) — lesson diagrams are computed, never
 * hand-typed, so they are guaranteed musically correct. `literal` is the
 * escape hatch for shapes the generators can't express (e.g. isolated
 * interval diagrams) and gets hand-checked in content review.
 */
export type DiagramSpec =
  | { type: 'scale'; tonic: string; scale: ScaleType; box?: number }
  | { type: 'chordTones'; label: string }
  | { type: 'voicing'; label: string; shape?: 'C' | 'A' | 'G' | 'E' | 'D' }
  | { type: 'literal'; positions: FretPosition[] }

export interface QuizQuestion {
  prompt: string
  /** 2-4 choices. */
  choices: string[]
  /** Index into `choices`. */
  answer: number
  /** Shown after answering, right or wrong. */
  explanation: string
}

export type Block =
  | { kind: 'text'; heading?: string; md: string }
  | {
      kind: 'fretboard'
      spec: DiagramSpec
      caption: string
      showIntervals?: boolean
      fretCount?: number
    }
  | { kind: 'circle'; tonic: string; mode: Mode; caption?: string }
  | { kind: 'quiz'; questions: QuizQuestion[] }
  /** Practice call-to-action: jam this concept over library songs in a matching key. */
  | { kind: 'jam'; md: string; tonic: string; mode: Mode; scale: ScaleType }
  | { kind: 'metronome'; bpm: number; label?: string }
  | { kind: 'table'; caption?: string; head: string[]; rows: string[][] }

export interface Lesson {
  /** Globally unique kebab slug, prefixed with the course id. */
  id: string
  title: string
  /** One line, shown in the course syllabus. */
  synopsis: string
  blocks: Block[]
}

export interface Module {
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
}

/**
 * Eager catalog entry — tiny, ships in the main bundle. Full course bodies
 * (all the prose) load lazily per course via `load()`.
 */
export interface CourseMeta {
  id: string
  title: string
  description: string
  /** Curriculum order; drives progress % without loading the content chunk. */
  lessonIds: string[]
  load: () => Promise<Course>
}
