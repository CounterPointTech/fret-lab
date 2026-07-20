import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { listSongs, type Song } from '../../lib/api'
import type { ScaleType } from '../../theory/scales'
import type { Mode } from '../types'
import { Markdown } from './Markdown'

interface Props {
  md: string
  tonic: string
  mode: Mode
  scale: ScaleType
}

/**
 * "Now go play it" — the learn-by-doing bridge. Lists library songs whose
 * detected key matches the lesson, linking straight into the practice
 * workspace (Jam Mode lives there); always offers the Theory Tools fretboard
 * as a fallback.
 */
export function JamCTA({ md, tonic, mode, scale }: Props) {
  const [matches, setMatches] = useState<Song[]>([])
  const keyName = `${tonic} ${mode}`

  useEffect(() => {
    let cancelled = false
    listSongs()
      .then(({ songs }) => {
        if (cancelled) return
        setMatches(songs.filter((s) => s.status === 'ready' && s.key_name === keyName))
      })
      .catch(() => {
        // library unavailable — the tools link below still works
      })
    return () => {
      cancelled = true
    }
  }, [keyName])

  return (
    <div className="panel border-amp-500/30 p-5" data-testid="jam-cta">
      <h3 className="section-label text-amp-300">🎸 Put it on the fretboard</h3>
      <div className="mt-2 text-sm">
        <Markdown md={md} />
      </div>

      {matches.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-xs text-stage-400">
            In your library, in {keyName} — open one and hit Jam Mode:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {matches.slice(0, 4).map((song) => (
              <Link
                key={song.video_id}
                to={`/songs/${song.video_id}`}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                ♪ {song.title.length > 40 ? `${song.title.slice(0, 40)}…` : song.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          to={`/learn/tools?key=${encodeURIComponent(keyName)}`}
          className="font-mono text-xs text-amp-300 transition hover:text-amp-200"
        >
          Open the {tonic} {scale} map in Theory Tools →
        </Link>
        {matches.length === 0 && (
          <span className="font-mono text-xs text-stage-500">
            or add a song in {keyName} to your library and jam it
          </span>
        )}
      </div>
    </div>
  )
}
