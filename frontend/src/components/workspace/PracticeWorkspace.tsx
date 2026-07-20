import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'

import type { Stem, Transcription } from '../../lib/api'
import { usePracticeLogger } from '../../hooks/usePracticeLogger'
import { useStemPlayer } from '../../hooks/useStemPlayer'
import type { ChordsPayload } from '../../theory/chords'
import { MetronomeWidget } from '../theory/MetronomeWidget'
import { ChordSection } from './ChordSection'
import { JamPanel } from './JamPanel'
import { MainWaveform } from './MainWaveform'
import { PracticeHistoryPanel } from './PracticeHistoryPanel'
import { SpeedTrainer } from './SpeedTrainer'
import { StemLane } from './StemLane'
import { TranscribeButton } from './TranscribeButton'
import { TransportBar } from './TransportBar'

// AlphaTab (~1 MB of rendering + synth code) stays out of the page bundle
// until the tab panel actually mounts.
const TabSection = lazy(() => import('./TabSection').then((m) => ({ default: m.TabSection })))

interface PeaksFile {
  version: number
  bucket_count: number
  duration: number
  peaks: number[]
}

interface Props {
  videoId: string
  stems: Stem[]
}

const LANE_ORDER = ['vocals', 'guitar', 'bass', 'drums', 'piano', 'other']
// pitched stems worth running Basic Pitch on (drums would be noise)
const TRANSCRIBABLE = new Set(['guitar', 'bass', 'piano', 'other', 'vocals'])

