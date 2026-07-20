/**
 * Editing toolbar for the tab correction editor: note properties (fret,
 * string, pitch, duration), insert/delete, technique toggles, undo/redo and
 * save state. Pure presentation — every action dispatches a TabEditor
 * command via the callbacks; keyboard shortcuts live in TabSection so they
 * work while the tab itself has focus.
 */
import * as alphaTab from '@coderline/alphatab'

import {
  deleteNote,
  insertNote,
  moveString,
  setDuration,
  shiftPitch,
  toggleBend,
  toggleHammer,
  toggleLock,
  togglePalmMute,
  toggleSlide,
  toggleVibrato,
  type EditorCommand,
  type TabEditor,
} from '../../tab/editor/engine'

export type SaveState = 'clean' | 'dirty' | 'saving' | 'saved' | 'error'

interface Props {
  editor: TabEditor
  /** Bumped by TabSection on every editor change so this panel re-renders. */
  rev: number
  dispatch(cmd: EditorCommand): void
  onUndo(): void
  onRedo(): void
  onSaveNow(): void
  saveState: SaveState
  onAudition(): void
  auditionEnabled: boolean
  onLoopSelection(): void
  onExit(): void
}

const DURATIONS: Array<[string, alphaTab.model.Duration]> = [
  ['𝅗𝅥', alphaTab.model.Duration.Half],
  ['𝅘𝅥', alphaTab.model.Duration.Quarter],
  ['𝅘𝅥𝅮', alphaTab.model.Duration.Eighth],
  ['𝅘𝅥𝅯', alphaTab.model.Duration.Sixteenth],
]

function Btn({
  label,
  title,
  onClick,
  active = false,
  disabled = false,
}: {
  label: string
  title: string
  onClick(): void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded-md px-2 py-1 font-mono text-xs transition disabled:opacity-30 ${
        active
          ? 'bg-amp-500 font-bold text-stage-950'
          : 'bg-stage-800 text-stage-200 hover:text-amp-300'
      }`}
    >
      {label}
    </button>
  )
}

const SAVE_LABEL: Record<SaveState, string> = {
  clean: 'saved',
  dirty: 'unsaved…',
  saving: 'saving…',
  saved: 'saved ✓',
  error: 'save failed — retry',
}

export function TabEditorPanel({
  editor,
  rev: _rev,
  dispatch,
  onUndo,
  onRedo,
  onSaveNow,
  saveState,
  onAudition,
  auditionEnabled,
  onLoopSelection,
  onExit,
}: Props) {
  const sel = editor.selection
  const note = sel ? editor.noteAt(sel) : null
  const beat = sel ? editor.beatAt(sel) : null
  const hasBend = (v: number) => note?.bendPoints?.some((p) => p.value === v) ?? false
  const locked =
    sel?.string != null && editor.locks.has(`${sel.bar}:${sel.beat}:${sel.string}`)

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-amp-500/30 bg-stage-900/80 p-3"
      data-testid="editor-panel"
    >
      <span className="font-mono text-[11px] text-stage-300">
        {sel
          ? `bar ${sel.bar + 1} · beat ${sel.beat + 1}` +
            (sel.string != null ? ` · str ${sel.string}` : '') +
            (note ? ` · fret ${note.fret}` : beat?.isRest ? ' · rest' : '')
          : 'click a note to edit'}
      </span>

      <div className="flex items-center gap-1" title="Fret / pitch">
        <Btn label="fret −" title="Pitch down a semitone on this string (-)" onClick={() => dispatch(shiftPitch(-1))} disabled={!note} />
        <Btn label="fret +" title="Pitch up a semitone on this string (+)" onClick={() => dispatch(shiftPitch(1))} disabled={!note} />
        <Btn label="str ↑" title="Move to higher string, same pitch (Shift+↑)" onClick={() => dispatch(moveString(1))} disabled={!note} />
        <Btn label="str ↓" title="Move to lower string, same pitch (Shift+↓)" onClick={() => dispatch(moveString(-1))} disabled={!note} />
      </div>

      <div className="flex items-center gap-1" title="Duration">
        {DURATIONS.map(([glyph, d]) => (
          <Btn
            key={d}
            label={glyph}
            title="Set beat duration"
            onClick={() => dispatch(setDuration(d))}
            active={beat?.duration === d}
            disabled={!beat}
          />
        ))}
      </div>

      <div className="flex items-center gap-1">
        <Btn
          label="+ note"
          title="Insert note at selected string (i), or on a rest"
          onClick={() => dispatch(insertNote(0))}
          disabled={!sel || sel.string == null || !!note}
        />
        <Btn label="✕ note" title="Delete note — last note leaves a rest (Del)" onClick={() => dispatch(deleteNote())} disabled={!note} />
      </div>

      <div className="flex items-center gap-1" title="Techniques">
        <Btn label="H" title="Hammer-on / pull-off (h)" onClick={() => dispatch(toggleHammer())} active={!!note?.isHammerPullOrigin} disabled={!note} />
        <Btn label="/" title="Slide to next note (s)" onClick={() => dispatch(toggleSlide())} active={note?.slideOutType === alphaTab.model.SlideOutType.Shift} disabled={!note} />
        <Btn label="b" title="Full bend (b)" onClick={() => dispatch(toggleBend('full'))} active={hasBend(4)} disabled={!note} />
        <Btn label="½b" title="Half bend (Shift+B)" onClick={() => dispatch(toggleBend('half'))} active={hasBend(2)} disabled={!note} />
        <Btn label="PM" title="Palm mute (p)" onClick={() => dispatch(togglePalmMute())} active={!!note?.isPalmMute} disabled={!note} />
        <Btn label="~" title="Vibrato (v)" onClick={() => dispatch(toggleVibrato())} active={note != null && note.vibrato !== alphaTab.model.VibratoType.None} disabled={!note} />
        <Btn label="🔒" title="Lock string assignment (k)" onClick={() => dispatch(toggleLock())} active={locked} disabled={!note} />
      </div>

      <div className="flex items-center gap-1">
        <Btn label="↶" title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!editor.canUndo} />
        <Btn label="↷" title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!editor.canRedo} />
      </div>

      <div className="flex items-center gap-1">
        <Btn label="▶ bar" title="Audition the selected bar on the synth" onClick={onAudition} disabled={!sel || !auditionEnabled} />
        <Btn label="⟳ loop bar @0.5x" title="A-B loop the selected bar in the real audio at half speed with the stem soloed" onClick={onLoopSelection} disabled={!sel} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onSaveNow}
          className={`font-mono text-[11px] ${
            saveState === 'error'
              ? 'text-rose-300 underline'
              : saveState === 'dirty'
                ? 'text-amp-300'
                : 'text-stage-500'
          }`}
          title="Save now (Ctrl+S) — also autosaves after each pause"
        >
          {SAVE_LABEL[saveState]}
        </button>
        <Btn label="Done" title="Exit editing (saves first)" onClick={onExit} />
      </div>

      <p className="w-full font-mono text-[10px] leading-relaxed text-stage-500">
        keys: ←→ beat · ↑↓ string · 0–9 fret · +/− pitch · Shift+↑↓ move string · i insert ·
        Del delete · h/s/b/B/p/v/k techniques · [ ] duration · Ctrl+Z/Y undo/redo · Ctrl+S save
      </p>
    </div>
  )
}
