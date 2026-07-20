interface Props {
  /** 0..1 */
  fraction: number
  size?: number
}

/** SVG completion ring, amber on stage track. */
export function ProgressRing({ fraction, size = 44 }: Props) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const done = fraction >= 1
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-stage-700)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={done ? 'var(--color-amp-400)' : 'var(--color-amp-500)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(Math.max(fraction, 0), 1))}
        className="transition-[stroke-dashoffset] duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="rotate-90 fill-stage-200 font-mono text-[10px]"
        style={{ transformOrigin: 'center' }}
      >
        {done ? '✓' : `${Math.round(fraction * 100)}%`}
      </text>
    </svg>
  )
}
