import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useJobEvents } from '../../hooks/useJobEvents'
import { analyzeSong } from '../../lib/api'
import type { StemPlayerApi } from '../../hooks/useStemPlayer'
import {
  chordAtTime,
  displayChordLabel,
  keyPrefersFlats,
  transposeChordLabel,
  type ChordsPayload,
} from '../../theory/chords'
import { useToast } from '../Toasts'

interface Props {
  videoId: string
  api: StemPlayerApi
  /** lifts the loaded analysis so JamPanel can share it */
  onLoaded: (payload: ChordsPayload | null) => void
}

const PX_PER_SECOND = 24

/**
 * Chord timeline lane synced to playback: fetches analysis/chords.json
 * (offering the analyze job when it doesn't exist yet), highlights the
 * sounding chord, auto-scrolls, seeks on click. Labels follow the
 * pitch-shift setting so what you read matches what you hear.
 */
export function ChordSection({ videoId, api, onLoaded }: Props) {
  const [payload, setPayload] = useState<ChordsPayload | null>(null)
  const [missing, setMissing] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState(-1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const fetchChords = useCallback(async () => {
    try {
      const resp = await fetch(`/api/media/${videoId}/analysis/chords.json`)
      if (resp.status === 404) {
        setMissing(true)
        return
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = (await resp.json()) as ChordsPayload
      setPayload(data)
      setMissing(false)
      onLoaded(data)
    } catch (err) {
      setMissing(true)
      console.error('failed to load chord analysis', err)
    }
  }, [videoId, onLoaded])

  useEffect(() => {
    void fetchChords()
  }, [fetchChords])

  useJobEvents(jobId, (event) => {
    setJobId(null)
    if (event.status === 'done') void fetchChords()
    else if (event.error) toast('error', `Chord analysis failed: ${event.error}`)
  })

  async function startAnalysis() {
    try {
      const { job_id } = await analyzeSong(videoId)
      setJobId(job_id)
    } catch (err) {
      toast('error', `Could not start analysis: ${err instanceof Error ? err.message : err}`)
    }
  }

  // Track the sounding chord at tick rate; re-render only on span change.
  const spans = payload?.chords
  useEffect(() => {
    const player = api.player
    if (!player || !spans) return
    let lastIdx = -1
    return player.onTick((pos) => {
      const span = chordAtTime(spans, pos)
      const idx = span ? spans.indexOf(span) : -1
      if (idx !== lastIdx) {
        lastIdx = idx
        setCurrentIdx(idx)
      }
    })
  }, [api.player, spans])

  // keep the sounding chord in view
  useEffect(() => {
    if (currentIdx < 0) return
    const el = scrollRef.current?.querySelector<HTMLElement>(`[data-idx="${currentIdx}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [currentIdx])

  const preferFlats = useMemo(() => keyPrefersFlats(payload?.key ?? null), [payload])
  const pitch = api.pitch

  if (missing) {
    return (
      <div className="flex items-center gap-4 border-b border-stage-800 px-5 py-3">
        <p className="text-sm text-stage-300">
          No chord analysis yet — detect the chord progression and key of this song.
        </p>
        {jobId ? (
          <span className="animate-glow-pulse font-mono text-xs uppercase tracking-widest text-amp-300">
            Analyzing…
          </span>
        ) : (
          <button onClick={startAnalysis} className="btn-outline px-3 py-1.5 font-mono text-sm">
            Analyze chords
          </button>
        )}
      </div>
    )
  }

  if (!payload) return null

  const current = currentIdx >= 0 ? payload.chords[currentIdx] : null
  const shiftLabel = (label: string) =>
    displayChordLabel(transposeChordLabel(label, pitch), preferFlats)

  return (
    <div data-testid="chord-timeline" className="border-b border-stage-800 px-4 pb-1 pt-3">
      <div className="mb-2 flex flex-wrap items-center gap-3 px-1">
        <span className="section-label">Chords</span>
        {payload.key && (
          <Link
            to={`/theory?key=${encodeURIComponent(payload.key.name)}&song=${videoId}`}
            title="Open in Theory Lab"
            className="chip transition hover:bg-amp-500/20"
          >
            key: {payload.key.name}
          </Link>
        )}
        {payload.bpm != null && (
          <span className="font-mono text-xs text-stage-500">≈{Math.round(payload.bpm)} bpm</span>
        )}
        {pitch !== 0 && <span className="chip-quiet">transposed {pitch > 0 ? '+' : ''}{pitch} st</span>}
        <span
          data-testid="current-chord"
          className="ml-auto min-w-16 text-right font-display text-xl font-extrabold text-amp-300"
        >
          {current && current.label !== 'N' ? shiftLabel(current.label) : '—'}
        </span>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-1.5">
        <div className="flex h-10 overflow-hidden rounded-lg" style={{ width: payload.duration * PX_PER_SECOND }}>
          {payload.chords.map((span, i) => {
            const isCurrent = i === currentIdx
            const silent = span.label === 'N'
            return (
              <button
                key={i}
                data-idx={i}
                onClick={() => api.seek(span.start)}
                title={`${shiftLabel(span.label)} @ ${span.start.toFixed(1)}s`}
                style={{ width: (span.end - span.start) * PX_PER_SECOND }}
                className={`shrink-0 truncate border-r border-stage-950/80 font-mono text-sm transition-colors ${
                  isCurrent
                    ? 'bg-amp-500 font-bold text-stage-950 shadow-glow-sm'
                    : silent
                      ? 'bg-stage-950/40 text-stage-700'
                      : 'bg-stage-800/90 text-stage-300 hover:bg-stage-700'
                }`}
              >
                {silent ? '' : shiftLabel(span.label)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
