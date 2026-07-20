/**
 * TabEditor engine tests: apply/undo symmetry for every command,
 * fret-recompute-on-string-change math, and the save/reload round-trip
 * (edited tex → new editor → identical content).
 */
import * as alphaTab from '@coderline/alphatab'
import { describe, expect, it } from 'vitest'

import {
  CommandError,
  deleteNote,
  fretForString,
  insertNote,
  moveString,
  setDuration,
  setFret,
  shiftPitch,
  stringTuning,
  TabEditor,
  toggleBend,
  toggleHammer,
  toggleLock,
  togglePalmMute,
  toggleVibrato,
  type EditorCommand,
  type Selection,
} from './engine'

// Standard tuning, two bars: single notes + a chord, a rest, and close notes
// on one string (so hammer-ons have a destination).
const TEX = [
  '\\title "Test"',
  '\\tempo 120',
  '\\tuning e4 b3 g3 d3 a2 e2',
  '.',
  '0.6.4 3.5.4 5.5.4 r.4 |',
  '(0.6 3.5).8 5.5.8 r.4 6.5.4 5.4.8 7.4.8',
].join('\n')

// model string numbers: 1 = low E … 6 = high E (inverse of alphaTex)
const STANDARD = [64, 59, 55, 50, 45, 40] // staff.tuning: index 0 = high E

function editor(sel?: Selection): TabEditor {
  const ed = new TabEditor(TEX)
  ed.setSelection(sel ?? { bar: 0, beat: 2, string: 2 }) // 5.5 in tex = fret 5, A string
  return ed
}

function contentSig(score: alphaTab.model.Score): string {
  const out: string[] = []
  for (const bar of score.tracks[0].staves[0].bars) {
    for (const beat of bar.voices[0].beats) {
      out.push(
        beat.isRest
          ? `r.${beat.duration}`
          : beat.notes
              .map((n) => `${n.fret}.${n.string}@${n.realValue}`)
              .sort()
              .join('+') + `.${beat.duration}`,
      )
    }
  }
  return out.join(' ')
}

describe('fret math', () => {
  const tuning = new TabEditor(TEX).score.tracks[0].staves[0].tuning

  it('staff tuning is high-to-low, stringTuning(1) is the low E', () => {
    expect([...tuning]).toEqual(STANDARD)
    expect(stringTuning(tuning, 1)).toBe(40)
    expect(stringTuning(tuning, 6)).toBe(64)
  })

  it('recomputes frets across strings for the same pitch', () => {
    // A2+5 = D3 (50): playable as fret 10 on low E, fret 5 on A, fret 0 on D
    expect(fretForString(50, tuning, 1)).toBe(10)
    expect(fretForString(50, tuning, 2)).toBe(5)
    expect(fretForString(50, tuning, 3)).toBe(0)
    // not playable below the open string
    expect(fretForString(50, tuning, 4)).toBeNull()
    // beyond max fret
    expect(fretForString(90, tuning, 1)).toBeNull()
  })
})

describe('apply/undo symmetry', () => {
  const cases: Array<[string, EditorCommand, Selection?]> = [
    ['setFret', setFret(7)],
    ['moveString', moveString(1)],
    ['shiftPitch up', shiftPitch(1)],
    ['shiftPitch down', shiftPitch(-1)],
    ['setDuration', setDuration(alphaTab.model.Duration.Eighth)],
    ['insertNote into rest', insertNote(5), { bar: 0, beat: 3, string: 3 }],
    ['insertNote into chord', insertNote(2), { bar: 1, beat: 0, string: 3 }],
    ['deleteNote (chord)', deleteNote(), { bar: 1, beat: 0, string: 2 }],
    ['deleteNote (last note → rest)', deleteNote()],
    ['toggleHammer', toggleHammer(), { bar: 1, beat: 4, string: 3 }],
    ['toggleBend full', toggleBend('full')],
    ['toggleBend half', toggleBend('half')],
    ['togglePalmMute', togglePalmMute()],
    ['toggleVibrato', toggleVibrato()],
    ['toggleLock', toggleLock()],
  ]

  for (const [name, cmd, sel] of cases) {
    it(name, () => {
      const ed = editor(sel)
      const texBefore = ed.tex
      const locksBefore = [...ed.locks].sort().join()
      ed.apply(cmd)
      const texAfter = ed.tex
      const locksAfter = [...ed.locks].sort().join()
      expect(texAfter !== texBefore || locksAfter !== locksBefore).toBe(true)
      expect(ed.canUndo).toBe(true)
      ed.undo()
      expect(ed.tex).toBe(texBefore)
      expect([...ed.locks].sort().join()).toBe(locksBefore)
      ed.redo()
      expect(ed.tex).toBe(texAfter)
      expect([...ed.locks].sort().join()).toBe(locksAfter)
    })
  }

  it('undo restores across a chain of edits, in order', () => {
    const ed = editor()
    const stages = [ed.tex]
    ed.apply(setFret(8))
    stages.push(ed.tex)
    ed.apply(moveString(1))
    stages.push(ed.tex)
    ed.apply(togglePalmMute())
    expect(ed.tex).not.toBe(stages[2])
    ed.undo()
    expect(ed.tex).toBe(stages[2])
    ed.undo()
    expect(ed.tex).toBe(stages[1])
    ed.undo()
    expect(ed.tex).toBe(stages[0])
    expect(ed.canUndo).toBe(false)
  })
})

