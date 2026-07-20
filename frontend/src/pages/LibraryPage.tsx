import { useCallback, useEffect, useState } from 'react'

import { SearchModal } from '../components/SearchModal'
import { SongCard } from '../components/SongCard'
import { useToast } from '../components/Toasts'
import { addSong, deleteSong, listSongs, separateSong, type JobEvent, type SearchResult, type Song } from '../lib/api'

export function LibraryPage() {
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const toast = useToast()

  const refresh = useCallback(async () => {
    try {
      const { songs } = await listSongs()
      setSongs(songs)
    } catch (err) {
      toast('error', `Could not load library: ${err instanceof Error ? err.message : err}`)
      setSongs([])
    }
  }, [toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handlePick(result: SearchResult) {
    setSearchOpen(false)
    try {
      const { job_id } = await addSong(result)
      if (job_id == null) {
        toast('info', `“${result.title}” is already in your library.`)
      }
      await refresh()
    } catch (err) {
      toast('error', `Could not add song: ${err instanceof Error ? err.message : err}`)
    }
  }

  function handleJobFinished(event: JobEvent) {
    if (event.status === 'error' && event.error) {
      toast('error', event.error)
    }
    void refresh()
  }

  async function handleSeparate(videoId: string) {
    try {
      await separateSong(videoId)
      await refresh() // pick up the new active job so the card streams progress
    } catch (err) {
      toast('error', `Could not start separation: ${err instanceof Error ? err.message : err}`)
    }
  }

  async function handleDelete(videoId: string) {
    try {
      await deleteSong(videoId)
      await refresh()
    } catch (err) {
      toast('error', `Could not delete: ${err instanceof Error ? err.message : err}`)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      <header className="flex items-end justify-between gap-4 py-10">
        <div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight">
            Your <span className="text-amp-400">library</span>
          </h1>
          <p className="mt-2 text-stage-300">Search, download, shred.</p>
        </div>
        <button onClick={() => setSearchOpen(true)} className="btn-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add song
        </button>
      </header>

      {songs == null ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel overflow-hidden">
              <div className="skeleton aspect-video rounded-none" />
              <div className="flex flex-col gap-2.5 p-4">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="animate-rise panel mt-10 flex flex-col items-center gap-6 px-8 py-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-amp-500/10 text-4xl shadow-glow-sm">
            🎸
          </span>
          <div>
            <h2 className="font-display text-3xl font-extrabold text-stage-100">
              Pick a song to learn
            </h2>
            <p className="mx-auto mt-2 max-w-md text-stage-300">
              Fret Lab turns any YouTube song into a practice room — isolated stems, slow-down
              playback, chords, and AI-drafted tab.
            </p>
          </div>

          <ol className="flex flex-col items-start gap-3 text-left sm:flex-row sm:items-center sm:gap-8">
            {['Search a song', 'Separate the stems', 'Practice & transcribe'].map((step, i) => (
              <li key={step} className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-amp-500/40 font-mono text-xs text-amp-300">
                  {i + 1}
                </span>
                <span className="text-sm text-stage-200">{step}</span>
              </li>
            ))}
          </ol>

          <button onClick={() => setSearchOpen(true)} className="btn-accent mt-2">
            Search YouTube
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((song, i) => (
            <SongCard
              key={song.video_id}
              song={song}
              index={i}
              onJobFinished={handleJobFinished}
              onDelete={handleDelete}
              onSeparate={handleSeparate}
            />
          ))}
        </div>
      )}

      {searchOpen && <SearchModal onPick={handlePick} onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
