/**
 * TabViewer — reusable AlphaTab wrapper (tab + standard notation).
 *
 * Two player modes:
 *  - 'synth'  — AlphaTab's own SoundFont synthesizer: cursor, click-to-seek
 *    and speed control all handled internally by AlphaTab.
 *  - 'audio'  — external-media mode: our StemPlayer is the time axis. The
 *    caller pushes real-audio positions via `setCursorTime`, AlphaTab maps
 *    them to score ticks through per-bar sync points built from a SyncModel
 *    (BPM + offset), and user interaction (click-to-seek, play/pause,
 *    selection loops) flows back out through the `media` callbacks.
 *
 * Phases 5–6 reuse this interface: load via `fileUrl`, drive via the ref
 * handle (`setCursorTime`, `setPlaying`), observe via `onBarClick`.
 */
import * as alphaTab from '@coderline/alphatab'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'

import bravuraWoff2Url from '@coderline/alphatab/font/Bravura.woff2?url'
import soundFontUrl from '@coderline/alphatab/soundfont/sonivox.sf3?url'

import { secondsToTick, tickToSeconds, type SyncModel } from './sync'

export interface TabViewerMediaCallbacks {
  /** External audio duration in seconds (backing track length). */
  durationS: number
  playbackRate: number
  onPlay(): void
  onPause(): void
  onSeek(seconds: number): void
  onRateChange(rate: number): void
}

export interface TabViewerHandle {
  /** audio mode: move the cursor to this external-audio time (source seconds). */
  setCursorTime(seconds: number): void
  /** audio mode: mirror the external transport state into AlphaTab. */
  setPlaying(playing: boolean): void
  /** synth mode: toggle AlphaTab's own playback. */
  playPause(): void
  /** synth mode: AlphaTab synth speed (1 = normal). */
  setSynthSpeed(speed: number): void
  readonly api: alphaTab.AlphaTabApi | null
}

interface Props {
  fileUrl: string
  mode: 'synth' | 'audio'
  /** Required in audio mode; ignored in synth mode. */
  sync?: SyncModel
  media?: TabViewerMediaCallbacks
  /** Fires on beat click with the mapped audio time (audio mode only). */
  onBarClick?(seconds: number, tick: number): void
  /** Fires when the user selects a range in the tab (audio mode only). */
  onSelectionLoop?(aSeconds: number, bSeconds: number): void
  onScoreLoaded?(info: { title: string; trackNames: string[]; tempo: number }): void
  onError?(message: string): void
  handleRef?: Ref<TabViewerHandle>
}

const STAGE_100 = '#ece5d8'
const STAGE_300 = '#a89e88'
const STAGE_500 = '#57503f'
const AMP_400 = '#ffb946'

function color(hex: string): alphaTab.model.Color {
  const c = alphaTab.model.Color.fromJson(hex)
  if (!c) throw new Error(`invalid color: ${hex}`)
  return c
}