describe('mutation semantics', () => {
  it('moveString keeps the pitch and updates the selection', () => {
    const ed = editor() // fret 5 on A (string 2), realValue 50
    const before = ed.noteAt(ed.selection!)!
    const realValue = before.realValue
    ed.apply(moveString(1))
    const after = ed.noteAt({ bar: 0, beat: 2, string: 3 })!
    expect(after.realValue).toBe(realValue)
    expect(after.fret).toBe(realValue - 50) // D string
    expect(ed.selection).toEqual({ bar: 0, beat: 2, string: 3 })
  })

  it('rejects a string move that is not playable, leaving state untouched', () => {
    const ed = editor({ bar: 0, beat: 0, string: 1 }) // open low E
    const tex = ed.tex
    expect(() => ed.apply(moveString(-1))).toThrow(CommandError)
    expect(() => ed.apply(shiftPitch(-1))).toThrow(CommandError)
    expect(ed.tex).toBe(tex)
    expect(ed.canUndo).toBe(false)
  })

  it('deleting the last note leaves a rest; inserting revives it', () => {
    const ed = editor()
    ed.apply(deleteNote())
    expect(ed.beatAt({ bar: 0, beat: 2, string: null })!.isRest).toBe(true)
    ed.setSelection({ bar: 0, beat: 2, string: 4 })
    ed.apply(insertNote(9))
    const beat = ed.beatAt({ bar: 0, beat: 2, string: null })!
    expect(beat.isRest).toBe(false)
    expect(beat.notes[0].string).toBe(4)
    expect(beat.notes[0].fret).toBe(9)
  })

  it('hammer-on links to the next note on the string after normalization', () => {
    const ed = editor({ bar: 1, beat: 4, string: 3 }) // 5.4 followed by 7.4
    ed.apply(toggleHammer())
    const note = ed.noteAt({ bar: 1, beat: 4, string: 3 })!
    expect(note.isHammerPullOrigin).toBe(true)
    expect(note.hammerPullDestination?.fret).toBe(7)
  })

  it('bend toggles replace and clear', () => {
    const ed = editor()
    ed.apply(toggleBend('full'))
    expect(ed.noteAt(ed.selection!)!.bendPoints?.some((p) => p.value === 4)).toBe(true)
    ed.apply(toggleBend('half'))
    expect(ed.noteAt(ed.selection!)!.bendPoints?.some((p) => p.value === 2)).toBe(true)
    ed.apply(toggleBend('half'))
    expect(ed.noteAt(ed.selection!)!.bendPoints?.length ?? 0).toBe(0)
  })

  it('locks follow the note across string moves and die with the note', () => {
    const ed = editor()
    ed.apply(toggleLock())
    expect(ed.locks.has('0:2:2')).toBe(true)
    ed.apply(moveString(1))
    expect(ed.locks.has('0:2:3')).toBe(true)
    expect(ed.locks.has('0:2:2')).toBe(false)
    ed.apply(deleteNote())
    expect(ed.locks.size).toBe(0)
  })
})

describe('save/reload round-trip', () => {
  it('a fully edited score survives serialize → new editor → serialize', () => {
    const ed = editor()
    ed.apply(setFret(8))
    ed.apply(moveString(1))
    ed.setSelection({ bar: 0, beat: 3, string: 3 })
    ed.apply(insertNote(5))
    ed.setSelection({ bar: 1, beat: 4, string: 3 })
    ed.apply(toggleHammer())
    ed.apply(togglePalmMute())
    ed.setSelection({ bar: 1, beat: 3, string: 2 })
    ed.apply(toggleBend('full'))
    ed.apply(toggleVibrato())
    ed.apply(toggleLock())

    // "save": tex + locks persisted; "reload": fresh editor from both
    const saved = ed.tex
    const savedLocks = [...ed.locks]
    const reloaded = new TabEditor(saved, savedLocks)

    expect(reloaded.tex).toBe(saved)
    expect(contentSig(reloaded.score)).toBe(contentSig(ed.score))
    expect([...reloaded.locks].sort()).toEqual(savedLocks.sort())

    const hammer = reloaded.noteAt({ bar: 1, beat: 4, string: 3 })!
    expect(hammer.isHammerPullOrigin).toBe(true)
    expect(hammer.isPalmMute).toBe(true)
    const bent = reloaded.noteAt({ bar: 1, beat: 3, string: 2 })!
    expect(bent.bendPoints?.some((p) => p.value === 4)).toBe(true)
    expect(bent.vibrato).not.toBe(alphaTab.model.VibratoType.None)
  })

  it('a real-world shaped draft (ties + chords) normalizes to a fixpoint', () => {
    const tieTex = TEX.replace('5.5.8 r.4', '5.5.8 -.5.4')
    const ed = new TabEditor(tieTex)
    const reloaded = new TabEditor(ed.tex)
    expect(reloaded.tex).toBe(ed.tex)
    const tied = reloaded.noteAt({ bar: 1, beat: 2, string: 2 })!
    expect(tied.isTieDestination).toBe(true)
  })
})

describe('selection navigation', () => {
  it('moves across beats and bar boundaries in both directions', () => {
    const ed = editor({ bar: 0, beat: 3, string: 2 })
    ed.moveBeat(1)
    expect(ed.selection).toEqual({ bar: 1, beat: 0, string: 2 })
    ed.moveBeat(-1)
    expect(ed.selection).toEqual({ bar: 0, beat: 3, string: 2 })
    ed.moveBeat(-1)
    ed.moveBeat(-1)
    ed.moveBeat(-1)
    expect(ed.selection).toEqual({ bar: 0, beat: 0, string: 2 })
    ed.moveBeat(-1) // clamped at the start
    expect(ed.selection).toEqual({ bar: 0, beat: 0, string: 2 })
  })

  it('moves across strings and clamps at the edges', () => {
    const ed = editor({ bar: 0, beat: 0, string: 1 })
    ed.moveStringSelection(1)
    expect(ed.selection?.string).toBe(2)
    ed.moveStringSelection(-1)
    ed.moveStringSelection(-1)
    expect(ed.selection?.string).toBe(1)
  })
})
