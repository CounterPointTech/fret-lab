import {
  TUNINGS,
  chordPositions,
  chordVoicings,
  scaleBoxes,
  scalePositions,
  type FretPosition,
} from '../theory/scales'
import type { DiagramSpec } from './types'

export interface ResolvedDiagram {
  dots: FretPosition[]
  /** Fret window to spotlight (dims out-of-range dots), or null for whole neck. */
  window: { minFret: number; maxFret: number } | null
}

const STANDARD = TUNINGS.standard.notes

/**
 * Turn a lesson's declarative diagram spec into FretboardView inputs using
 * the theory generators. Throws descriptive errors for bad specs — the
 * content integrity test runs every diagram in the curriculum through here.
 */
export function resolveDiagram(spec: DiagramSpec, fretCount = 15): ResolvedDiagram {
  switch (spec.type) {
    case 'scale': {
      if (spec.box != null) {
        const boxes = scaleBoxes(STANDARD, spec.tonic, spec.scale, fretCount)
        const box = boxes[spec.box]
        if (!box) {
          throw new Error(
            `diagram: box ${spec.box} out of range for ${spec.tonic} ${spec.scale} (${boxes.length} boxes)`,
          )
        }
        return { dots: box.positions, window: { minFret: box.minFret, maxFret: box.maxFret } }
      }
      const dots = scalePositions(STANDARD, spec.tonic, spec.scale, fretCount)
      if (dots.length === 0) throw new Error(`diagram: no notes for ${spec.tonic} ${spec.scale}`)
      return { dots, window: null }
    }
    case 'chordTones': {
      const dots = chordPositions(STANDARD, spec.label, fretCount)
      if (dots.length === 0) throw new Error(`diagram: no chord tones for "${spec.label}"`)
      return { dots, window: null }
    }
    case 'voicing': {
      const voicings = chordVoicings(STANDARD, spec.label, fretCount)
      if (voicings.length === 0) throw new Error(`diagram: no voicings for "${spec.label}"`)
      const voicing = spec.shape
        ? voicings.find((v) => v.shape === `${spec.shape} shape`)
        : voicings[0]
      if (!voicing) {
        throw new Error(
          `diagram: no ${spec.shape}-shape voicing for "${spec.label}" (have: ${voicings.map((v) => v.shape).join(', ')})`,
        )
      }
      const frets = voicing.positions.map((p) => p.fret)
      return {
        dots: voicing.positions,
        window: { minFret: Math.min(...frets), maxFret: Math.max(...frets) },
      }
    }
    case 'literal': {
      if (spec.positions.length === 0) throw new Error('diagram: literal spec with no positions')
      return { dots: spec.positions, window: null }
    }
  }
}
