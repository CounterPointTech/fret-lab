import { Link } from 'react-router-dom'

import { CourseCard } from '../learn/components/CourseCard'
import { COURSES } from '../learn/content'
import { continueTarget, useLearnProgress } from '../learn/useLearnProgress'

export function LearnCatalogPage() {
  const progress = useLearnProgress()
  const next = progress.loaded ? continueTarget(COURSES, progress.byLesson) : null
  const totalLessons = COURSES.reduce((n, c) => n + c.lessonIds.length, 0)
  const doneLessons = COURSES.reduce(
    (n, c) => n + c.lessonIds.filter((id) => progress.byLesson.has(id)).length,
    0,
  )

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4 py-10">
        <div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight">
            Learn <span className="text-amp-400">guitar theory</span>
          </h1>
          <p className="mt-2 max-w-xl text-stage-300">
            A guided path from the musical alphabet to composing your own solos — shapes first,
            names second, and everything applied over real songs from your library.
          </p>
        </div>
        {doneLessons > 0 && (
          <span className="chip">{doneLessons}/{totalLessons} lessons complete</span>
        )}
      </header>

      {next && (
        <Link
          to={`/learn/${next.course.id}/${next.lessonId}`}
          className="animate-rise panel mb-8 flex items-center gap-4 border-amp-500/30 p-4 transition hover:border-amp-500/60 hover:shadow-glow-sm"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amp-500 text-stage-950 shadow-glow-sm">
            <svg viewBox="0 0 16 16" className="ml-0.5 h-4 w-4 fill-current">
              <path d="M4 2.5v11a1 1 0 0 0 1.52.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="section-label">
              {doneLessons > 0 ? 'Continue' : 'Start here'}
            </span>
            <span className="mt-0.5 block truncate font-semibold text-stage-100">
              {next.course.title}
            </span>
          </span>
          <span className="ml-auto font-mono text-xs text-amp-300">
            lesson {next.course.lessonIds.indexOf(next.lessonId) + 1}/{next.course.lessonIds.length} →
          </span>
        </Link>
      )}

      <div className="flex flex-col gap-4">
        {COURSES.map((meta, i) => (
          <CourseCard key={meta.id} meta={meta} index={i} fraction={progress.coursePercent(meta)} />
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/learn/tools"
          className="animate-rise panel p-5 transition hover:border-amp-500/40 hover:shadow-glow-sm"
        >
          <h2 className="font-display text-lg font-bold text-stage-100">Theory Tools</h2>
          <p className="mt-1 text-sm text-stage-400">
            Interactive fretboard — scales, CAGED boxes, chord voicings, circle of fifths,
            metronome. The sandbox behind every lesson diagram.
          </p>
        </Link>
        <Link
          to="/learn/reference"
          className="animate-rise panel p-5 transition hover:border-amp-500/40 hover:shadow-glow-sm"
        >
          <h2 className="font-display text-lg font-bold text-stage-100">Reference</h2>
          <p className="mt-1 text-sm text-stage-400">
            Cheat sheets: intervals, every key signature, chord formulas, and the modes at a
            glance.
          </p>
        </Link>
      </div>
    </div>
  )
}
