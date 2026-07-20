import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { LessonBlocks } from '../learn/components/LessonBlocks'
import { courseMeta } from '../learn/content'
import { useLearnProgress } from '../learn/useLearnProgress'
import type { Course, Lesson } from '../learn/types'

export function LearnLessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const meta = courseId ? courseMeta(courseId) : undefined
  const [course, setCourse] = useState<Course | null>(null)
  const progress = useLearnProgress()
  // last finished quiz score, attached when marking complete
  const quizRef = useRef<{ quiz_correct: number; quiz_total: number } | null>(null)

  useEffect(() => {
    if (!meta) return
    let cancelled = false
    meta
      .load()
      .then((c) => {
        if (!cancelled) setCourse(c)
      })
      .catch((err: unknown) => console.error('failed to load course', err))
    return () => {
      cancelled = true
    }
  }, [meta])

  // top of page when moving lesson to lesson
  useEffect(() => {
    window.scrollTo(0, 0)
    quizRef.current = null
  }, [lessonId])

  const lesson: Lesson | null = useMemo(() => {
    if (!course) return null
    for (const m of course.modules) {
      const found = m.lessons.find((l) => l.id === lessonId)
      if (found) return found
    }
    return null
  }, [course, lessonId])

  if (!meta) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-stage-300">Course not found.</p>
        <Link to="/learn" className="mt-4 inline-block text-amp-300 hover:text-amp-400">
          ← All courses
        </Link>
      </div>
    )
  }

  const idx = lessonId ? meta.lessonIds.indexOf(lessonId) : -1
  const prevId = idx > 0 ? meta.lessonIds[idx - 1] : null
  const nextId = idx >= 0 && idx < meta.lessonIds.length - 1 ? meta.lessonIds[idx + 1] : null
  const completed = lessonId ? progress.byLesson.get(lessonId) : undefined
  const hasQuiz = lesson?.blocks.some((b) => b.kind === 'quiz') ?? false

  function markComplete() {
    if (!lessonId) return
    progress.complete(lessonId, quizRef.current ?? undefined)
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <nav className="flex items-center justify-between pt-6 font-mono text-sm">
        <Link to={`/learn/${meta.id}`} className="text-stage-300 transition hover:text-amp-300">
          ← {meta.title}
        </Link>
        <span className="text-stage-500">
          {idx + 1} / {meta.lessonIds.length}
        </span>
      </nav>

      {!lesson ? (
        <div className="mt-8 flex flex-col gap-4">
          <div className="skeleton h-9 w-2/3" />
          <div className="skeleton h-40 w-full" />
          <div className="skeleton h-40 w-full" />
        </div>
      ) : (
        <>
          <header className="animate-rise pt-6">
            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-stage-100">
              {lesson.title}
            </h1>
            {completed && (
              <p className="mt-2 flex items-center gap-2 font-mono text-xs text-amp-300">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-amp-500 text-[10px] text-stage-950">
                  ✓
                </span>
                completed
                {completed.quiz_total != null && (
                  <span className="text-stage-400">
                    · quiz {completed.quiz_correct}/{completed.quiz_total}
                  </span>
                )}
                <button
                  onClick={() => lessonId && progress.uncomplete(lessonId)}
                  className="text-stage-500 underline-offset-2 hover:underline"
                >
                  reset
                </button>
              </p>
            )}
          </header>

          <div className="animate-rise mt-6">
            <LessonBlocks
              blocks={lesson.blocks}
              onQuizScore={(quiz_correct, quiz_total) => {
                quizRef.current = { quiz_correct, quiz_total }
                // finishing the quiz completes the lesson
                if (lessonId) progress.complete(lessonId, quizRef.current)
              }}
            />
          </div>

          <footer className="mt-10 flex items-center justify-between gap-4 border-t border-stage-800 pt-6">
            {prevId ? (
              <Link to={`/learn/${meta.id}/${prevId}`} className="btn-quiet">
                ← Previous
              </Link>
            ) : (
              <span />
            )}

            {!completed && !hasQuiz && (
              <button onClick={markComplete} className="btn-accent" data-testid="mark-complete">
                Mark complete
              </button>
            )}

            {nextId ? (
              <Link
                to={`/learn/${meta.id}/${nextId}`}
                className={completed ? 'btn-accent' : 'btn-quiet'}
              >
                Next lesson →
              </Link>
            ) : completed ? (
              <Link to="/learn" className="btn-accent">
                Course done — back to Learn 🎸
              </Link>
            ) : (
              <span />
            )}
          </footer>
        </>
      )}
    </div>
  )
}
