/**
 * Tab & notation panel of the practice workspace: import Guitar Pro /
 * MusicXML / alphaTex files, view them with AlphaTab, and either play them
 * on AlphaTab's synth (Mode A) or follow the real stem audio with the cursor
 * via the manual BPM+offset sync model (Mode B).
 *
 * Phase 6 adds the correction editor: an "Edit" toggle wraps the viewer in a
 * TabEditor engine (alphaTex snapshots + command pattern), with click/keyboard
 * selection, note mutations, undo/redo, debounced autosave to the backend,
 * bar audition on the synth, and "loop bar" which drives the real-audio A-B
 * loop at 0.5x with the transcribed stem soloed.
 */
import * as alphaTab from '@coderline/alphatab'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { StemPlayerApi } from '../../hooks/useStemPlayer'
import {
  deleteTranscription,
  listTranscriptions,
  patchTranscription,
  saveTranscriptionContent,
  uploadTranscription,
  type Transcription,
} from '../../lib/api'
import {
  CommandError,
  deleteNote,
  insertNote,
  moveString,
  setDuration,
  setFret,
  shiftPitch,
  TabEditor,
  toggleBend,
  toggleHammer,
  toggleLock,
  togglePalmMute,
  toggleSlide,
  toggleVibrato,
  type EditorCommand,
} from '../../tab/editor/engine'
import { TabViewer, type TabViewerHandle } from '../../tab/TabViewer'
import { secondsToTick, tickToSeconds, type SyncModel } from '../../tab/sync'
import { useToast } from '../Toasts'
import { TabEditorPanel, type SaveState } from './TabEditorPanel'

interface Props {
  videoId: string
  player: StemPlayerApi
  /** A transcription created outside this panel (AI draft) — adopt & select it. */
  newTranscription?: Transcription | null
}

type TabMode = 'synth' | 'audio'

const SYNTH_SPEEDS = [0.5, 0.7, 0.85, 1]
const AUTOSAVE_MS = 1200

const DURATION_STEPS = [
  alphaTab.model.Duration.Whole,
  alphaTab.model.Duration.Half,
  alphaTab.model.Duration.Quarter,
  alphaTab.model.Duration.Eighth,
  alphaTab.model.Duration.Sixteenth,
  alphaTab.model.Duration.ThirtySecond,
]

function parseLocks(metaJson: string | null): string[] {
  if (!metaJson) return []
  try {
    const meta = JSON.parse(metaJson) as { locks?: string[] }
    return Array.isArray(meta.locks) ? meta.locks : []
  } catch {
    return []
  }
}

function stemFromParams(paramsJson: string | null): string {
  if (!paramsJson) return 'guitar'
  try {
    return (JSON.parse(paramsJson) as { stem?: string }).stem ?? 'guitar'
  } catch {
    return 'guitar'
  }
}

