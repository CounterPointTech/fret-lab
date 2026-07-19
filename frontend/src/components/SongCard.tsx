import { useState } from 'react'

import { useJobEvents } from '../hooks/useJobEvents'
import { formatDuration, type JobEvent, type Song } from '../lib/api'

interface Props {
  song: Song
  index: number
  onJobFinished: (event: JobEvent) => void
  onDelete: (videoId: string) => void
}

const STAGE_LABELS: Record<string, string> = {
  download: 'downloading',
  convert: 'converting',
  cached: 'cached',
  done: 'finishing',
}

export function SongCard({ song, index, onJobFinished, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)
  const jobEvent = useJobEvents(song.active_job_id, onJobFinished)

  const inProgress = song.active_job_id != null
  const progress = jobEvent?.progress ?? 0
  const stage = jobEvent?.stage ? (STAGE_LABELS[jobEvent.stage] ?? jobEvent.stage) : 'queued'
  const failed = song.status === 'error'

  return (
    <article
      className="group animate-rise relative overflow-hidden rounded-xl border border-stage-700/60 bg-stage-900/80 shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-1 hover:border-amp-500/50 hover:shadow-amp-500/10"
      style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
    >
      <div className="relative aspect-video overflow-hidden bg-stage-800">
        {song.thumbnail_url ? (
          <img
            src={song.thumbnail_url}
            alt=""
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              inProgress ? 'opacity-40 saturate-50' : failed ? 'opacity-30 grayscale' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-stage-500">♪</div>
        )}

        {inProgress && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="animate-glow-pulse font-mono text-xs uppercase tracking-widest text-amp-300">
              {stage} {Math.round(progress * 100)}%
            </span>
            <div className="h-1 w-2/3 overflow-hidden rounded-full bg-stage-700">
              <div
                className="h-full rounded-full bg-amp-400 transition-[width] duration-200"
                style={{ width: `${Math.max(progress * 100, 2)}%` }}
              />
            </div>
          </div>
        )}

        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] text-stage-100">
          {formatDuration(song.duration_s)}
        </span>

        <StatusBadge song={song} inProgress={inProgress} />
      </div>

      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold leading-tight text-stage-100" title={song.title}>
            {song.title}
          </h3>
          <p className="mt-1 truncate text-sm text-stage-300">{song.channel ?? 'Unknown channel'}</p>
          {failed && song.last_error && (
            <p className="mt-2 line-clamp-3 text-xs text-red-400/90" title={song.last_error}>
              {song.last_error}
            </p>
          )}
        </div>
        {confirming ? (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onDelete(song.video_id)}
              className="rounded bg-red-600/90 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded bg-stage-700 px-2 py-1 text-xs text-stage-100 hover:bg-stage-500"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${song.title}`}
            className="shrink-0 rounded p-1 text-stage-500 opacity-0 transition group-hover:opacity-100 hover:text-red-400 focus:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        )}
      </div>
    </article>
  )
}

function StatusBadge({ song, inProgress }: { song: Song; inProgress: boolean }) {
  if (inProgress) return null
  const styles: Record<Song['status'], string> = {
    ready: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    error: 'bg-red-500/15 text-red-300 border-red-500/30',
    queued: 'bg-stage-700/60 text-stage-300 border-stage-500/40',
    downloading: 'bg-amp-500/15 text-amp-300 border-amp-500/30',
  }
  return (
    <span
      className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${styles[song.status]}`}
    >
      {song.status}
    </span>
  )
}
