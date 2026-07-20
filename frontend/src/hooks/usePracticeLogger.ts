import { useEffect, useRef } from 'react'

import { logPracticeSession, type PracticeLoop } from '../lib/api'
import type { StemPlayerApi } from './useStemPlayer'

interface SessionDraft {
  startedAt: string | null
  playSeconds: number
  maxRate: number
  /** keyed by rounded loop bounds so drag-nudges don't fragment sections */
  loops: Map<string, PracticeLoop>
  playingSince: number | null
  flushed: boolean
}

function loopKey(a: number, b: number): string {
  return `${a.toFixed(1)}:${b.toFixed(1)}`
}

function loopEntry(draft: SessionDraft, loop: { a: number; b: number }): PracticeLoop {
  const key = loopKey(loop.a, loop.b)
  let entry = draft.loops.get(key)
  if (!entry) {
    entry = { a: loop.a, b: loop.b, max_rate: 0, plays: 0 }
    draft.loops.set(key, entry)
  }
  return entry
}

/**
 * Silently records a practice session while the workspace is open: seconds
 * actually played, top speed reached, and per-loop-section pass counts.
 * Flushed once — to the API on unmount, via sendBeacon if the tab closes.
 * Sessions under 5 played seconds are noise and are dropped.
 */
export function usePracticeLogger(videoId: string, api: StemPlayerApi): void {
  const draftRef = useRef<SessionDraft>({
    startedAt: null,
    playSeconds: 0,
    maxRate: 0,
    loops: new Map(),
    playingSince: null,
    flushed: false,
  })
  const stateRef = useRef({ rate: api.rate, loop: api.loop })
  stateRef.current = { rate: api.rate, loop: api.loop }

  // the play clock: starts/stops ONLY on playing transitions — rate/loop
  // changes must not touch it or elapsed time silently resets
  useEffect(() => {
    const d = draftRef.current
    if (api.playing) {
      if (d.playingSince == null) d.playingSince = performance.now()
      d.startedAt ??= new Date().toISOString()
    } else if (d.playingSince != null) {
      d.playSeconds += (performance.now() - d.playingSince) / 1000
      d.playingSince = null
    }
  }, [api.playing])

  // top speed (overall and per loop section) while actually playing
  useEffect(() => {
    if (!api.playing) return
    const d = draftRef.current
    d.maxRate = Math.max(d.maxRate, api.rate)
    if (api.loop) {
      const entry = loopEntry(d, api.loop)
      entry.max_rate = Math.max(entry.max_rate, api.rate)
    }
  }, [api.playing, api.rate, api.loop])

  // each completed loop pass counts toward that section
  useEffect(() => {
    return api.onLoopWrap(() => {
      const { rate, loop } = stateRef.current
      if (!loop) return
      const entry = loopEntry(draftRef.current, loop)
      entry.plays += 1
      entry.max_rate = Math.max(entry.max_rate, rate)
    })
  }, [api.onLoopWrap])

  useEffect(() => {
    function flush(useBeacon: boolean) {
      const d = draftRef.current
      if (d.playingSince != null) {
        d.playSeconds += (performance.now() - d.playingSince) / 1000
        d.playingSince = performance.now()
      }
      if (d.flushed || d.playSeconds < 5 || !d.startedAt) return
      d.flushed = true
      const payload = {
        started_at: d.startedAt,
        play_seconds: Math.round(d.playSeconds * 10) / 10,
        max_rate: d.maxRate || 1,
        loops: [...d.loops.values()].map((l) => ({ ...l, max_rate: l.max_rate || 1 })),
      }
      if (useBeacon) {
        navigator.sendBeacon(
          `/api/songs/${videoId}/practice-sessions`,
          new Blob([JSON.stringify(payload)], { type: 'application/json' }),
        )
      } else {
        logPracticeSession(videoId, payload).catch((err: unknown) => {
          console.error('failed to log practice session', err)
        })
      }
    }

    const onPageHide = () => flush(true)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      flush(false)
    }
  }, [videoId])
}
