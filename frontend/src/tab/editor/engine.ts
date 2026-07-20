/**
 * TabEditor — the correction-editor engine over AlphaTab's score model.
 *
 * Design: alphaTex is the single source of truth. Every command mutates the
 * live score model, then the engine *normalizes* by exporting to alphaTex and
 * re-importing (AlphaTab's importer runs the full `finish()` pass, so derived
 * state — hammer/pull links, tie chains, rests — is always consistent, and an
 * edit that cannot serialize fails immediately instead of at save time).
 * Undo/redo are snapshots of that canonical alphaTex, which makes
 * apply/undo symmetry structural rather than something each command must
 * implement correctly.
 *
 * String numbering follows the AlphaTab model: string 1 = lowest (thickest).
 * `staff.tuning[0]` is the *highest* string, so tuning lookups invert.
 */
import * as alphaTab from '@coderline/alphatab'

export interface Selection {
  /** bar index in the score (masterBar index) */
  bar: number
  /** beat index within voice 0 of the bar */
  beat: number
  /** model string number (1 = lowest); null = beat-level selection (rest) */
  string: number | null
}

interface Snapshot {
  tex: string
  selection: Selection | null
  locks: string[]
}

/** A user-visible, recoverable rule violation (e.g. pitch not playable). */
export class CommandError extends Error {}

export interface CommandContext {
  score: alphaTab.model.Score
  staff: alphaTab.model.Staff
  beat: alphaTab.model.Beat
  /** Note at the selected string, if any. */
  note: alphaTab.model.Note | null
  selection: Selection
  locks: Set<string>
}

export interface EditorCommand {
  label: string
  apply(ctx: CommandContext): void
}

/** MIDI value of a string's open note. `string` is 1 = lowest. */
export function stringTuning(tuning: readonly number[], string: number): number {
  const idx = tuning.length - string
  const value = tuning[idx]
  if (value === undefined) throw new CommandError(`No string ${string} on this staff`)
  return value
}

/**
 * Fret needed to play `realValue` on `string` (1 = lowest), or null when the
 * pitch is not playable there (fret out of 0..maxFret).
 */
export function fretForString(
  realValue: number,
  tuning: readonly number[],
  string: number,
  maxFret = 24,
): number | null {
  const fret = realValue - stringTuning(tuning, string)
  return fret >= 0 && fret <= maxFret ? fret : null
}

export function lockKey(sel: { bar: number; beat: number; string: number }): string {
  return `${sel.bar}:${sel.beat}:${sel.string}`
}

const MAX_UNDO = 200
const LOCK_COLOR = '#22d3ee' // cyan — distinct from selection amber

function exportTex(score: alphaTab.model.Score): string {
  return new alphaTab.exporter.AlphaTexExporter().exportToString(score, new alphaTab.Settings())
}

function importTex(tex: string): alphaTab.model.Score {
  return alphaTab.importer.ScoreLoader.loadAlphaTex(tex, new alphaTab.Settings())
}

export class TabEditor {
  private _score: alphaTab.model.Score
  private _tex: string
  private _selection: Selection | null = null
  private _locks: Set<string>
  private _undo: Snapshot[] = []
  private _redo: Snapshot[] = []
  private _dirty = false
  private _listeners = new Set<() => void>()

  constructor(tex: string, locks: string[] = []) {
    this._locks = new Set(locks)
    // normalize the incoming tex once so undo baselines compare stably
    const score = importTex(tex)
    this._tex = exportTex(score)
    this._score = this._tex === tex ? score : importTex(this._tex)
    this.applyLockStyles()
  }

  /** Build an editor from an already-loaded score (first edit of a draft). */
  static fromScore(score: alphaTab.model.Score, locks: string[] = []): TabEditor {
    return new TabEditor(exportTex(score), locks)
  }

