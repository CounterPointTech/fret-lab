import { useCallback, useEffect, useRef, useState } from 'react'

import { StemPlayer, type StemSource } from '../audio/engine'
import { clampRate, clampSemitones } from '../audio/transport'

export interface StemMixState {
  volume: number
  muted: boolean
  soloed: boolean
}

export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Owns a StemPlayer's lifecycle and mirrors its transport/mix state into
 * React. `sources` must be referentially stable (memoized by the caller) —
 * changing it reloads the whole player.
 */
export function useStemPlayer(sources: StemSource[] | null) {
  const playerRef = useRef<StemPlayer | null>(null)
  const [status, setStatus] = useState<PlayerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 0 })
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [rate, setRateState] = useState(1)
  const [pitch, setPitchState] = useState(0)
  const [loop, setLoopState] = useState<{ a: number; b: number } | null>(null)
  const [mix, setMix] = useState<Record<string, StemMixState>>({})
  // Wrap listeners registered against the hook (stable across player
  // instances) — the load effect wires the live player into this set.
  const wrapCbsRef = useRef(new Set<() => void>())

  useEffect(() => {
    if (!sources || sources.length === 0) return
    let cancelled = false
    const player = new StemPlayer()
    playerRef.current = player
    setStatus('loading')
    setError(null)

    player
      .load(sources, (p) => {
        if (!cancelled) setLoadProgress({ loaded: p.loaded, total: p.total })
      })
      .then(() => {
        if (cancelled) return
        if (import.meta.env.DEV) {
          void player.enableDriftMonitor()
          // dev/debug handle for driven-browser scripts
          ;(window as unknown as { __stemPlayer?: StemPlayer }).__stemPlayer = player
        }
        setDuration(player.duration)
        const initialMix: Record<string, StemMixState> = {}
        for (const name of player.stemNames) {
          initialMix[name] = { volume: 1, muted: false, soloed: false }
        }
        setMix(initialMix)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return // dispose() during load (e.g. unmount) is expected
        setError(err instanceof Error ? err.message : String(err))
        setStatus('error')
      })

    // Throttle position into React at ~10Hz; fast consumers (waveform cursor)
    // subscribe to player.onTick directly.
    let lastPosUpdate = 0
    const unsubTick = player.onTick((pos) => {
      const now = performance.now()
      if (now - lastPosUpdate > 100 || !player.playing) {
        lastPosUpdate = now
        setPosition(pos)
      }
    })
    const unsubWrap = player.onLoopWrap(() => {
      for (const cb of wrapCbsRef.current) cb()
    })

    return () => {
      cancelled = true
      unsubTick()
      unsubWrap()
      player.dispose()
      playerRef.current = null
      setStatus('idle')
      setPlaying(false)
      setPosition(0)
    }
  }, [sources])

  const play = useCallback(async () => {
    const p = playerRef.current
    if (!p) return
    await p.play()
    setPlaying(true)
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pause()
    setPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (playerRef.current?.playing) pause()
    else void play()
  }, [play, pause])

  const seek = useCallback((pos: number) => {
    playerRef.current?.seek(pos)
    setPosition(playerRef.current?.position ?? pos)
  }, [])

  const seekBy = useCallback(
    (delta: number) => {
      const p = playerRef.current
      if (p) seek(p.position + delta)
    },
    [seek],
  )

  const setRate = useCallback((r: number) => {
    const clamped = clampRate(r)
    playerRef.current?.setRate(clamped)
    setRateState(clamped)
  }, [])

  const nudgeRate = useCallback(
    (delta: number) => {
      setRate((playerRef.current?.rate ?? 1) + delta)
    },
    [setRate],
  )

  const setPitch = useCallback((semitones: number) => {
    const clamped = clampSemitones(semitones)
    playerRef.current?.setPitchSemitones(clamped)
    setPitchState(clamped)
  }, [])

  const setLoop = useCallback((a: number, b: number) => {
    if (!(b > a)) return
    playerRef.current?.setLoop(a, b)
    setLoopState({ a, b })
  }, [])

  const clearLoop = useCallback(() => {
    playerRef.current?.clearLoop()
    setLoopState(null)
  }, [])

  const setVolume = useCallback((name: string, volume: number) => {
    playerRef.current?.setVolume(name, volume)
    setMix((m) => ({ ...m, [name]: { ...m[name], volume } }))
  }, [])

  const toggleMute = useCallback((name: string) => {
    setMix((m) => {
      const muted = !m[name].muted
      playerRef.current?.setMute(name, muted)
      return { ...m, [name]: { ...m[name], muted } }
    })
  }, [])

  /** Subscribe to loop wraps on whichever player instance is live. */
  const onLoopWrap = useCallback((cb: () => void) => {
    wrapCbsRef.current.add(cb)
    return () => {
      wrapCbsRef.current.delete(cb)
    }
  }, [])

  const toggleSolo = useCallback((name: string) => {
    setMix((m) => {
      const soloed = !m[name].soloed
      playerRef.current?.setSolo(name, soloed)
      return { ...m, [name]: { ...m[name], soloed } }
    })
  }, [])

  return {
    player: playerRef.current,
    status,
    error,
    loadProgress,
    duration,
    playing,
    position,
    rate,
    pitch,
    loop,
    mix,
    play,
    pause,
    togglePlay,
    seek,
    seekBy,
    setRate,
    nudgeRate,
    setPitch,
    setLoop,
    clearLoop,
    setVolume,
    toggleMute,
    toggleSolo,
    onLoopWrap,
  }
}

export type StemPlayerApi = ReturnType<typeof useStemPlayer>
