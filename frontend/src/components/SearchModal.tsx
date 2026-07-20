import { useEffect, useRef, useState } from 'react'

import { formatDuration, searchSongs, type SearchResult } from '../lib/api'

interface Props {
  onPick: (result: SearchResult) => void
  onClose: () => void
}

export function SearchModal({ onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function runSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q || searching) return
    setSearching(true)
    setError(null)
    try {
      const { results } = await searchSongs(q)
      setResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setResults(null)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-40 flex items-start justify-center bg-black/70 p-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Search YouTube"
        className="animate-rise w-full max-w-2xl overflow-hidden rounded-2xl border border-stage-700 bg-stage-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={runSearch} className="flex items-center gap-3 border-b border-stage-700/70 px-5 py-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={searching ? 'animate-glow-pulse text-amp-400' : 'text-stage-500'}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a song on YouTube…"
            className="flex-1 bg-transparent text-lg text-stage-100 outline-none placeholder:text-stage-500"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="rounded-lg bg-amp-500 px-4 py-1.5 text-sm font-bold text-stage-950 transition hover:bg-amp-400 disabled:opacity-40"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        <div className="max-h-[55vh] overflow-y-auto">
          {error && <p className="px-5 py-6 text-sm text-rose-300">{error}</p>}
          {searching && (
            <div className="flex flex-col gap-3 px-5 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton h-14 w-24 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="skeleton h-3.5 w-2/3" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!error && results?.length === 0 && (
            <p className="px-5 py-6 text-sm text-stage-300">No results — try another query.</p>
          )}
          {!error && results == null && !searching && (
            <p className="px-5 py-8 text-center text-sm text-stage-500">
              Press <kbd className="kbd">Enter</kbd> to search YouTube — pick a result to add it
              to your library.
            </p>
          )}
          {results?.map((r) => (
            <button
              key={r.video_id}
              onClick={() => onPick(r)}
              className="flex w-full items-center gap-4 border-b border-stage-800 px-5 py-3 text-left transition hover:bg-stage-800/70"
            >
              {r.thumbnail_url && (
                <img
                  src={r.thumbnail_url}
                  alt=""
                  className="h-14 w-24 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-stage-100">{r.title}</span>
                <span className="block truncate text-sm text-stage-300">{r.channel ?? 'Unknown channel'}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-stage-300">{formatDuration(r.duration_s)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