  get score(): alphaTab.model.Score {
    return this._score
  }
  get tex(): string {
    return this._tex
  }
  get selection(): Selection | null {
    return this._selection
  }
  get locks(): ReadonlySet<string> {
    return this._locks
  }
  get canUndo(): boolean {
    return this._undo.length > 0
  }
  get canRedo(): boolean {
    return this._redo.length > 0
  }
  get dirty(): boolean {
    return this._dirty
  }
  markSaved(): void {
    this._dirty = false
    this.emit()
  }

  onChange(cb: () => void): () => void {
    this._listeners.add(cb)
    return () => this._listeners.delete(cb)
  }
  private emit(): void {
    for (const cb of this._listeners) cb()
  }

  // --- selection -----------------------------------------------------------

  private staff(): alphaTab.model.Staff {
    return this._score.tracks[0].staves[0]
  }

  beatAt(sel: Selection): alphaTab.model.Beat | null {
    return this.staff().bars[sel.bar]?.voices[0]?.beats[sel.beat] ?? null
  }

  noteAt(sel: Selection): alphaTab.model.Note | null {
    if (sel.string == null) return null
    const beat = this.beatAt(sel)
    return beat?.notes.find((n) => n.string === sel.string) ?? null
  }

  setSelection(sel: Selection | null): void {
    if (sel && !this.beatAt(sel)) return
    this._selection = sel
    this.emit()
  }

  /** Move selection to previous/next beat (crossing bar boundaries). */
  moveBeat(dir: -1 | 1): void {
    const sel = this._selection
    if (!sel) return
    const bars = this.staff().bars
    let { bar, beat } = sel
    beat += dir
    while (bar >= 0 && bar < bars.length) {
      const beats = bars[bar].voices[0]?.beats ?? []
      if (beat >= 0 && beat < beats.length) {
        this._selection = { bar, beat, string: sel.string }
        this.emit()
        return
      }
      bar += dir
      if (bar < 0 || bar >= bars.length) return
      beat = dir > 0 ? 0 : (bars[bar].voices[0]?.beats.length ?? 1) - 1
    }
  }

  /** Move the selected string position up/down (+1 = physically higher pitch). */
  moveStringSelection(dir: -1 | 1): void {
    const sel = this._selection
    if (!sel) return
    const count = this.staff().tuning.length
    const current = sel.string ?? (dir > 0 ? 0 : count + 1)
    const next = current + dir
    if (next < 1 || next > count) return
    this._selection = { ...sel, string: next }
    this.emit()
  }

  /** Playback tick range of the selected bar span (for audition/looping). */
  barTickRange(fromBar: number, toBar = fromBar): { startTick: number; endTick: number } {
    const bars = this._score.masterBars
    const a = bars[Math.max(0, Math.min(fromBar, bars.length - 1))]
    const b = bars[Math.max(0, Math.min(toBar, bars.length - 1))]
    return { startTick: a.start, endTick: b.start + b.calculateDuration() }
  }

  // --- mutation ------------------------------------------------------------

  /**
   * Run a command against the current selection, then normalize through
   * export→import. Throws CommandError (state untouched) on rule violations —
   * commands must validate before their first mutation.
   */
  apply(cmd: EditorCommand): void {
    const sel = this._selection
    if (!sel) throw new CommandError('Nothing selected')
    const beat = this.beatAt(sel)
    if (!beat) throw new CommandError('Selection is out of date')
    const before: Snapshot = { tex: this._tex, selection: { ...sel }, locks: [...this._locks] }

    cmd.apply({
      score: this._score,
      staff: this.staff(),
      beat,
      note: this.noteAt(sel),
      selection: sel,
      locks: this._locks,
    })

    // normalize: export the mutated model, re-import (full finish() pass),
    // re-export. Probing showed one cycle reaches a fixpoint.
    const t1 = exportTex(this._score)
    let score = importTex(t1)
    let tex = exportTex(score)
    if (tex !== t1) score = importTex(tex)

    this._score = score
    this._tex = tex
    this.applyLockStyles()
    if (tex !== before.tex || this.locksChanged(before.locks)) {
      this._undo.push(before)
      if (this._undo.length > MAX_UNDO) this._undo.shift()
      this._redo = []
      this._dirty = true
    }
    // keep selection valid (command may have retargeted it)
    if (!this.beatAt(sel)) this._selection = null
    this.emit()
  }

