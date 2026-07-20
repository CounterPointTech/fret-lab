/**
 * Tab & notation panel of the practice workspace: import Guitar Pro /
 * MusicXML / alphaTex files, view them with AlphaTab, and either play them
 * on AlphaTab's synth (Mode A) or follow the real stem audio with the cursor
 * via the manual BPM+offset sync model (Mode B).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { StemPlayerApi } from '../../hooks/useStemPlayer'
import {
  deleteTranscription,
  listTranscriptions,
  patchTranscription,
  uploadTranscription,
  type Transcription,
} from '../../lib/api'
import { TabViewer, type TabViewerHandle } from '../../tab/TabViewer'
import { secondsToTick, type SyncModel } from '../../tab/sync'
import { useToast } from '../Toasts'

interface Props {
  videoId: string
  player: StemPlayerApi
}

type TabMode = 'synth' | 'audio'

const SYNTH_SPEEDS = [0.5, 0.7, 0.85, 1]

export function TabSection({ videoId, player }: Props) {
  const toast = useToast()
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mode, setMode] = useState<TabMode>('synth')
  const [uploading, setUploading] = useState(false)
  const [synthPlaying, setSynthPlaying] = useState(false)
  const [synthSpeed, setSynthSpeedState] = useState(1)
  const [bpm, setBpm] = useState<number>(120)
  const [offsetMs, setOffsetMs] = useState<number>(0)
  const viewerRef = useRef<TabViewerHandle | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scoreTempoRef = useRef<number | null>(null)

  const selected = transcriptions.find((t) => t.id === selectedId) ?? null

  const refresh = useCallback(async () => {
    try {
      const data = await listTranscriptions(videoId)
      setTranscriptions(data.transcriptions)
      setSelectedId((prev) =>
        prev != null && data.transcriptions.some((t) => t.id === prev)
          ? prev
          : (data.transcriptions[0]?.id ?? null),
      )
    } catch (err) {
      toast('error', `Could not load transcriptions: ${err instanceof Error ? err.message : err}`)
    }
  }, [videoId, toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Adopt the persisted sync model whenever another transcription is selected.
  useEffect(() => {
    if (!selected) return
    setBpm(selected.sync_bpm ?? scoreTempoRef.current ?? 120)
    setOffsetMs(Math.round(selected.sync_offset_s * 1000))
    setSynthPlaying(false)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const sync: SyncModel = useMemo(
    () => ({ audioBpm: bpm > 0 ? bpm : 120, offsetS: offsetMs / 1000 }),
    [bpm, offsetMs],
  )

  // Persist sync edits (debounced) so they survive reloads — Mode B state is
  // per-transcription data, not UI state.
  const persistTimer = useRef<number | null>(null)
  useEffect(() => {
    if (!selected) return
    if (selected.sync_bpm === bpm && Math.round(selected.sync_offset_s * 1000) === offsetMs) return
    if (persistTimer.current != null) window.clearTimeout(persistTimer.current)
    const id = selected.id
    persistTimer.current = window.setTimeout(() => {
      patchTranscription(id, { sync_bpm: bpm, sync_offset_s: offsetMs / 1000 })
        .then((res) =>
          setTranscriptions((list) =>
            list.map((t) => (t.id === id ? res.transcription : t)),
          ),
        )
        .catch((err: unknown) =>
          toast('error', `Could not save sync: ${err instanceof Error ? err.message : err}`),
        )
    }, 600)
    return () => {
      if (persistTimer.current != null) window.clearTimeout(persistTimer.current)
    }
  }, [bpm, offsetMs, selected, toast])

  // Mode B: drive the AlphaTab cursor from the real-audio transport at ~30Hz,
  // with a 1Hz mapping log (audio seconds → score tick) for verification.
  useEffect(() => {
    const stemPlayer = player.player
    if (mode !== 'audio' || !stemPlayer) return
    let lastPush = 0
    let lastLog = 0
    const unsub = stemPlayer.onTick((pos) => {
      const now = performance.now()
      if (now - lastPush > 33) {
        lastPush = now
        viewerRef.current?.setCursorTime(pos)
      }
      if (now - lastLog > 1000) {
        lastLog = now
        console.log(
          `[tabsync] audio=${pos.toFixed(2)}s rate=${stemPlayer.rate.toFixed(2)}x ` +
            `bpm=${sync.audioBpm} offset=${sync.offsetS.toFixed(3)}s → tick=${Math.round(secondsToTick(pos, sync))}`,
        )
      }
    })
    viewerRef.current?.setCursorTime(stemPlayer.position)
    return unsub
  }, [mode, player.player, sync])

  // Mirror play/pause state so AlphaTab animates its cursor in Mode B.
  useEffect(() => {
    if (mode === 'audio') viewerRef.current?.setPlaying(player.playing)
  }, [mode, player.playing])

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const res = await uploadTranscription(videoId, file)
      setTranscriptions((list) => [...list, res.transcription])
      setSelectedId(res.transcription.id)
      toast('info', `Imported ${res.transcription.name}`)
    } catch (err) {
      toast('error', `Import failed: ${err instanceof Error ? err.message : err}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    try {
      await deleteTranscription(selected.id)
      setTranscriptions((list) => list.filter((t) => t.id !== selected.id))
      setSelectedId(null)
    } catch (err) {
      toast('error', `Delete failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  const media = {
    durationS: player.duration,
    playbackRate: player.rate,
    onPlay: () => void player.play(),
    onPause: player.pause,
    onSeek: (s: number) => player.seek(Math.max(0, s)),
    onRateChange: player.setRate,
  }

  return (
    <section className="mt-6 rounded-xl border border-stage-700/60 bg-stage-900/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-stage-500">
          Tab &amp; notation
        </h3>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {transcriptions.length > 0 && (
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="rounded-lg border border-stage-700 bg-stage-800 px-2 py-1.5 font-mono text-xs text-stage-100"
            >
              {transcriptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          {selected && (
            <button
              onClick={handleDelete}
              className="rounded-lg border border-stage-700 px-2 py-1.5 font-mono text-xs text-stage-300 transition hover:border-rose-500/60 hover:text-rose-300"
              title="Delete this transcription"
            >
              ✕
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".gp,.gp3,.gp4,.gp5,.gpx,.musicxml,.mxl,.xml,.alphatex,.atex"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-amp-500 px-3 py-1.5 font-mono text-xs font-bold text-stage-950 transition hover:bg-amp-400 disabled:opacity-50"
          >
            {uploading ? 'Importing…' : '+ Import tab'}
          </button>
        </div>
      </div>

      {!selected ? (
        <p className="mt-4 rounded-xl border border-dashed border-stage-700 p-5 text-sm text-stage-300">
          Import a Guitar Pro (.gp3–.gpx), MusicXML or alphaTex file to see tab and
          sheet music for this song.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-stage-700">
              {(['synth', 'audio'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 font-mono text-xs transition ${
                    mode === m
                      ? 'bg-amp-500 font-bold text-stage-950'
                      : 'bg-stage-800 text-stage-300 hover:text-amp-300'
                  }`}
                >
                  {m === 'synth' ? '♪ Synth playback' : '🎧 Follow audio'}
                </button>
              ))}
            </div>

            {mode === 'synth' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    viewerRef.current?.playPause()
                    setSynthPlaying((p) => !p)
                  }}
                  className="rounded-lg bg-stage-800 px-3 py-1.5 font-mono text-xs text-amp-300 transition hover:bg-stage-700"
                >
                  {synthPlaying ? '⏸ Pause' : '▶ Play synth'}
                </button>
                <select
                  value={synthSpeed}
                  onChange={(e) => {
                    const speed = Number(e.target.value)
                    setSynthSpeedState(speed)
                    viewerRef.current?.setSynthSpeed(speed)
                  }}
                  className="rounded-lg border border-stage-700 bg-stage-800 px-2 py-1.5 font-mono text-xs text-stage-100"
                >
                  {SYNTH_SPEEDS.map((s) => (
                    <option key={s} value={s}>
                      {s}x
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2" data-testid="sync-editor">
                <label className="flex items-center gap-1.5 font-mono text-xs text-stage-300">
                  audio BPM
                  <input
                    type="number"
                    min={20}
                    max={300}
                    step={0.5}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-20 rounded-lg border border-stage-700 bg-stage-800 px-2 py-1.5 text-stage-100"
                  />
                </label>
                <div className="flex items-center gap-1 font-mono text-xs text-stage-300">
                  offset
                  <span className="w-16 text-right text-stage-100">
                    {(offsetMs / 1000).toFixed(2)}s
                  </span>
                  {[-1000, -100, +100, +1000].map((d) => (
                    <button
                      key={d}
                      onClick={() => setOffsetMs((o) => o + d)}
                      className="rounded-md bg-stage-800 px-1.5 py-1 transition hover:text-amp-300"
                      title={`${d > 0 ? '+' : ''}${d} ms`}
                    >
                      {d > 0 ? `+${d / 1000}` : d / 1000}
                    </button>
                  ))}
                </div>
                <span className="font-mono text-[10px] text-stage-500">
                  click a bar to seek · drag-select for A-B loop
                </span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <TabViewer
              key={`${selected.id}`}
              fileUrl={selected.file_url}
              mode={mode}
              sync={sync}
              media={media}
              handleRef={viewerRef}
              onScoreLoaded={(info) => {
                scoreTempoRef.current = info.tempo
                // first-time sync setup: default the audio BPM to the score's tempo
                if (selected.sync_bpm == null) setBpm(info.tempo)
              }}
              onBarClick={(seconds, tick) => {
                console.log(
                  `[tabclick] tick=${tick} → audio=${seconds.toFixed(2)}s (seek StemPlayer)`,
                )
                player.seek(Math.max(0, seconds))
              }}
              onSelectionLoop={(a, b) => {
                if (b - a > 0.2) {
                  console.log(`[tabloop] selection → A-B loop ${a.toFixed(2)}s – ${b.toFixed(2)}s`)
                  player.setLoop(Math.max(0, a), b)
                }
              }}
              onError={(msg) => toast('error', `AlphaTab: ${msg}`)}
            />
          </div>
        </>
      )}
    </section>
  )
}
