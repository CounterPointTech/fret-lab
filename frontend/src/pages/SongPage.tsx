import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useToast } from '../components/Toasts'
import { useJobEvents } from '../hooks/useJobEvents'
import { formatDuration, getSong, separateSong, type Song, type Stem } from '../lib/api'

const STAGE_LABELS: Record<string, string> = {
  'model-download': 'Downloading AI models…',
  vocals: 'Isolating vocals…',
  instruments: 'Splitting instruments…',
  encode: 'Encoding…',
  peaks: 'Computing waveforms…',
  cached: 'Loading from cache…',
  done: 'Finishing…',
}

const STEM_STYLE: Record<string, { label: string; accent: string }> = {
  vocals: { label: 'Vocals', accent: 'bg-rose-400' },
  drums: { label: 'Drums', accent: 'bg-orange-400' },
  bass: { label: 'Bass', accent: 'bg-violet-400' },
  guitar: { label: 'Guitar', accent: 'bg-amp-400' },
  piano: { label: 'Piano', accent: 'bg-sky-400' },
  other: { label: 'Other', accent: 'bg-emerald-400' },
}

export function SongPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const [song, setSong] = useState<Song | null>(null)
  const [stems, setStems] = useState<Stem[]>([])
  const [notFound, setNotFound] = useState(false)
  const toast = useToast()

  const refresh = useCallback(async () => {
    if (!videoId) return
    try {
      const data = await getSong(videoId)
      setSong(data.song)
      setStems(data.stems)
    } catch (err) {
      setNotFound(true)
      toast('error', `Could not load song: ${err instanceof Error ? err.message : err}`)
    }
  }, [videoId, toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const jobEvent = useJobEvents(song?.active_job_id ?? null, (event) => {
    if (event.status === 'error' && event.error) toast('error', event.error)
    void refresh()
  })

  async function handleSeparate() {
    if (!videoId) return
    try {
      await separateSong(videoId)
      await refresh()
    } catch (err) {
      toast('error', `Could not start separation: ${err instanceof Error ? err.message : err}`)
    }
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-stage-300">Song not found.</p>
        <Link to="/" className="mt-4 inline-block text-amp-300 hover:text-amp-400">
          ← Back to library
        </Link>
      </div>
    )
  }
  if (!song) {
    return <p className="py-24 text-center text-stage-500">Loading…</p>
  }

  const separating = song.active_job_id != null
  const progress = jobEvent?.progress ?? 0
  const stageLabel = jobEvent?.stage
    ? (STAGE_LABELS[jobEvent.stage] ?? jobEvent.stage)
    : 'Queued…'

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24">
      <nav className="py-6">
        <Link
          to="/"
          className="font-mono text-sm text-stage-300 transition hover:text-amp-300"
        >
          ← Library
        </Link>
      </nav>

      <header className="animate-rise flex items-center gap-5">
        {song.thumbnail_url && (
          <img
            src={song.thumbnail_url}
            alt=""
            className="h-24 w-40 shrink-0 rounded-xl border border-stage-700/60 object-cover shadow-lg shadow-black/40"
          />
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-stage-100">
            {song.title}
          </h1>
          <p className="mt-1 text-stage-300">
            {song.channel ?? 'Unknown channel'}
            <span className="mx-2 text-stage-500">·</span>
            <span className="font-mono text-sm">{formatDuration(song.duration_s)}</span>
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-stage-500">Stems</h2>

        {separating ? (
          <div className="animate-rise mt-4 rounded-xl border border-stage-700/60 bg-stage-900/80 p-6">
            <p className="animate-glow-pulse font-mono text-sm uppercase tracking-widest text-amp-300">
              {stageLabel} {Math.round(progress * 100)}%
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stage-700">
              <div
                className="h-full rounded-full bg-amp-400 transition-[width] duration-300"
                style={{ width: `${Math.max(progress * 100, 2)}%` }}
              />
            </div>
          </div>
        ) : stems.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {stems.map((stem, i) => {
              const style = STEM_STYLE[stem.name] ?? { label: stem.name, accent: 'bg-stage-500' }
              return (
                <li
                  key={stem.id}
                  className="animate-rise flex items-center gap-4 rounded-xl border border-stage-700/60 bg-stage-900/80 px-5 py-4 shadow-lg shadow-black/30"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.accent}`} />
                  <span className="w-20 shrink-0 font-mono text-sm font-semibold uppercase tracking-wider text-stage-100">
                    {style.label}
                  </span>
                  <audio controls preload="metadata" src={stem.audio_url} className="h-10 w-full" />
                </li>
              )
            })}
          </ul>
        ) : song.status === 'ready' ? (
          <div className="animate-rise mt-4 flex flex-col items-start gap-3 rounded-xl border border-dashed border-stage-700 p-6">
            <p className="text-stage-300">
              No stems yet — separate this song into vocals, drums, bass, guitar, piano and other.
            </p>
            <button
              onClick={handleSeparate}
              className="rounded-xl bg-amp-500 px-5 py-2.5 font-bold text-stage-950 shadow-lg shadow-amp-500/20 transition hover:bg-amp-400"
            >
              Separate stems
            </button>
          </div>
        ) : (
          <p className="mt-4 text-stage-300">
            The song audio isn’t ready yet (status: {song.status}).
          </p>
        )}
      </section>
    </div>
  )
}