  private locksChanged(before: string[]): boolean {
    return before.length !== this._locks.size || before.some((k) => !this._locks.has(k))
  }

  undo(): void {
    const snap = this._undo.pop()
    if (!snap) return
    this._redo.push({ tex: this._tex, selection: this._selection, locks: [...this._locks] })
    this.restore(snap)
  }

  redo(): void {
    const snap = this._redo.pop()
    if (!snap) return
    this._undo.push({ tex: this._tex, selection: this._selection, locks: [...this._locks] })
    this.restore(snap)
  }

  private restore(snap: Snapshot): void {
    this._tex = snap.tex
    this._score = importTex(snap.tex)
    this._locks = new Set(snap.locks)
    this._selection = snap.selection
    this._dirty = true
    this.applyLockStyles()
    this.emit()
  }

  // --- lock visuals --------------------------------------------------------

  /** Tint locked notes so the override is visible in the tab. */
  private applyLockStyles(): void {
    if (this._locks.size === 0) return
    const color = alphaTab.model.Color.fromJson(LOCK_COLOR)
    if (!color) return
    for (const key of this._locks) {
      const [bar, beat, string] = key.split(':').map(Number)
      const note = this.noteAt({ bar, beat, string })
      if (!note) continue
      note.style = new alphaTab.model.NoteStyle()
      note.style.colors.set(alphaTab.model.NoteSubElement.GuitarTabFretNumber, color)
      note.style.colors.set(alphaTab.model.NoteSubElement.StandardNotationNoteHead, color)
    }
  }
}

// --- commands --------------------------------------------------------------

function requireNote(ctx: CommandContext): alphaTab.model.Note {
  if (!ctx.note) throw new CommandError('Select a note first')
  return ctx.note
}

export const MAX_FRET = 24

/** Set the selected note's fret directly (pitch follows the tab). */
export function setFret(fret: number): EditorCommand {
  return {
    label: `fret ${fret}`,
    apply(ctx) {
      const note = requireNote(ctx)
      if (fret < 0 || fret > MAX_FRET) throw new CommandError(`Fret must be 0–${MAX_FRET}`)
      note.fret = fret
    },
  }
}

/** Move the note to an adjacent string, keeping pitch (fret recomputed). */
export function moveString(dir: -1 | 1): EditorCommand {
  return {
    label: dir > 0 ? 'string up' : 'string down',
    apply(ctx) {
      const note = requireNote(ctx)
      const tuning = ctx.staff.tuning
      const target = note.string + dir
      if (target < 1 || target > tuning.length)
        throw new CommandError('Already on the outermost string')
      if (ctx.beat.notes.some((n) => n.string === target))
        throw new CommandError('Target string already has a note')
      const realValue = stringTuning(tuning, note.string) + note.fret
      const fret = fretForString(realValue, tuning, target)
      if (fret == null) throw new CommandError('That pitch is not playable on the target string')
      const oldKey = lockKey({ bar: ctx.selection.bar, beat: ctx.selection.beat, string: note.string })
      note.string = target
      note.fret = fret
      if (ctx.locks.delete(oldKey))
        ctx.locks.add(lockKey({ bar: ctx.selection.bar, beat: ctx.selection.beat, string: target }))
      ctx.selection.string = target
    },
  }
}

/** Shift pitch by semitones on the same string. */
export function shiftPitch(semitones: number): EditorCommand {
  return {
    label: `pitch ${semitones > 0 ? '+' : ''}${semitones}`,
    apply(ctx) {
      const note = requireNote(ctx)
      const fret = note.fret + semitones
      if (fret < 0 || fret > MAX_FRET)
        throw new CommandError('Out of range on this string — move strings instead')
      note.fret = fret
    },
  }
}