export function PracticeWorkspace({ videoId, stems }: Props) {
  const sources = useMemo(
    () => stems.map((s) => ({ name: s.name, url: s.audio_url })),
    [stems],
  )
  const api = useStemPlayer(sources)
  const [peaksByStem, setPeaksByStem] = useState<Record<string, number[]>>({})
  const [pendingLoopA, setPendingLoopA] = useState<number | null>(null)
  const [newDraft, setNewDraft] = useState<Transcription | null>(null)
  const [chords, setChords] = useState<ChordsPayload | null>(null)
  const apiRef = useRef(api)
  apiRef.current = api

  usePracticeLogger(videoId, api)

  useEffect(() => {
    let cancelled = false
    void Promise.all(
      stems.map(async (stem) => {
        const resp = await fetch(stem.peaks_url)
        if (!resp.ok) throw new Error(`peaks for ${stem.name}: HTTP ${resp.status}`)
        return [stem.name, ((await resp.json()) as PeaksFile).peaks] as const
      }),
    )
      .then((entries) => {
        if (!cancelled) setPeaksByStem(Object.fromEntries(entries))
      })
      .catch((err: unknown) => {
        // waveforms are progressive enhancement — the player works without them
        if (!cancelled) console.error('failed to load peaks', err)
      })
    return () => {
      cancelled = true
    }
  }, [stems])

  // Combined mix waveform: per-bucket extremes across all stems.
  const combinedPeaks = useMemo(() => {
    const all = Object.values(peaksByStem)
    if (all.length === 0) return null
    const len = Math.max(...all.map((p) => p.length))
    const combined = new Array<number>(len).fill(0)
    for (const peaks of all) {
      for (let i = 0; i < peaks.length; i += 2) {
        combined[i] = Math.min(combined[i], peaks[i])
        combined[i + 1] = Math.max(combined[i + 1], peaks[i + 1])
      }
    }
    return combined
  }, [peaksByStem])

  // Keyboard shortcuts: space play/pause · L loop A/B/clear · [ ] speed · ←→ seek
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) {
        return
      }
      const a = apiRef.current
      switch (e.key) {
        case ' ':
          e.preventDefault()
          a.togglePlay()
          break
        case 'l':
        case 'L': {
          if (a.loop) {
            a.clearLoop()
            setPendingLoopA(null)
          } else {
            setPendingLoopA((prev) => {
              if (prev == null) return a.position
              const [start, end] = prev <= a.position ? [prev, a.position] : [a.position, prev]
              if (end - start > 0.2) a.setLoop(start, end)
              return null
            })
          }
          break
        }
        case '[':
          a.nudgeRate(-0.05)
          break
        case ']':
          a.nudgeRate(0.05)
          break
        case 'ArrowLeft':
          e.preventDefault()
          a.seekBy(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          a.seekBy(5)
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (api.status === 'error') {
    return (
      <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-300">
        Could not load the practice player: {api.error}
      </div>
    )
  }

  if (api.status !== 'ready' || !api.player) {
    const total = api.loadProgress.total || stems.length
    return (
      <div className="animate-rise mt-4 flex flex-col gap-4">
        <div className="panel p-6">
          <p className="animate-glow-pulse font-mono text-sm uppercase tracking-widest text-amp-300">
            Loading stems… {api.loadProgress.loaded}/{total}
          </p>
          <div className="progress-track mt-3">
            <div
              className="progress-fill"
              style={{ width: `${Math.max((api.loadProgress.loaded / total) * 100, 3)}%` }}
            />
          </div>
        </div>
        <div className="panel overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-stage-800/70 px-4 py-3 last:border-0">
              <div className="skeleton h-2.5 w-2.5 rounded-full" />
              <div className="skeleton h-3 w-16" />
              <div className="skeleton ml-16 h-6 flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const anySoloed = Object.values(api.mix).some((m) => m.soloed)
  const orderedStems = [...stems].sort(
    (a, b) => LANE_ORDER.indexOf(a.name) - LANE_ORDER.indexOf(b.name),
  )

  return (
    <div className="animate-rise mt-4 flex flex-col gap-4">
      {/* hero: chords · waveform · transport in one surface */}
      <div className="panel overflow-hidden">
        <ChordSection videoId={videoId} api={api} onLoaded={setChords} />

        {combinedPeaks && (
          <MainWaveform
            peaks={combinedPeaks}
            duration={api.duration}
            mediaUrl={stems[0].audio_url}
            player={api.player}
            loop={api.loop}
            onSeek={api.seek}
            onLoopChange={api.setLoop}
            onLoopWrap={api.onLoopWrap}
          />
        )}

        <div className="border-t border-stage-800">
          <TransportBar
            playing={api.playing}
            position={api.position}
            duration={api.duration}
            rate={api.rate}
            pitch={api.pitch}
            loop={api.loop}
            pendingLoopA={pendingLoopA}
            onTogglePlay={api.togglePlay}
            onRateChange={api.setRate}
            onPitchChange={api.setPitch}
            onClearLoop={() => {
              api.clearLoop()
              setPendingLoopA(null)
            }}
          />
        </div>
      </div>

      {/* stem mixer */}
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-stage-800 px-4 py-2">
          <h3 className="section-label">Mixer</h3>
          <span className="font-mono text-[11px] text-stage-500">M mute · S solo</span>
        </div>
        <div className="divide-y divide-stage-800/70">
          {orderedStems.map((stem) =>
            api.mix[stem.name] ? (
              <StemLane
                key={stem.name}
                name={stem.name}
                mix={api.mix[stem.name]}
                peaks={peaksByStem[stem.name] ?? null}
                sidelined={anySoloed && !api.mix[stem.name].soloed}
                onVolume={(v) => api.setVolume(stem.name, v)}
                onToggleMute={() => api.toggleMute(stem.name)}
                onToggleSolo={() => api.toggleSolo(stem.name)}
                action={
                  TRANSCRIBABLE.has(stem.name) ? (
                    <TranscribeButton videoId={videoId} stem={stem.name} onCreated={setNewDraft} />
                  ) : undefined
                }
              />
            ) : null,
          )}
        </div>
      </div>

      <JamPanel api={api} chords={chords} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SpeedTrainer
          player={api.player}
          loop={api.loop}
          onRateApplied={api.setRate}
          onLoopWrap={api.onLoopWrap}
        />
        <MetronomeWidget />
      </div>

      <Suspense fallback={<div className="skeleton h-24 w-full" />}>
        <TabSection videoId={videoId} player={api} newTranscription={newDraft} />
      </Suspense>

      <PracticeHistoryPanel videoId={videoId} />

      <p className="text-center font-mono text-[11px] text-stage-500">
        <kbd className="kbd">space</kbd> play · <kbd className="kbd">L</kbd> loop ·{' '}
        <kbd className="kbd">[</kbd> <kbd className="kbd">]</kbd> speed ·{' '}
        <kbd className="kbd">?</kbd> all shortcuts
      </p>
    </div>
  )
}
