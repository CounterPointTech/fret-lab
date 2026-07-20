import { useEffect, useMemo, useRef, useState } from 'react'

import type { Stem } from '../../lib/api'
import { useStemPlayer } from '../../hooks/useStemPlayer'
import { MainWaveform } from './MainWaveform'
import { SpeedTrainer } from './SpeedTrainer'
import { StemLane } from './StemLane'
import { TransportBar } from './TransportBar'

interface PeaksFile {
  version: number
  bucket_count: number
  duration: number
  peaks: number[]
}

interface Props {
  stems: Stem[]
}

const LANE_ORDER = ['vocals', 'guitar', 'bass', 'drums', 'piano', 'other']

export function PracticeWorkspace({ stems }: Props) {
  const sources = useMemo(
    () => stems.map((s) => ({ name: s.name, url: s.audio_url })),
    [stems],
  )
  const api = useStemPlayer(sources)
  const [peaksByStem, setPeaksByStem] = useState<Record<string, number[]>>({})
  const [pendingLoopA, setPendingLoopA] = useState<number | null>(null)
  const apiRef = useRef(api)
  apiRef.current = api

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
    return (
      <div className="animate-rise mt-4 rounded-xl border border-stage-700/60 bg-stage-900/80 p-6">
        <p className="animate-glow-pulse font-mono text-sm uppercase tracking-widest text-amp-300">
          Loading stems… {api.loadProgress.loaded}/{api.loadProgress.total || stems.length}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stage-700">
          <div
            className="h-full rounded-full bg-amp-400 transition-[width] duration-300"
            style={{
              width: `${Math.max((api.loadProgress.loaded / (api.loadProgress.total || stems.length)) * 100, 3)}%`,
            }}
          />
        </div>
      </div>
    )
  }

  const anySoloed = Object.values(api.mix).some((m) => m.soloed)
  const orderedStems = [...stems].sort(
    (a, b) => LANE_ORDER.indexOf(a.name) - LANE_ORDER.indexOf(b.name),
  )

  return (
    <div className="animate-rise mt-4 flex flex-col gap-3">
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

      {combinedPeaks && (
        <MainWaveform
          peaks={combinedPeaks}
          duration={api.duration}
          mediaUrl={stems[0].audio_url}
          player={api.player}
          loop={api.loop}
          onSeek={api.seek}
          onLoopChange={api.setLoop}
        />
      )}

      <div className="flex flex-col gap-2">
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
            />
          ) : null,
        )}
      </div>

      <SpeedTrainer player={api.player} loop={api.loop} onRateApplied={api.setRate} />

      <p className="text-center font-mono text-[11px] text-stage-500">
        space play/pause · L loop A/B/clear · [ ] speed · ← → seek 5s
      </p>
    </div>
  )
}
