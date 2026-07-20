import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useToast } from '../components/Toasts'
import { PracticeWorkspace } from '../components/workspace/PracticeWorkspace'
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
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <header className="animate-rise flex items-center gap-5 pt-8">
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
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-stage-300">
            {song.channel ?? 'Unknown channel'}
            <span className="text-stage-500">·</span>
            <span className="font-mono text-sm">{formatDuration(song.duration_s)}</span>
            {song.key_name && (
              <Link
                to={`/learn/tools?key=${encodeURIComponent(song.key_name)}&song=${song.video_id}`}
                title="Open in Theory Tools"
                className="chip transition hover:bg-amp-500/20"
              >
                {song.key_name}
              </Link>
            )}
          </p>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="section-label">Practice</h2>

        {separating ? (
          <div className="animate-rise panel mt-4 p-6">
            <p className="animate-glow-pulse font-mono text-sm uppercase tracking-widest text-amp-300">
              {stageLabel} {Math.round(progress * 100)}%
            </p>
            <div className="progress-track mt-3">
              <div className="progress-fill" style={{ width: `${Math.max(progress * 100, 2)}%` }} />
            </div>
          </div>
        ) : stems.length > 0 ? (
          <PracticeWorkspace videoId={song.video_id} stems={stems} />
        ) : song.status === 'ready' ? (
          <div className="animate-rise panel mt-4 flex flex-col items-start gap-3 p-6">
            <p className="text-stage-300">
              No stems yet — separate this song into vocals, drums, bass, guitar, piano and other.
            </p>
            <button onClick={handleSeparate} className="btn-accent">
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
