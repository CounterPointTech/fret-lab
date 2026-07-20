import { useMemo } from 'react'

import { FretboardView } from '../../components/theory/FretboardView'
import { TUNINGS } from '../../theory/scales'
import { resolveDiagram } from '../resolve'
import type { DiagramSpec } from '../types'

interface Props {
  spec: DiagramSpec
  caption: string
  showIntervals?: boolean
  fretCount?: number
}

/** A lesson diagram: spec → theory functions → FretboardView, with caption. */
export function LessonFretboard({ spec, caption, showIntervals = false, fretCount = 15 }: Props) {
  const resolved = useMemo(() => {
    try {
      return resolveDiagram(spec, fretCount)
    } catch (err) {
      console.error('lesson diagram failed to resolve', err)
      return null
    }
  }, [spec, fretCount])

  if (!resolved) {
    return (
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
        This diagram failed to render — see the console.
      </div>
    )
  }

  return (
    <figure className="panel overflow-x-auto p-3">
      <FretboardView
        tuning={TUNINGS.standard.notes}
        dots={resolved.dots}
        fretCount={fretCount}
        showIntervals={showIntervals}
        window={resolved.window}
      />
      <figcaption className="px-2 pb-1 pt-2 font-mono text-xs text-stage-400">
        {caption}
      </figcaption>
    </figure>
  )
}
