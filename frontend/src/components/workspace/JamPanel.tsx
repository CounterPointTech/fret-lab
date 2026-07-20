import { useEffect, useMemo, useRef, useState } from 'react'
import { Note } from 'tonal'

import type { StemPlayerApi } from '../../hooks/useStemPlayer'
import {
  chordAtTime,
  chordNotes,
  displayChordLabel,
  keyPrefersFlats,
  transposeChordLabel,
  type ChordsPayload,
} from '../../theory/chords'
import {
  TUNINGS,
  chordPositions,
  scalePositions,
  suggestScales,
  type FretPosition,
} from '../../theory/scales'
import { FretboardView } from '../theory/FretboardView'

interface Props {
  api: StemPlayerApi
  chords: ChordsPayload | null
}

/**
 * Jam Mode — the zombieguitar experience: one click mutes the guitar stem
 * and loops the practice section while the fretboard shows the recommended
 * scale for the detected key, lighting up the tones of whatever chord is
 * sounding right now. Everything follows the pitch-shift setting so the
 * overlay matches what the speakers play.
 */
export function JamPanel({ api, chords }: Props) {
  const [active, setActive] = useState(false)
  const [scaleIdx, setScaleIdx] = useState(0)
  const [currentLabel, setCurrentLabel] = useState<string | null>(null)
  // whether *we* muted the guitar, so leaving jam mode restores the mix
  const mutedGuitarRef = useRef(false)

  const pitch = api.pitch
  const key = chords?.key ?? null
  const suggestions = useMemo(() => {
    if (!key) return []
    const tonic = transposeChordLabel(key.tonic, pitch) // pitch-shift-aware tonic
    return suggestScales(tonic, key.mode)
  }, [key, pitch])

  // Track the sounding chord while jamming.
  const spans = chords?.chords
  useEffect(() => {
    const player = api.player
    if (!active || !player || !spans) return
    let last: string | null = null
    return player.onTick((pos) => {
      const label = chordAtTime(spans, pos)?.label ?? null
      if (label !== last) {
        last = label
        setCurrentLabel(label)
      }
    })
  }, [active, api.player, spans])

  const tuning = TUNINGS.standard.notes
  const scale = suggestions[Math.min(scaleIdx, Math.max(0, suggestions.length - 1))]

  const soundingChord =
    active && currentLabel && currentLabel !== 'N'
      ? transposeChordLabel(currentLabel, pitch)
      : null

  const dots = useMemo<FretPosition[]>(() => {
    if (!scale) return []
    const chordChromas = new Set(
      soundingChord
        ? chordNotes(soundingChord)
            .map((n) => Note.chroma(n))
            .filter((c): c is number => c != null)
        : [],
    )
    const base = scalePositions(tuning, scale.tonic, scale.type).map((p) => ({
      ...p,
      inChord: chordChromas.has(Note.chroma(p.note) ?? -1),
    }))
    if (chordChromas.size === 0) return base
    // chord tones outside the scale (e.g. the raised 7th of a V chord)
    const seen = new Set(base.map((p) => `${p.string}:${p.fret}`))
    const extras = soundingChord
      ? chordPositions(tuning, soundingChord)
          .filter((p) => !seen.has(`${p.string}:${p.fret}`))
          .map((p) => ({ ...p, isRoot: false, inChord: true }))
      : []
    return [...base, ...extras]
  }, [scale, soundingChord, tuning])

  function enterJam() {
    const guitar = api.mix.guitar
    if (guitar && !guitar.muted) {
      api.toggleMute('guitar')
      mutedGuitarRef.current = true
    }
    if (!api.loop && api.duration > 0) {
      api.setLoop(0, api.duration) // loop the whole song until a section is chosen
    }
    setActive(true)
    void api.play()
  }

  function exitJam() {
    if (mutedGuitarRef.current) {
      if (api.mix.guitar?.muted) api.toggleMute('guitar')
      mutedGuitarRef.current = false
    }
    setActive(false)
    setCurrentLabel(null)
  }

  if (!chords || !key) return null
  const preferFlats = keyPrefersFlats(key)

  return (
    <div
      data-testid="jam-panel"
      className={`rounded-xl border p-4 transition-colors ${
        active ? 'border-amp-500/50 bg-stage-900' : 'border-stage-700/60 bg-stage-900/80'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-stage-500">
          Jam Mode
        </span>
        <button
          onClick={active ? exitJam : enterJam}
          className={`rounded-lg px-4 py-1.5 font-bold transition ${
            active
              ? 'bg-amp-500 text-stage-950 shadow-lg shadow-amp-500/20'
              : 'border border-amp-500/50 text-amp-300 hover:bg-amp-500/10'
          }`}
        >
          {active ? '■ Exit jam' : '▶ Jam over backing track'}
        </button>
        <span className="text-sm text-stage-300">
          {active
            ? 'Guitar muted — the loop is yours. Green dots are the sounding chord.'
            : `Mutes the guitar stem and loops ${api.loop ? 'your A-B section' : 'the song'} with the ${key.name} scale on screen.`}
        </span>
        {active && (
          <span className="ml-auto font-display text-2xl font-extrabold text-emerald-300">
            {soundingChord ? displayChordLabel(soundingChord, preferFlats) : '—'}
          </span>
        )}
      </div>

      {active && scale && (
        <div className="mt-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {suggestions.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setScaleIdx(i)}
                title={s.why}
                className={`rounded-full px-3 py-1 font-mono text-xs transition ${
                  i === scaleIdx
                    ? 'bg-amp-500 font-bold text-stage-950'
                    : 'border border-stage-700 text-stage-300 hover:border-amp-500/60 hover:text-amp-300'
                }`}
              >
                {s.label}
              </button>
            ))}
            <span className="font-mono text-xs text-stage-500">{scale.why}</span>
          </div>
          <FretboardView tuning={tuning} dots={dots} />
          <p className="mt-1 font-mono text-[11px] text-stage-500">
            amber = scale root · green = current chord tones · set an A-B loop to jam a section
          </p>
        </div>
      )}
    </div>
  )
}