export function TabViewer({
  fileUrl,
  mode,
  sync,
  media,
  onBarClick,
  onSelectionLoop,
  onScoreLoaded,
  onError,
  handleRef,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null)
  const [rendering, setRendering] = useState(true)
  const [trackNames, setTrackNames] = useState<string[]>([])
  const [activeTrack, setActiveTrack] = useState(0)

  // Latest props in refs so the AlphaTab instance survives prop-value changes.
  const syncRef = useRef(sync)
  syncRef.current = sync
  const mediaRef = useRef(media)
  mediaRef.current = media
  const cbRef = useRef({ onBarClick, onSelectionLoop, onScoreLoaded, onError })
  cbRef.current = { onBarClick, onSelectionLoop, onScoreLoaded, onError }

  useEffect(() => {
    const host = hostRef.current
    const scroll = scrollRef.current
    if (!host || !scroll) return

    const settings = new alphaTab.Settings()
    settings.core.file = fileUrl
    settings.core.logLevel = alphaTab.LogLevel.Warning
    // the vite plugin's font auto-detection fails in dev — pin Bravura explicitly
    settings.core.smuflFontSources = new Map([[alphaTab.FontFileFormat.Woff2, bravuraWoff2Url]])
    settings.player.playerMode =
      mode === 'synth'
        ? alphaTab.PlayerMode.EnabledSynthesizer
        : alphaTab.PlayerMode.EnabledExternalMedia
    settings.player.soundFont = mode === 'synth' ? soundFontUrl : null
    settings.player.enableCursor = true
    settings.player.enableUserInteraction = true
    settings.player.scrollElement = scroll
    settings.player.scrollOffsetY = -32
    settings.display.scale = 0.95
    // MusicXML with a 6-line tab-tuned staff would otherwise render tab-only;
    // ScoreTab always shows notation + tab (Default's behavior for GP files)
    settings.display.staveProfile = alphaTab.StaveProfile.ScoreTab
    const res = settings.display.resources
    res.mainGlyphColor = color(STAGE_100)
    res.secondaryGlyphColor = color(STAGE_300)
    res.scoreInfoColor = color(STAGE_100)
    res.staffLineColor = color(STAGE_500)
    res.barSeparatorColor = color(STAGE_300)
    res.barNumberColor = color(AMP_400)

    const api = new alphaTab.AlphaTabApi(host, settings)
    apiRef.current = api
    setRendering(true)
    setActiveTrack(0)

    api.error.on((err) => {
      cbRef.current.onError?.(err.message ?? String(err))
    })

    api.scoreLoaded.on((score) => {
      // MusicXML with a tuned 6-line staff imports as tab-only — force both
      // staves so drafts render notation + tab like Guitar Pro files do
      for (const track of score.tracks) {
        for (const staff of track.staves) {
          if (staff.showTablature) staff.showStandardNotation = true
        }
      }
      const names = score.tracks.map((t) => t.name)
      setTrackNames(names)
      cbRef.current.onScoreLoaded?.({ title: score.title, trackNames: names, tempo: score.tempo })
      if (mode === 'audio') applySyncPoints(api, syncRef.current)
    })

    api.renderFinished.on(() => setRendering(false))

    if (mode === 'audio') {
      api.playerReady.on(() => {
        const output = api.player?.output as alphaTab.synth.IExternalMediaSynthOutput
        if (!output) return
        output.handler = {
          get backingTrackDuration() {
            return (mediaRef.current?.durationS ?? 0) * 1000
          },
          get playbackRate() {
            return mediaRef.current?.playbackRate ?? 1
          },
          set playbackRate(value: number) {
            mediaRef.current?.onRateChange(value)
          },
          get masterVolume() {
            return 1
          },
          set masterVolume(_value: number) {
            // stem mixer owns volume; AlphaTab must not override it
          },
          seekTo(timeMs: number) {
            mediaRef.current?.onSeek(timeMs / 1000)
          },
          play() {
            mediaRef.current?.onPlay()
          },
          pause() {
            mediaRef.current?.onPause()
          },
        }
      })

      api.beatMouseDown.on((beat) => {
        const s = syncRef.current
        if (!s) return
        const tick = beat.absolutePlaybackStart
        cbRef.current.onBarClick?.(tickToSeconds(tick, s), tick)
      })

      api.playbackRangeChanged.on((args) => {
        const s = syncRef.current
        if (!s || !args.playbackRange) return
        cbRef.current.onSelectionLoop?.(
          tickToSeconds(args.playbackRange.startTick, s),
          tickToSeconds(args.playbackRange.endTick, s),
        )
      })
    }

    return () => {
      apiRef.current = null
      try {
        api.destroy()
      } catch (err) {
        console.error('AlphaTab destroy failed', err)
      }
    }
  }, [fileUrl, mode])

  // Re-pin the sync points whenever the sync model changes.
  useEffect(() => {
    const api = apiRef.current
    if (api?.score && mode === 'audio' && sync) applySyncPoints(api, sync)
  }, [sync, mode])

  useImperativeHandle(
    handleRef,
    (): TabViewerHandle => ({
      setCursorTime(seconds: number) {
        const api = apiRef.current
        if (!api || mode !== 'audio') return
        const output = api.player?.output as alphaTab.synth.IExternalMediaSynthOutput
        output?.updatePosition(seconds * 1000)
      },
      setPlaying(playing: boolean) {
        const api = apiRef.current
        if (!api || mode !== 'audio') return
        const isPlaying = api.playerState === alphaTab.synth.PlayerState.Playing
        if (playing && !isPlaying) api.play()
        else if (!playing && isPlaying) api.pause()
      },
      playPause() {
        apiRef.current?.playPause()
      },
      setSynthSpeed(speed: number) {
        const api = apiRef.current
        if (api) api.playbackSpeed = speed
      },
      get api() {
        return apiRef.current
      },
    }),
    [mode],
  )

  function selectTrack(index: number) {
    const api = apiRef.current
    if (!api?.score || !api.score.tracks[index]) return
    setActiveTrack(index)
    api.renderTracks([api.score.tracks[index]])
  }

  return (
    <div className="relative">
      {trackNames.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {trackNames.map((name, i) => (
            <button
              key={i}
              onClick={() => selectTrack(i)}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] transition ${
                i === activeTrack
                  ? 'bg-amp-500 font-bold text-stage-950'
                  : 'bg-stage-800 text-stage-300 hover:text-amp-300'
              }`}
            >
              {name || `Track ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div
        ref={scrollRef}
        className="relative max-h-[520px] overflow-y-auto rounded-xl border border-stage-700/60 bg-stage-900/80"
        data-testid="tab-scroll"
      >
        {rendering && (
          <p className="animate-glow-pulse absolute inset-x-0 top-10 z-10 text-center font-mono text-xs uppercase tracking-widest text-amp-300">
            Rendering score…
          </p>
        )}
        <div ref={hostRef} className="[&_.at-cursor-bar]:bg-amp-500/15 [&_.at-cursor-beat]:bg-amp-400 [&_.at-selection_div]:bg-amp-300/20" />
      </div>
    </div>
  )
}

/** One sync point at the start of every master bar pins AlphaTab's external
 * time axis to our linear BPM+offset model (exact for constant-tempo audio). */
function applySyncPoints(api: alphaTab.AlphaTabApi, sync: SyncModel | undefined): void {
  const score = api.score
  if (!score || !sync) return
  try {
    for (const masterBar of score.masterBars) {
      masterBar.syncPoints = undefined
      const automation = new alphaTab.model.Automation()
      automation.type = alphaTab.model.AutomationType.SyncPoint
      automation.ratioPosition = 0
      const data = new alphaTab.model.SyncPointData()
      data.barOccurence = 0
      data.millisecondOffset = tickToSeconds(masterBar.start, sync) * 1000
      automation.syncPointValue = data
      masterBar.addSyncPoint(automation)
    }
    api.updateSyncPoints()
  } catch (err) {
    console.error('applying sync points failed', err)
  }
}

export { secondsToTick, tickToSeconds }
export type { SyncModel }
