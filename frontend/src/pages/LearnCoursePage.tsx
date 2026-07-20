import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { courseMeta } from '../learn/content'
import { useLearnProgress } from '../learn/useLearnProgress'
import type { Course } from '../learn/types'

export function LearnCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const meta = courseId ? courseMeta(courseId) : undefined
  const [course, setCourse] = useState<Course | null>(null)
  const progress = useLearnProgress()

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

  const done = meta.lessonIds.filter((id) => progress.byLesson.has(id)).length
  const fraction = meta.lessonIds.length ? done / meta.lessonIds.length : 0
  let lessonNumber = 0

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <nav className="pt-6 font-mono text-sm">
        <Link to="/learn" className="text-stage-300 transition hover:text-amp-300">
          ← All courses
        </Link>
      </nav>

      <header className="animate-rise pt-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-stage-100">
          {meta.title}
        </h1>
        <p className="mt-2 text-stage-300">{meta.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="progress-track w-48">
            <div className="progress-fill" style={{ width: `${fraction * 100}%` }} />
          </div>
          <span className="font-mono text-xs text-stage-400">
            {done}/{meta.lessonIds.length} lessons
          </span>
        </div>
      </header>

      {!course ? (
        <div className="mt-8 flex flex-col gap-3">
          {meta.lessonIds.map((id) => (
            <div key={id} className="skeleton h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {course.modules.map((module) => (
            <section key={module.title}>
              <h2 className="section-label">{module.title}</h2>
              <ol className="mt-3 flex flex-col gap-2">
                {module.lessons.map((lesson) => {
                  lessonNumber += 1
                  const completed = progress.byLesson.get(lesson.id)
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={`/learn/${meta.id}/${lesson.id}`}
                        className="panel group flex items-center gap-4 px-4 py-3 transition hover:border-amp-500/40"
                      >
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs ${
                            completed
                              ? 'bg-amp-500 font-bold text-stage-950'
                              : 'border border-stage-600 text-stage-400'
                          }`}
                        >
                          {completed ? '✓' : lessonNumber}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-stage-100 transition group-hover:text-amp-200">
                            {lesson.title}
                          </span>
                          <span className="block truncate text-sm text-stage-400">
                            {lesson.synopsis}
                          </span>
                        </span>
                        {completed?.quiz_total != null && (
                          <span className="ml-auto shrink-0 font-mono text-xs text-stage-500">
                            quiz {completed.quiz_correct}/{completed.quiz_total}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