/** Change the beat's base duration (dots preserved). */
export function setDuration(duration: alphaTab.model.Duration): EditorCommand {
  return {
    label: 'duration',
    apply(ctx) {
      ctx.beat.duration = duration
    },
  }
}

/** Insert a note at the selected string (works on rests — that's how a rest
 * becomes a note). */
export function insertNote(fret: number): EditorCommand {
  return {
    label: 'insert note',
    apply(ctx) {
      const string = ctx.selection.string
      if (string == null) throw new CommandError('Select a string position first')
      if (fret < 0 || fret > MAX_FRET) throw new CommandError(`Fret must be 0–${MAX_FRET}`)
      if (ctx.beat.notes.some((n) => n.string === string))
        throw new CommandError('That string already has a note here')
      if (string < 1 || string > ctx.staff.tuning.length)
        throw new CommandError('No such string')
      const note = new alphaTab.model.Note()
      note.string = string
      note.fret = fret
      ctx.beat.addNote(note)
    },
  }
}

/** Delete the selected note; deleting the last note leaves a rest. */
export function deleteNote(): EditorCommand {
  return {
    label: 'delete note',
    apply(ctx) {
      const note = requireNote(ctx)
      ctx.beat.removeNote(note)
      ctx.locks.delete(
        lockKey({ bar: ctx.selection.bar, beat: ctx.selection.beat, string: note.string }),
      )
    },
  }
}

/** Toggle hammer-on/pull-off origin. AlphaTab links the destination during
 * finish(); if no next note exists on the string, the flag will not stick. */
export function toggleHammer(): EditorCommand {
  return {
    label: 'hammer/pull',
    apply(ctx) {
      const note = requireNote(ctx)
      note.isHammerPullOrigin = !note.isHammerPullOrigin
    },
  }
}

/** Toggle a shift slide into the next note on the same string. */
export function toggleSlide(): EditorCommand {
  return {
    label: 'slide',
    apply(ctx) {
      const note = requireNote(ctx)
      note.slideOutType =
        note.slideOutType === alphaTab.model.SlideOutType.Shift
          ? alphaTab.model.SlideOutType.None
          : alphaTab.model.SlideOutType.Shift
    },
  }
}

/** Toggle a simple bend: 'full' = whole step, 'half' = half step. Applying a
 * different amount replaces the existing bend; the same amount clears it. */
export function toggleBend(amount: 'full' | 'half'): EditorCommand {
  const value = amount === 'full' ? 4 : 2 // bend values are quarter-tones
  return {
    label: `bend (${amount})`,
    apply(ctx) {
      const note = requireNote(ctx)
      const existing = note.bendPoints?.some((p) => p.value === value) ?? false
      note.bendPoints = null
      note.bendType = alphaTab.model.BendType.None
      if (!existing) {
        note.addBendPoint(new alphaTab.model.BendPoint(0, 0))
        note.addBendPoint(new alphaTab.model.BendPoint(30, value))
        note.addBendPoint(new alphaTab.model.BendPoint(60, value))
      }
    },
  }
}

export function togglePalmMute(): EditorCommand {
  return {
    label: 'palm mute',
    apply(ctx) {
      const note = requireNote(ctx)
      note.isPalmMute = !note.isPalmMute
    },
  }
}

export function toggleVibrato(): EditorCommand {
  return {
    label: 'vibrato',
    apply(ctx) {
      const note = requireNote(ctx)
      note.vibrato =
        note.vibrato === alphaTab.model.VibratoType.None
          ? alphaTab.model.VibratoType.Slight
          : alphaTab.model.VibratoType.None
    },
  }
}

/** Toggle the per-note string-override lock (kept in the DB sidecar, not the
 * score file — advisory for future automated re-fretting). */
export function toggleLock(): EditorCommand {
  return {
    label: 'lock string',
    apply(ctx) {
      const note = requireNote(ctx)
      const key = lockKey({ bar: ctx.selection.bar, beat: ctx.selection.beat, string: note.string })
      if (!ctx.locks.delete(key)) ctx.locks.add(key)
    },
  }
}
