import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useJobEvents } from '../hooks/useJobEvents'
import { formatDuration, type JobEvent, type Song } from '../lib/api'

interface Props {
  song: Song
  index: number
  onJobFinished: (event: JobEvent) => void
  onDelete: (videoId: string) => void
  onSeparate: (videoId: string) => void
}

const STAGE_LABELS: Record<string, string> = {
  download: 'downloading',
  convert: 'converting',
  cached: 'cached',
  done: 'finishing',
  'model-download': 'downloading model…',
  vocals: 'isolating vocals…',
  instruments: 'splitting instruments…',
  encode: 'encoding…',
  peaks: 'computing waveforms…',
}

export function SongCard({ song, index, onJobFinished, onDelete, onSeparate }: Props) {
  const [confirming, setConfirming] = useState(false)
  const jobEvent = useJobEvents(song.active_job_id, onJobFinished)

  const inProgress = song.active_job_id != null
  const progress = jobEvent?.progress ?? 0
  const stage = jobEvent?.stage ? (STAGE_LABELS[jobEvent.stage] ?? jobEvent.stage) : 'queued'
  const failed = song.status === 'error'
  const practicable = song.status === 'ready' && song.stem_count >= 6

  const card = (
    <article
      className="group animate-rise panel relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-amp-500/40 hover:shadow-glow-sm"
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
        {/* settle the thumbnail into the card */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stage-925/90 via-transparent to-stage-950/30" />

        {practicable && !inProgress && (
          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-amp-500 text-stage-950 shadow-glow">
              <svg viewBox="0 0 16 16" className="ml-0.5 h-6 w-6 fill-current">
                <path d="M4 2.5v11a1 1 0 0 0 1.52.86l9-5.5a1 1 0 0 0 0-1.72l-9-5.5A1 1 0 0 0 4 2.5z" />
              </svg>
            </span>
          </div>
        )}

        {inProgress && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
            <span className="animate-glow-pulse font-mono text-xs uppercase tracking-widest text-amp-300">
              {stage} {Math.round(progress * 100)}%
            </span>
            <div className="progress-track w-2/3">
              <div className="progress-fill" style={{ width: `${Math.max(progress * 100, 2)}%` }} />
            </div>
          </div>
        )}

        <span className="absolute bottom-2 right-2 rounded-md bg-stage-950/80 px-1.5 py-0.5 font-mono text-[11px] text-stage-200 backdrop-blur-sm">
          {formatDuration(song.duration_s)}
        </span>

        <StatusBadge song={song} inProgress={inProgress} />
      </div>

      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight text-stage-100" title={song.title}>
            {song.title}
          </h3>
          <p className="mt-1 truncate text-sm text-stage-400">{song.channel ?? 'Unknown channel'}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 empty:hidden">
            {song.key_name && <span className="chip">{song.key_name}</span>}
            {song.bpm != null && <span className="chip-quiet">{Math.round(song.bpm)} bpm</span>}
            {practicable && (
              <span className="chip-quiet" title="6 separated stems ready">
                <StemIcon /> 6 stems
              </span>
            )}
          </div>

          {failed && song.last_error && (
            <p className="mt-2 line-clamp-3 text-xs text-rose-400/90" title={song.last_error}>
              {song.last_error}
            </p>
          )}

          {song.status === 'ready' && !inProgress && !practicable && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onSeparate(song.video_id)
              }}
              className="btn-outline mt-3 px-3 py-1.5 text-xs"
            >
              <StemIcon />
              Separate stems
            </button>
          )}
        </div>

        {confirming ? (
          <div className="z-10 flex shrink-0 gap-1">
            <button
              onClick={(e) => {
                e.preventDefault()
                onDelete(song.video_id)
              }}
              className="rounded-md bg-rose-600/90 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500"
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                setConfirming(false)
              }}
              className="btn-quiet px-2 py-1"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault()
              setConfirming(true)
            }}
            aria-label={`Remove ${song.title}`}
            className="z-10 shrink-0 rounded-md p-1 text-stage-500 opacity-0 transition group-hover:opacity-100 hover:text-rose-400 focus-visible:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </button>
        )}
      </div>
    </article>
  )

  // The whole card opens the song when it's ready to practice.
  return practicable && !confirming ? (
    <Link to={`/songs/${song.video_id}`} className="block rounded-2xl">
      {card}
    </Link>
  ) : (
    card
  )
}

function StemIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M4 5v14M9 8v8M14 3v18M19 9v6" />
    </svg>
  )
}

function StatusBadge({ song, inProgress }: { song: Song; inProgress: boolean }) {
  if (inProgress) return null
  if (song.status === 'ready') {
    return (
      <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-stage-950/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-stage-200 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-amp-400 shadow-glow-sm" />
        ready
      </span>
    )
  }
  const styles: Record<string, string> = {
    error: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    queued: 'bg-stage-950/70 text-stage-300',
    downloading: 'bg-amp-500/15 text-amp-300 border border-amp-500/30',
  }
  return (
    <span
      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${styles[song.status] ?? styles.queued}`}
    >
      {song.status}
    </span>
  )
}
