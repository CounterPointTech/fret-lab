const MAJORS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F']
const MAJOR_LABELS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
const MINORS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F', 'C', 'G', 'D']
const MINOR_LABELS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm']

interface Props {
  tonic: string
  mode: 'major' | 'minor'
  onSelect: (tonic: string, mode: 'major' | 'minor') => void
}

function sectorPath(cx: number, cy: number, r0: number, r1: number, index: number): string {
  const a0 = ((index - 0.5) / 12) * 2 * Math.PI - Math.PI / 2
  const a1 = ((index + 0.5) / 12) * 2 * Math.PI - Math.PI / 2
  const p = (r: number, a: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  return [
    `M ${p(r0, a0)}`,
    `A ${r0} ${r0} 0 0 1 ${p(r0, a1)}`,
    `L ${p(r1, a1)}`,
    `A ${r1} ${r1} 0 0 0 ${p(r1, a0)}`,
    'Z',
  ].join(' ')
}

function labelPos(cx: number, cy: number, r: number, index: number): { x: number; y: number } {
  const a = (index / 12) * 2 * Math.PI - Math.PI / 2
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

/** Interactive circle of fifths: outer ring majors, inner ring relative
 * minors. Clicking a key drives the fretboard + related-chord panel. */
export function CircleOfFifths({ tonic, mode, onSelect }: Props) {
  const size = 260
  const c = size / 2

  const ring = (
    keys: string[],
    labels: string[],
    ringMode: 'major' | 'minor',
    r0: number,
    r1: number,
    fontSize: number,
  ) =>
    keys.map((key, i) => {
      const selected = mode === ringMode && tonic === key
      const { x, y } = labelPos(c, c, (r0 + r1) / 2, i)
      return (
        <g
          key={`${ringMode}-${key}`}
          onClick={() => onSelect(key, ringMode)}
          className="cursor-pointer"
          role="button"
          aria-label={`${labels[i]} ${ringMode}`}
        >
          <path
            d={sectorPath(c, c, r1, r0, i)}
            className={`transition-colors ${
              selected ? 'fill-amp-500' : 'fill-stage-800 hover:fill-stage-700'
            }`}
            stroke="#0c0a08"
            strokeWidth={2}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            className={`pointer-events-none font-mono ${
              selected ? 'fill-stage-950 font-bold' : 'fill-stage-300'
            }`}
          >
            {labels[i]}
          </text>
        </g>
      )
    })

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="max-w-64 select-none">
      {ring(MAJORS, MAJOR_LABELS, 'major', 80, 128, 15)}
      {ring(MINORS, MINOR_LABELS, 'minor', 44, 78, 11)}
      <text
        x={c}
        y={c}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        className="fill-stage-500 font-mono uppercase tracking-widest"
      >
        keys
      </text>
    </svg>
  )
}
