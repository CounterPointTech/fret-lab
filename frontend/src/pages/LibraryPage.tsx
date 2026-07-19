import { useCallback, useEffect, useState } from 'react'

import { SearchModal } from '../components/SearchModal'
import { SongCard } from '../components/SongCard'
import { useToast } from '../components/Toasts'
import { addSong, deleteSong, listSongs, type JobEvent, type SearchResult, type Song } from '../lib/api'

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
            Fret <span className="text-amp-400">Lab</span>
          </h1>
          <p className="mt-2 text-stage-300">Your practice library — search, download, shred.</p>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-amp-500 px-5 py-3 font-bold text-stage-950 shadow-lg shadow-amp-500/20 transition hover:bg-amp-400 hover:shadow-amp-400/30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add song
        </button>
      </header>

      {songs == null ? (
        <p className="py-20 text-center text-stage-500">Loading library…</p>
      ) : songs.length === 0 ? (
        <div className="animate-rise mt-16 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-stage-700 py-20 text-center">
          <span className="text-6xl">🎸</span>
          <h2 className="text-2xl font-bold text-stage-100">No songs yet</h2>
          <p className="max-w-md text-stage-300">
            Search YouTube for a song you want to learn — Fret Lab downloads the audio and gets it ready
            for stem separation and tabs.
          </p>
          <button
            onClick={() => setSearchOpen(true)}
            className="mt-2 rounded-xl border border-amp-500/50 px-5 py-2.5 font-semibold text-amp-300 transition hover:bg-amp-500/10"
          >
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
            />
          ))}
        </div>
      )}

      {searchOpen && <SearchModal onPick={handlePick} onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
