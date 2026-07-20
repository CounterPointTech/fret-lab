import { beforeAll, describe, expect, it } from 'vitest'

import { resolveDiagram } from '../resolve'
import type { Block, Course } from '../types'
import { COURSES } from './index'

/** Word count across a lesson's text/jam markdown. */
function wordCount(blocks: Block[]): number {
  let words = 0
  for (const b of blocks) {
    if (b.kind === 'text' || b.kind === 'jam') {
      words += b.md.split(/\s+/).filter(Boolean).length
    }
  }
  return words
}

const loaded = new Map<string, Course>()

// Load all courses up-front (dynamic imports, same path the app uses).
beforeAll(async () => {
  for (const meta of COURSES) {
    loaded.set(meta.id, await meta.load())
  }
})

describe('curriculum content integrity', () => {
  it('lesson ids are globally unique', () => {
    const all = COURSES.flatMap((c) => c.lessonIds)
    expect(new Set(all).size).toBe(all.length)
  })

  for (const meta of COURSES) {
    describe(meta.id, () => {
      it('course module lessons exactly match lessonIds in order', () => {
        const course = loaded.get(meta.id)!
        expect(course.id).toBe(meta.id)
        const flat = course.modules.flatMap((m) => m.lessons.map((l) => l.id))
        expect(flat).toEqual(meta.lessonIds)
      })

      it('every lesson id is prefixed with the course id', () => {
        for (const id of meta.lessonIds) expect(id.startsWith(`${meta.id}-`)).toBe(true)
      })

      it('lessons are well-formed: titles, synopses, word counts, block rules', () => {
        const course = loaded.get(meta.id)!
        for (const module of course.modules) {
          expect(module.title.length).toBeGreaterThan(0)
          for (const lesson of module.lessons) {
            expect(lesson.title.length).toBeGreaterThan(3)
            expect(lesson.synopsis.length).toBeGreaterThan(10)
            const words = wordCount(lesson.blocks)
            expect(words, `${lesson.id} word count ${words}`).toBeGreaterThanOrEqual(250)
            expect(words, `${lesson.id} word count ${words}`).toBeLessThanOrEqual(1100)
            const quizzes = lesson.blocks.filter((b) => b.kind === 'quiz')
            expect(quizzes.length, `${lesson.id} must have exactly one quiz`).toBe(1)
          }
        }
      })

      it('quizzes are valid: 2-4 choices, answer in range, explanations present', () => {
        const course = loaded.get(meta.id)!
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            for (const block of lesson.blocks) {
              if (block.kind !== 'quiz') continue
              expect(block.questions.length).toBeGreaterThanOrEqual(2)
              expect(block.questions.length).toBeLessThanOrEqual(6)
              for (const q of block.questions) {
                expect(q.choices.length, `${lesson.id}: "${q.prompt}"`).toBeGreaterThanOrEqual(2)
                expect(q.choices.length, `${lesson.id}: "${q.prompt}"`).toBeLessThanOrEqual(4)
                expect(q.answer, `${lesson.id}: "${q.prompt}"`).toBeGreaterThanOrEqual(0)
                expect(q.answer, `${lesson.id}: "${q.prompt}"`).toBeLessThan(q.choices.length)
                expect(q.explanation.length, `${lesson.id}: "${q.prompt}"`).toBeGreaterThan(10)
              }
            }
          }
        }
      })

      it('every fretboard spec resolves to dots; tables are rectangular', () => {
        const course = loaded.get(meta.id)!
        for (const module of course.modules) {
          for (const lesson of module.lessons) {
            for (const block of lesson.blocks) {
              if (block.kind === 'fretboard') {
                const { dots } = resolveDiagram(block.spec, block.fretCount)
                expect(dots.length, `${lesson.id}: ${JSON.stringify(block.spec)}`).toBeGreaterThan(0)
                expect(block.caption.length).toBeGreaterThan(5)
              }
              if (block.kind === 'table') {
                for (const row of block.rows) {
                  expect(row.length, `${lesson.id} table row width`).toBe(block.head.length)
                }
              }
            }
          }
        }
      })
    })
  }
})
