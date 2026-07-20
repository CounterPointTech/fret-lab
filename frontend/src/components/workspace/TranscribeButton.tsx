/**
 * Per-stem "Transcribe" control: a settings popover (tuning, capo, Basic
 * Pitch thresholds) that kicks off a transcribe job and shows SSE progress
 * inline. On completion the new AI draft is handed up so the tab panel can
 * select it.
 */
import { useEffect, useRef, useState } from 'react'

import { useJobEvents } from '../../hooks/useJobEvents'
import { listTranscriptions, transcribeStem, type Transcription } from '../../lib/api'
import { useToast } from '../Toasts'

const TUNING_OPTIONS = [
  { value: 'standard', label: 'E standard' },
  { value: 'drop_d', label: 'Drop D' },
  { value: 'eb_standard', label: 'E♭ standard' },
  { value: 'bass_standard', label: 'Bass (EADG)' },
]

const STAGE_LABELS: Record<string, string> = {
  detect: 'Detecting notes…',
  beats: 'Finding the beat…',
  frets: 'Assigning frets…',
  write: 'Writing tab…',
  done: 'Done',
}

interface Props {
  videoId: string
  stem: string
  onCreated: (t: Transcription) => void
}

export function TranscribeButton({ videoId, stem, onCreated }: Props) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [tuning, setTuning] = useState(stem === 'bass' ? 'bass_standard' : 'standard')
  const [capo, setCapo] = useState(0)
  const [onset, setOnset] = useState(0.5)
  const [frame, setFrame] = useState(0.3)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!popoverRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const event = useJobEvents(jobId, (ev) => {
    setJobId(null)
    if (ev.status === 'done') {
      listTranscriptions(videoId)
        .then((data) => {
          const drafts = data.transcriptions.filter((t) => t.source === 'generated')
          const newest = drafts[drafts.length - 1]
          if (newest) {
            onCreated(newest)
            toast('info', `AI draft ready for ${stem} — it's a starting point, expect mistakes`)
          }
        })
        .catch((err: unknown) =>
          toast('error', `Draft finished but could not load it: ${err instanceof Error ? err.message : err}`),
        )
    } else if (ev.status === 'error') {
      toast('error', `Transcription failed: ${ev.error ?? 'unknown error'}`)
    }
  })

  async function start() {
    setOpen(false)
    try {
      const res = await transcribeStem(videoId, {
        stem,
        tuning,
        capo,
        onset_threshold: onset,
        frame_threshold: frame,
      })
      if (res.already_running) toast('info', 'A transcription is already running for this song')
      setJobId(res.job_id)
    } catch (err) {
      toast('error', `Could not start transcription: ${err instanceof Error ? err.message : err}`)
    }
  }

  const running = jobId != null
  const progress = event ? Math.round(event.progress * 100) : 0
  const stageLabel = event?.stage ? (STAGE_LABELS[event.stage] ?? event.stage) : 'Queued…'

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      <button
        onClick={() => (running ? undefined : setOpen((o) => !o))}
        disabled={running}
        title={running ? stageLabel : `Transcribe the ${stem} stem to tab (AI draft)`}
        className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold transition ${
          running
            ? 'animate-glow-pulse bg-stage-700/70 text-amp-300'
            : 'bg-stage-700/70 text-stage-300 hover:bg-stage-700 hover:text-amp-300'
        }`}
      >
        {running ? `${stageLabel} ${progress}%` : '✎ Tab'}
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-64 rounded-xl border border-stage-700 bg-stage-900 p-3 shadow-xl shadow-black/40">
          <p className="font-mono text-[10px] uppercase tracking-widest text-stage-500">
            AI transcription — {stem}
          </p>
          <label className="mt-2 flex items-center justify-between gap-2 text-xs text-stage-300">
            Tuning
            <select
              value={tuning}
              onChange={(e) => setTuning(e.target.value)}
              className="rounded-md border border-stage-700 bg-stage-800 px-1.5 py-1 font-mono text-xs text-stage-100"
            >
              {TUNING_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-2 flex items-center justify-between gap-2 text-xs text-stage-300">
            Capo
            <input
              type="number"
              min={0}
              max={12}
              value={capo}
              onChange={(e) => setCapo(Math.max(0, Math.min(12, Number(e.target.value))))}
              className="w-14 rounded-md border border-stage-700 bg-stage-800 px-1.5 py-1 font-mono text-xs text-stage-100"
            />
          </label>
          <label className="mt-2 block text-xs text-stage-300">
            <span className="flex justify-between">
              Note sensitivity <span className="font-mono text-stage-100">{onset.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={onset}
              onChange={(e) => setOnset(Number(e.target.value))}
              title="Basic Pitch onset threshold — lower catches more (and noisier) notes"
              className="mt-1 w-full accent-amp-500"
            />
          </label>
          <label className="mt-1 block text-xs text-stage-300">
            <span className="flex justify-between">
              Sustain sensitivity <span className="font-mono text-stage-100">{frame.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={frame}
              onChange={(e) => setFrame(Number(e.target.value))}
              title="Basic Pitch frame threshold — lower holds notes longer"
              className="mt-1 w-full accent-amp-500"
            />
          </label>
          <button
            onClick={() => void start()}
            className="mt-3 w-full rounded-lg bg-amp-500 px-3 py-1.5 font-mono text-xs font-bold text-stage-950 transition hover:bg-amp-400"
          >
            Transcribe → AI draft
          </button>
          <p className="mt-2 text-[10px] leading-snug text-stage-500">
            Draft quality ≈ 80% on clean stems, worse on distortion. You'll fix it
            in the editor.
          </p>
        </div>
      )}
    </div>
  )
}
