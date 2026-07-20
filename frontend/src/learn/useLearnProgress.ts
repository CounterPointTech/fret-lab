import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  deleteLessonProgress,
  listLearnProgress,
  putLessonProgress,
  type LessonProgress,
} from '../lib/api'
import type { CourseMeta } from './types'

/**
 * Lesson-completion state for the Learn area. Fetches once, then keeps an
 * optimistic local map — a failed write rolls back and logs.
 */
export function useLearnProgress() {
  const [byLesson, setByLesson] = useState<Map<string, LessonProgress> | null>(null)

  useEffect(() => {
    let cancelled = false
    listLearnProgress()
      .then(({ progress }) => {
        if (cancelled) return
        setByLesson(new Map(progress.map((p) => [p.lesson_id, p])))
      })
      .catch((err: unknown) => {
        console.error('failed to load learn progress', err)
        if (!cancelled) setByLesson(new Map())
      })
    return () => {
      cancelled = true
    }
  }, [])

  const complete = useCallback(
    (lessonId: string, quiz?: { quiz_correct: number; quiz_total: number }) => {
      setByLesson((prev) => {
        const next = new Map(prev ?? [])
        next.set(lessonId, {
          id: prev?.get(lessonId)?.id ?? -1,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          quiz_correct: quiz?.quiz_correct ?? null,
          quiz_total: quiz?.quiz_total ?? null,
        })
        return next
      })
      putLessonProgress(lessonId, quiz)
        .then(({ progress }) => {
          setByLesson((prev) => {
            const next = new Map(prev ?? [])
            next.set(lessonId, progress)
            return next
          })
        })
        .catch((err: unknown) => {
          console.error('failed to save lesson progress', err)
          setByLesson((prev) => {
            const next = new Map(prev ?? [])
            next.delete(lessonId)
            return next
          })
        })
    },
    [],
  )

  const uncomplete = useCallback((lessonId: string) => {
    let removed: LessonProgress | undefined
    setByLesson((prev) => {
      removed = prev?.get(lessonId)
      const next = new Map(prev ?? [])
      next.delete(lessonId)
      return next
    })
    deleteLessonProgress(lessonId).catch((err: unknown) => {
      console.error('failed to clear lesson progress', err)
      setByLesson((prev) => {
        if (!removed) return prev
        const next = new Map(prev ?? [])
        next.set(removed.lesson_id, removed)
        return next
      })
    })
  }, [])

  const coursePercent = useCallback(
    (meta: CourseMeta): number => {
      if (!byLesson || meta.lessonIds.length === 0) return 0
      const done = meta.lessonIds.filter((id) => byLesson.has(id)).length
      return done / meta.lessonIds.length
    },
    [byLesson],
  )

  return useMemo(
    () => ({
      loaded: byLesson != null,
      byLesson: byLesson ?? new Map<string, LessonProgress>(),
      complete,
      uncomplete,
      coursePercent,
    }),
    [byLesson, complete, uncomplete, coursePercent],
  )
}

/** First incomplete lesson of the most recently practiced course, for the
 * catalog's "continue" banner. Falls back to the very first lesson. */
export function continueTarget(
  courses: CourseMeta[],
  byLesson: Map<string, LessonProgress>,
): { course: CourseMeta; lessonId: string } | null {
  let recentCourse: CourseMeta | null = null
  let recentTime = ''
  for (const course of courses) {
    for (const id of course.lessonIds) {
      const p = byLesson.get(id)
      if (p?.completed_at && p.completed_at > recentTime) {
        recentTime = p.completed_at
        recentCourse = course
      }
    }
  }
  const ordered = recentCourse
    ? [recentCourse, ...courses.filter((c) => c !== recentCourse)]
    : courses
  for (const course of ordered) {
    const next = course.lessonIds.find((id) => !byLesson.has(id))
    if (next) return { course, lessonId: next }
  }
  return null
}
