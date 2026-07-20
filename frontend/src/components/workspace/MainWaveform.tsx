import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin, { type Region } from 'wavesurfer.js/dist/plugins/regions.esm.js'

import type { StemPlayer } from '../../audio/engine'

interface Props {
  /** Interleaved min/max peak pairs for the combined mix. */
  peaks: number[]
  duration: number
  /** Any stem's audio URL — used only as wavesurfer's timeline holder. */
  mediaUrl: string
  player: StemPlayer
  loop: { a: number; b: number } | null
  onSeek: (pos: number) => void
  onLoopChange: (a: number, b: number) => void
  /** Stable wrap subscription from useStemPlayer (survives player reloads). */
  onLoopWrap: (cb: () => void) => () => void
}

const REGION_COLOR = 'rgba(245, 158, 11, 0.16)'

/**
 * Main waveform: wavesurfer v7 rendering precomputed peaks, cursor driven by
 * the engine's tick (never wavesurfer playback), Regions plugin for the
 * draggable A-B loop window.
 */
export function MainWaveform({ peaks, duration, mediaUrl, player, loop, onSeek, onLoopChange, onLoopWrap }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const loopRef = useRef(loop)
  loopRef.current = loop
  // Region mutations we make programmatically shouldn't loop back as user edits.
  const syncingRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // A muted, never-played media element gives wavesurfer a real timeline
    // (currentTime is settable once metadata loads) without any decoding.
    const media = new Audio()
    media.preload = 'metadata'
    media.muted = true
    media.src = mediaUrl

    const regions = RegionsPlugin.create()
    const ws = WaveSurfer.create({
      container,
      media,
      peaks: [Float32Array.from(peaks)],
      duration,
      height: 148,
      waveColor: 'rgba(168, 158, 136, 0.4)',
      progressColor: '#f59e0b',
      cursorColor: '#ffd489',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      dragToSeek: false,
      plugins: [regions],
    })
    wsRef.current = ws
    regionsRef.current = regions

    regions.enableDragSelection({ color: REGION_COLOR })

    const handleRegionEdit = (region: Region) => {
      if (syncingRef.current) return
      // single-region policy: a new drag-selection replaces the old loop
      for (const other of regions.getRegions()) {
        if (other.id !== region.id) other.remove()
      }
      onLoopChange(region.start, region.end)
    }
    regions.on('region-created', handleRegionEdit)
    regions.on('region-updated', handleRegionEdit)

    ws.on('interaction', (newTime) => onSeek(newTime))

    const unsubTick = player.onTick((pos) => {
      // Drive the cursor straight from the engine — cheap DOM transform.
      if (Math.abs(ws.getCurrentTime() - pos) > 0.01) ws.setTime(pos)
    })
    ws.setTime(player.position)

    // flash the loop region when playback wraps back to A
    const unsubWrap = onLoopWrap(() => {
      const el = regions.getRegions()[0]?.element
      if (!el) return
      el.classList.remove('animate-loop-pulse')
      void el.offsetWidth // restart the animation
      el.classList.add('animate-loop-pulse')
    })

    return () => {
      unsubTick()
      unsubWrap()
      ws.destroy()
      wsRef.current = null
      regionsRef.current = null
      media.src = ''
    }
    // The waveform is rebuilt only when the song itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUrl, duration, player, onLoopWrap])

  // Reflect external loop changes (L key, trainer, clear) into the region.
  useEffect(() => {
    const regions = regionsRef.current
    if (!regions) return
    const existing = regions.getRegions()[0]
    if (!loop) {
      if (existing) {
        syncingRef.current = true
        regions.clearRegions()
        syncingRef.current = false
      }
      return
    }
    if (existing && Math.abs(existing.start - loop.a) < 0.01 && Math.abs(existing.end - loop.b) < 0.01) {
      return
    }
    syncingRef.current = true
    regions.clearRegions()
    regions.addRegion({ start: loop.a, end: loop.b, color: REGION_COLOR, drag: true, resize: true })
    syncingRef.current = false
  }, [loop])

  return <div ref={containerRef} data-testid="main-waveform" className="px-4 py-3" />
}
