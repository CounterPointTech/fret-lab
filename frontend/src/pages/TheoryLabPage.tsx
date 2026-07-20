import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { CircleOfFifths } from '../components/theory/CircleOfFifths'
import { FretboardView } from '../components/theory/FretboardView'
import { MetronomeWidget } from '../components/theory/MetronomeWidget'
import { diatonicChords } from '../theory/chords'
import {
  SCALE_TYPES,
  TUNINGS,
  chordPositions,
  chordVoicings,
  scaleBoxes,
  scalePositions,
  type ScaleType,
} from '../theory/scales'

const FRET_COUNT = 15
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/** "A minor" (song key_name / ?key= param) -> state pieces */
function parseKeyParam(param: string | null): { tonic: string; mode: 'major' | 'minor' } | null {
  if (!param) return null
  const [tonic, mode] = param.split(' ')
  if (!SHARPS.includes(tonic) || (mode !== 'major' && mode !== 'minor')) return null
  return { tonic, mode }
}

export function TheoryLabPage() {
  const [params] = useSearchParams()
  const fromKey = parseKeyParam(params.get('key'))
  const songId = params.get('song')

  const [tonic, setTonic] = useState(fromKey?.tonic ?? 'A')
  const [mode, setMode] = useState<'major' | 'minor'>(fromKey?.mode ?? 'minor')
  const [scaleType, setScaleType] = useState<ScaleType>(
    fromKey?.mode === 'major' ? 'major pentatonic' : 'minor pentatonic',
  )
  const [tuningKey, setTuningKey] = useState('standard')
  const [boxIdx, setBoxIdx] = useState<number | null>(null)
  const [chordLabel, setChordLabel] = useState(
    (fromKey?.tonic ?? 'A') + (fromKey?.mode === 'major' ? '' : 'm'),
  )
  const [voicingIdx, setVoicingIdx] = useState<number | null>(null)

  const tuning = TUNINGS[tuningKey].notes

  const boxes = useMemo(
    () => scaleBoxes(tuning, tonic, scaleType, FRET_COUNT),
    [tuning, tonic, scaleType],
  )
  const activeBox = boxIdx != null ? (boxes[boxIdx] ?? null) : null
  const scaleDots = useMemo(
    () => (activeBox ? activeBox.positions : scalePositions(tuning, tonic, scaleType, FRET_COUNT)),
    [tuning, tonic, scaleType, activeBox],
  )

  const voicings = useMemo(() => chordVoicings(tuning, chordLabel, FRET_COUNT), [tuning, chordLabel])
  const activeVoicing = voicingIdx != null ? (voicings[voicingIdx] ?? null) : null
  const chordDots = useMemo(
    () => (activeVoicing ? activeVoicing.positions : chordPositions(tuning, chordLabel, FRET_COUNT)),
    [tuning, chordLabel, activeVoicing],
  )

  const related = useMemo(() => diatonicChords(tonic, mode), [tonic, mode])

  function selectKey(nextTonic: string, nextMode: 'major' | 'minor') {
    setTonic(nextTonic)
    setMode(nextMode)
    setScaleType(nextMode === 'major' ? 'major pentatonic' : 'minor pentatonic')
    setBoxIdx(null)
    setChordLabel(nextMode === 'major' ? nextTonic : `${nextTonic}m`)
    setVoicingIdx(null)
  }

  /** tonal triad name ("Bdim") -> our label vocabulary; dim falls back to root tones */
  function pickRelatedChord(name: string) {
    const label = name.endsWith('dim') ? name.slice(0, -3) : name
    setChordLabel(label)
    setVoicingIdx(null)
  }

  const selectClass =
    'rounded-lg border border-stage-700 bg-stage-950 px-2.5 py-1.5 font-mono text-sm text-stage-100'
  const chipClass = (selected: boolean) =>
    `rounded-full px-3 py-1 font-mono text-xs transition ${
      selected
        ? 'bg-amp-500 font-bold text-stage-950'
        : 'border border-stage-700 text-stage-300 hover:border-amp-500/60 hover:text-amp-300'
    }`

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      {songId && (
        <nav className="pt-6 font-mono text-sm">
          <Link to={`/songs/${songId}`} className="text-stage-300 transition hover:text-amp-300">
            ← Back to song
          </Link>
        </nav>
      )}

      <header className="animate-rise pt-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Theory Lab</h1>
        <p className="mt-1 text-stage-300">
          The fretboard is movable shapes — pick a key, see the patterns, jam them over real songs.
        </p>
      </header>

      <div className="animate-rise mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
        <section className="panel p-4">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-stage-500">
            Circle of fifths
          </h2>
          <CircleOfFifths tonic={tonic} mode={mode} onSelect={selectKey} />
        </section>

        <section className="flex flex-col gap-4 panel p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-sm text-stage-300">
              Key
              <select
                value={tonic}
                onChange={(e) => selectKey(e.target.value, mode)}
                className={selectClass}
              >
                {SHARPS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <select
                value={mode}
                onChange={(e) => selectKey(tonic, e.target.value as 'major' | 'minor')}
                className={selectClass}
              >
                <option value="major">major</option>
                <option value="minor">minor</option>
              </select>
            </label>

            <label className="flex items-center gap-2 font-mono text-sm text-stage-300">
              Scale
              <select
                value={scaleType}
                onChange={(e) => {
                  setScaleType(e.target.value as ScaleType)
                  setBoxIdx(null)
                }}
                className={selectClass}
              >
                {SCALE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 font-mono text-sm text-stage-300">
              Tuning
              <select
                value={tuningKey}
                onChange={(e) => setTuningKey(e.target.value)}
                className={selectClass}
              >
                {Object.entries(TUNINGS).map(([k, t]) => (
                  <option key={k} value={k}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <h2 className="mb-1.5 font-mono text-xs uppercase tracking-widest text-stage-500">
              Chords in {tonic} {mode}
            </h2>
            <div className="flex flex-wrap gap-2">
              {related.map((name) => (
                <button
                  key={name}
                  onClick={() => pickRelatedChord(name)}
                  className={chipClass(chordLabel === name || chordLabel === name.replace('dim', ''))}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="animate-rise mt-6 panel p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-mono text-xs uppercase tracking-widest text-stage-500">
            Scale explorer — {tonic} {scaleType}
          </h2>
          <button onClick={() => setBoxIdx(null)} className={chipClass(boxIdx == null)}>
            whole neck
          </button>
          {boxes.map((box, i) => (
            <button key={box.name} onClick={() => setBoxIdx(i)} className={chipClass(boxIdx === i)}>
              {box.name} · {box.caged} shape
            </button>
          ))}
        </div>
        <FretboardView
          tuning={tuning}
          dots={scaleDots}
          fretCount={FRET_COUNT}
          window={activeBox ? { minFret: activeBox.minFret, maxFret: activeBox.maxFret } : null}
        />
        <p className="mt-1 font-mono text-[11px] text-stage-500">
          amber = root · boxes follow the CAGED system and re-anchor when the tuning changes
        </p>
      </section>

      <section className="animate-rise mt-6 panel p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="mr-2 font-mono text-xs uppercase tracking-widest text-stage-500">
            Chord explorer
          </h2>
          <select
            value={chordLabel}
            onChange={(e) => {
              setChordLabel(e.target.value)
              setVoicingIdx(null)
            }}
            className={selectClass}
          >
            {SHARPS.flatMap((n) => [n, `${n}m`]).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <button onClick={() => setVoicingIdx(null)} className={chipClass(voicingIdx == null)}>
            all chord tones
          </button>
          {voicings.map((v, i) => (
            <button key={v.shape} onClick={() => setVoicingIdx(i)} className={chipClass(voicingIdx === i)}>
              {v.shape}
            </button>
          ))}
          {voicings.length === 0 && (
            <span className="font-mono text-xs text-stage-500">
              (shape voicings are standard-tuning only)
            </span>
          )}
        </div>
        <FretboardView tuning={tuning} dots={chordDots} fretCount={FRET_COUNT} showIntervals />
      </section>

      <div className="animate-rise mt-6">
        <MetronomeWidget />
      </div>
    </div>
  )
}