export function TabSection({ videoId, player, newTranscription }: Props) {
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
  const sectionRef = useRef<HTMLElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const scoreTempoRef = useRef<number | null>(null)

  // --- editor state ---
  const [editing, setEditing] = useState(false)
  const [editorRev, setEditorRev] = useState(0)
  const [saveState, setSaveState] = useState<SaveState>('clean')
  const [fileVersion, setFileVersion] = useState(0)
  const editorRef = useRef<TabEditor | null>(null)
  const editorUnsubRef = useRef<(() => void) | null>(null)
  const lastRenderedTexRef = useRef<string | null>(null)
  const frozenFileUrlRef = useRef<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const fretBufRef = useRef<{ value: number; at: number }>({ value: 0, at: 0 })

  const selected = transcriptions.find((t) => t.id === selectedId) ?? null
  const selectedRef = useRef(selected)
  selectedRef.current = selected

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

  // Adopt AI drafts finished by the per-stem transcribe buttons.
  useEffect(() => {
    if (!newTranscription) return
    setTranscriptions((list) =>
      list.some((t) => t.id === newTranscription.id) ? list : [...list, newTranscription],
    )
    setSelectedId(newTranscription.id)
  }, [newTranscription])

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

  // --- editor plumbing -----------------------------------------------------

  const doSave = useCallback(async () => {
    const editor = editorRef.current
    const sel = selectedRef.current
    if (!editor || !sel) return
    const texAtSave = editor.tex
    setSaveState('saving')
    try {
      const res = await saveTranscriptionContent(sel.id, {
        alphatex: texAtSave,
        meta_json: JSON.stringify({ locks: [...editor.locks] }),
      })
      setTranscriptions((list) =>
        list.map((t) => (t.id === res.transcription.id ? res.transcription : t)),
      )
      setFileVersion((v) => v + 1)
      // edits may have landed while the request was in flight
      if (editorRef.current?.tex === texAtSave) {
        editorRef.current?.markSaved()
        setSaveState('saved')
      } else {
        setSaveState('dirty')
      }
    } catch (err) {
      setSaveState('error')
      toast('error', `Save failed: ${err instanceof Error ? err.message : err}`)
    }
  }, [toast])

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current != null) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => void doSave(), AUTOSAVE_MS)
  }, [doSave])

  useEffect(
    () => () => {
      if (saveTimerRef.current != null) window.clearTimeout(saveTimerRef.current)
    },
    [],
  )

  const handleEditorChange = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    setEditorRev((r) => r + 1)
    if (editor.tex !== lastRenderedTexRef.current) {
      lastRenderedTexRef.current = editor.tex
      viewerRef.current?.renderScore(editor.score)
    }
    if (editor.dirty) {
      setSaveState('dirty')
      scheduleSave()
    }
  }, [scheduleSave])

  function startEditing() {
    const api = viewerRef.current?.api
    const score = api?.score
    if (!score) {
      toast('error', 'Score is still loading — try again in a moment')
      return
    }
    if (score.tracks.length !== 1) {
      toast('error', 'Editing supports single-track scores (AI drafts) for now')
      return
    }
    let editor: TabEditor
    try {
      editor = TabEditor.fromScore(score, parseLocks(selected?.meta_json ?? null))
    } catch (err) {
      toast('error', `Cannot edit this score: ${err instanceof Error ? err.message : err}`)
      return
    }
    editorRef.current = editor
    editorUnsubRef.current = editor.onChange(handleEditorChange)
    lastRenderedTexRef.current = editor.tex
    frozenFileUrlRef.current = fileUrl // keep the viewer stable while editing
    viewerRef.current?.renderScore(editor.score)
    setSaveState('clean')
    setEditorRev((r) => r + 1)
    setEditing(true)
    setTimeout(() => sectionRef.current?.focus({ preventScroll: true }), 0)
  }

  async function stopEditing() {
    if (saveTimerRef.current != null) window.clearTimeout(saveTimerRef.current)
    const editor = editorRef.current
    if (editor && (editor.dirty || saveState === 'dirty' || saveState === 'error')) {
      await doSave()
    }
    editorUnsubRef.current?.()
    editorUnsubRef.current = null
    editorRef.current = null
    frozenFileUrlRef.current = null
    lastRenderedTexRef.current = null
    setEditing(false)
  }

  const dispatch = useCallback(
    (cmd: EditorCommand) => {
      const editor = editorRef.current
      if (!editor) return
      try {
        editor.apply(cmd)
      } catch (err) {
        if (err instanceof CommandError) toast('error', err.message)
        else throw err
      }
    },
    [toast],
  )

  function audition() {
    const editor = editorRef.current
    const sel = editor?.selection
    if (!editor || !sel) return
    const { startTick, endTick } = editor.barTickRange(sel.bar)
    viewerRef.current?.playTickRange(startTick, endTick)
    console.log(`[audition] bar ${sel.bar + 1} → synth ticks ${startTick}–${endTick}`)
  }

  function loopSelection() {
    const editor = editorRef.current
    const sel = editor?.selection
    if (!editor || !sel) return
    const { startTick, endTick } = editor.barTickRange(sel.bar)
    const a = Math.max(0, tickToSeconds(startTick, sync))
    const b = tickToSeconds(endTick, sync)
    if (!(b > a)) return
    if (mode !== 'audio') setMode('audio')
    const stem = stemFromParams(selected?.params_json ?? null)
    player.setLoop(a, b)
    player.setRate(0.5)
    if (player.mix[stem] && !player.mix[stem].soloed) player.toggleSolo(stem)
    player.seek(a)
    void player.play()
    console.log(
      `[editloop] bar ${sel.bar + 1} → A-B ${a.toFixed(2)}s–${b.toFixed(2)}s @0.5x solo=${stem}`,
    )
    toast('info', `Looping bar ${sel.bar + 1} at 0.5x, ${stem} soloed`)
  }

  function stepDuration(dir: -1 | 1) {
    const editor = editorRef.current
    const sel = editor?.selection
    const beat = sel ? editor?.beatAt(sel) : null
    if (!beat) return
    const idx = DURATION_STEPS.indexOf(beat.duration)
    const next = DURATION_STEPS[idx + dir]
    if (next !== undefined) dispatch(setDuration(next))
  }

  function handleFretDigit(digit: number) {
    const editor = editorRef.current
    const sel = editor?.selection
    if (!editor || !sel || sel.string == null) return
    const now = performance.now()
    const buf = fretBufRef.current
    let value = digit
    if (now - buf.at < 800) {
      const combined = buf.value * 10 + digit
      if (combined <= 24) value = combined
    }
    fretBufRef.current = { value, at: now }
    const note = editor.noteAt(sel)
    dispatch(note ? setFret(value) : insertNote(value))
  }

  function handleEditorKeys(e: React.KeyboardEvent) {
    const editor = editorRef.current
    if (!editing || !editor) return
    const t = e.target as HTMLElement
    if (t instanceof HTMLInputElement || t instanceof HTMLSelectElement || t instanceof HTMLTextAreaElement)
      return
    const key = e.key
    const mod = e.ctrlKey || e.metaKey
    if (mod && key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault()
      editor.undo()
      return
    }
    if (mod && (key.toLowerCase() === 'y' || (key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault()
      editor.redo()
      return
    }
    if (mod && key.toLowerCase() === 's') {
      e.preventDefault()
      void doSave()
      return
    }
    if (mod || e.altKey) return
    switch (key) {
      case 'ArrowLeft':
        e.preventDefault()
        editor.moveBeat(-1)
        return
      case 'ArrowRight':
        e.preventDefault()
        editor.moveBeat(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        if (e.shiftKey) dispatch(moveString(1))
        else editor.moveStringSelection(1)
        return
      case 'ArrowDown':
        e.preventDefault()
        if (e.shiftKey) dispatch(moveString(-1))
        else editor.moveStringSelection(-1)
        return
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        dispatch(deleteNote())
        return
      case 'i':
        dispatch(insertNote(0))
        return
      case '+':
      case '=':
        dispatch(shiftPitch(1))
        return
      case '-':
        dispatch(shiftPitch(-1))
        return
      case 'h':
        dispatch(toggleHammer())
        return
      case 's':
        dispatch(toggleSlide())
        return
      case 'b':
        dispatch(toggleBend('full'))
        return
      case 'B':
        dispatch(toggleBend('half'))
        return
      case 'p':
        dispatch(togglePalmMute())
        return
      case 'v':
        dispatch(toggleVibrato())
        return
      case 'k':
        dispatch(toggleLock())
        return
      case '[':
        stepDuration(1)
        return
      case ']':
        stepDuration(-1)
        return
    }
    if (/^[0-9]$/.test(key)) handleFretDigit(Number(key))
  }

  // --- upload/delete -------------------------------------------------------

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

  const liveFileUrl = selected
    ? `${selected.file_url}${selected.source === 'edited' ? `?v=${fileVersion}` : ''}`
    : ''
  const fileUrl = editing && frozenFileUrlRef.current ? frozenFileUrlRef.current : liveFileUrl
  const editor = editorRef.current

  return (
    <section
      ref={sectionRef}
      className="mt-6 rounded-xl border border-stage-700/60 bg-stage-900/60 p-4 outline-none"
      tabIndex={editing ? 0 : -1}
      onKeyDown={handleEditorKeys}
    >
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-stage-500">
          Tab &amp; notation
        </h3>
        {selected?.source === 'generated' && (
          <span
            className="rounded-md border border-amp-500/50 bg-amp-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amp-300"
            title="Auto-transcribed by AI — a draft to correct, not gospel"
          >
            AI draft
          </span>
        )}
        {selected?.source === 'edited' && (
          <span
            className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300"
            title="Corrected by you — saved as alphaTex"
          >
            Edited
          </span>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {transcriptions.length > 0 && (
            <select
              value={selectedId ?? ''}
              disabled={editing}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="rounded-lg border border-stage-700 bg-stage-800 px-2 py-1.5 font-mono text-xs text-stage-100 disabled:opacity-50"
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
              disabled={editing}
              className="rounded-lg border border-stage-700 px-2 py-1.5 font-mono text-xs text-stage-300 transition hover:border-rose-500/60 hover:text-rose-300 disabled:opacity-50"
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
            disabled={uploading || editing}
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

            {!editing && (
              <button
                onClick={startEditing}
                className="rounded-lg border border-amp-500/50 bg-amp-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amp-300 transition hover:bg-amp-500/20"
                data-testid="edit-toggle"
              >
                ✎ Edit
              </button>
            )}

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
                  {editing
                    ? 'click a note to select it · loop follows the sync model'
                    : 'click a bar to seek · drag-select for A-B loop'}
                </span>
              </div>
            )}
          </div>

          {editing && editor && (
            <TabEditorPanel
              editor={editor}
              rev={editorRev}
              dispatch={dispatch}
              onUndo={() => editorRef.current?.undo()}
              onRedo={() => editorRef.current?.redo()}
              onSaveNow={() => void doSave()}
              saveState={saveState}
              onAudition={audition}
              auditionEnabled={mode === 'synth'}
              onLoopSelection={loopSelection}
              onExit={() => void stopEditing()}
            />
          )}

          <div className="mt-3">
            <TabViewer
              key={`${selected.id}`}
              fileUrl={fileUrl}
              mode={mode}
              sync={sync}
              media={media}
              handleRef={viewerRef}
              editable={editing}
              selection={editing ? (editorRef.current?.selection ?? null) : null}
              onNoteSelect={(sel) => {
                editorRef.current?.setSelection(sel)
                // AlphaTab prevents default on mousedown, so the click never
                // focuses our wrapper — arm the keyboard shortcuts manually
                sectionRef.current?.focus({ preventScroll: true })
              }}
              onScoreLoaded={(info) => {
                scoreTempoRef.current = info.tempo
                // first-time sync setup: default the audio BPM to the score's tempo
                if (selected.sync_bpm == null) setBpm(info.tempo)
                // a mode switch remounts AlphaTab from the (stale) file — put
                // the live edited score back
                const ed = editorRef.current
                const api = viewerRef.current?.api
                if (ed && api && api.score !== ed.score) {
                  lastRenderedTexRef.current = ed.tex
                  viewerRef.current?.renderScore(ed.score)
                }
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
