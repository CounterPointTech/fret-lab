import { Link } from 'react-router-dom'

import type { CourseMeta } from '../types'
import { ProgressRing } from './ProgressRing'

interface Props {
  meta: CourseMeta
  index: number
  /** 0..1 completion. */
  fraction: number
}

export function CourseCard({ meta, index, fraction }: Props) {
  return (
    <Link
      to={`/learn/${meta.id}`}
      className="group animate-rise panel flex items-start gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amp-500/40 hover:shadow-glow-sm"
      style={{ animationDelay: `${Math.min(index * 50, 350)}ms` }}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amp-500/40 font-mono text-sm font-bold text-amp-300">
        {index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-bold leading-snug text-stage-100 transition group-hover:text-amp-200">
          {meta.title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-stage-400">
          {meta.description}
        </span>
        <span className="mt-2 block font-mono text-xs text-stage-500">
          {meta.lessonIds.length} lessons
        </span>
      </span>
      <ProgressRing fraction={fraction} />
    </Link>
  )
}
