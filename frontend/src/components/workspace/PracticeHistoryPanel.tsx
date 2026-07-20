import { useEffect, useState } from 'react'

import {
  listPracticeSessions,
  type PracticeSession,
  type PracticeSummary,
} from '../../lib/api'

function fmtClock(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function fmtSpan(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.round((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${Math.round(totalSeconds)}s`
}

interface SectionGroup {
  a: number
  b: number
  firstRate: number
  bestRate: number
  plays: number
}

/** Merge loop sections across sessions when their ranges mostly overlap. */
function groupSections(sessions: PracticeSession[]): SectionGroup[] {
  const groups: SectionGroup[] = []
  // oldest first so firstRate is genuinely the starting speed
  for (const session of [...sessions].reverse()) {
    for (const loop of session.loops ?? []) {
      if (loop.plays === 0) continue
      const match = groups.find((g) => {
        const overlap = Math.min(g.b, loop.b) - Math.max(g.a, loop.a)
        return overlap > 0.5 * Math.min(g.b - g.a, loop.b - loop.a)
      })
      if (match) {
        match.bestRate = Math.max(match.bestRate, loop.max_rate)
        match.plays += loop.plays
      } else {
        groups.push({
          a: loop.a,
          b: loop.b,
          firstRate: loop.max_rate,
          bestRate: loop.max_rate,
          plays: loop.plays,
        })
      }
    }
  }
  return groups.sort((x, y) => y.plays - x.plays)
}

/**
 * Practice log: summary chips, per-section speed progression
 * ("this solo went 60% → 85%"), and the most recent sessions.
 */
export function PracticeHistoryPanel({ videoId }: { videoId: string }) {
  const [sessions, setSessions] = useState<PracticeSession[] | null>(null)
  const [summary, setSummary] = useState<PracticeSummary | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    listPracticeSessions(videoId)
      .then((data) => {
        if (cancelled) return
        setSessions(data.sessions)
        setSummary(data.summary)
      })
      .catch((err: unknown) => {
        console.error('failed to load practice history', err)
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [videoId])

  if (failed || sessions == null) return null

  if (sessions.length === 0) {
    return (
      <div className="panel px-5 py-4">
        <h3 className="section-label">Practice log</h3>
        <p className="mt-2 text-sm text-stage-400">
          Nothing logged yet — press play and Fret Lab keeps score: time practiced, sections
          looped, speeds reached.
        </p>
      </div>
    )
  }

  const sections = groupSections(sessions)

  return (
    <div className="panel px-5 py-4" data-testid="practice-history">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="section-label">Practice log</h3>
        {summary && (
          <>
            <span className="chip">{fmtSpan(summary.week_seconds)} this week</span>
            <span className="chip-quiet">{fmtSpan(summary.total_seconds)} total</span>
            <span className="chip-quiet">
              {summary.session_count} session{summary.session_count === 1 ? '' : 's'}
            </span>
          </>
        )}
      </div>

      {sections.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {sections.slice(0, 5).map((s) => {
            const improved = s.bestRate > s.firstRate + 0.001
            return (
              <li
                key={`${s.a}-${s.b}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-stage-900/60 px-3 py-2"
              >
                <span className="font-mono text-sm text-stage-200">
                  {fmtClock(s.a)}–{fmtClock(s.b)}
                </span>
                <span className="font-mono text-sm">
                  {improved ? (
                    <>
                      <span className="text-stage-400">{Math.round(s.firstRate * 100)}%</span>
                      <span className="mx-1.5 text-stage-500">→</span>
                      <span className="font-bold text-amp-300">{Math.round(s.bestRate * 100)}%</span>
                    </>
                  ) : (
                    <span className="text-stage-300">at {Math.round(s.bestRate * 100)}%</span>
                  )}
                </span>
                <span className="ml-auto font-mono text-xs text-stage-500">
                  {s.plays} pass{s.plays === 1 ? '' : 'es'}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <ul className="mt-4 flex flex-col gap-1 border-t border-stage-800 pt-3">
        {sessions.slice(0, 3).map((s) => (
          <li key={s.id} className="flex items-center gap-4 font-mono text-xs text-stage-400">
            <span>
              {s.started_at
                ? new Date(s.started_at).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : '—'}
            </span>
            <span>{fmtSpan(s.play_seconds)} played</span>
            <span className="ml-auto">top speed {Math.round(s.max_rate * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
