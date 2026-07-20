import { Fretboard, type Position } from '@moonwave99/fretboard.js'
import { useEffect, useRef } from 'react'

import type { FretPosition } from '../../theory/scales'

interface Props {
  tuning: string[]
  dots: FretPosition[]
  fretCount?: number
  /** label dots with interval degrees (R, b3, 5…) instead of note names */
  showIntervals?: boolean
  /** dim dots outside this fret window (CAGED box focus) */
  window?: { minFret: number; maxFret: number } | null
}

/**
 * Dumb renderer around Fretboard.js — all note/box math lives in
 * src/theory/scales.ts. Dot roles come in on the FretPosition props:
 * isRoot (amber), inChord (green = current-chord tone in Jam Mode).
 */
export function FretboardView({
  tuning,
  dots,
  fretCount = 15,
  showIntervals = false,
  window = null,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const fb = new Fretboard({
      el,
      tuning: [...tuning],
      fretCount,
      height: 190,
      stringColor: '#57503f',
      fretColor: '#2b2519',
      nutColor: '#a89e88',
      middleFretColor: '#57503f',
      dotSize: 27,
      dotTextSize: 11,
      dotStrokeColor: '#0c0a08',
      fretNumbersColor: '#57503f',
      font: 'JetBrains Mono',
    })
    const label = (d: unknown) => {
      const dot = d as FretPosition
      return String((showIntervals ? dot.interval : dot.note) ?? '')
    }
    fb.setDots(dots as Position[]).render()
    fb.style({ text: label, fontFill: '#ece5d8', fill: '#3a3327', stroke: '#57503f' })
    fb.style({
      filter: (d: unknown) => !!(d as FretPosition).isRoot,
      fill: '#f59e0b',
      stroke: '#ffd489',
      text: label,
      fontFill: '#0c0a08',
    })
    fb.style({
      filter: (d: unknown) => !!(d as FretPosition).inChord && !(d as FretPosition).isRoot,
      fill: '#34d399',
      stroke: '#a7f3d0',
      text: label,
      fontFill: '#0c0a08',
    })
    if (window) {
      fb.style({
        filter: (d: unknown) => {
          const dot = d as FretPosition
          return dot.fret < window.minFret || dot.fret > window.maxFret
        },
        opacity: 0.22,
        text: label,
        fontFill: 'transparent',
      })
    }
    return () => {
      el.innerHTML = ''
    }
  }, [tuning, dots, fretCount, showIntervals, window])

  return <div ref={ref} className="fretboard-view w-full overflow-x-auto" />
}
