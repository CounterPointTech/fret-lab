import { useEffect } from 'react'

interface ShortcutRow {
  keys: string[]
  label: string
}

const GROUPS: { title: string; rows: ShortcutRow[] }[] = [
  {
    title: 'Playback',
    rows: [
      { keys: ['Space'], label: 'Play / pause' },
      { keys: ['←', '→'], label: 'Seek 5 seconds' },
      { keys: ['['], label: 'Slow down 5%' },
      { keys: [']'], label: 'Speed up 5%' },
    ],
  },
  {
    title: 'Looping',
    rows: [
      { keys: ['L'], label: 'Set loop A, then B — press again to clear' },
      { keys: ['drag'], label: 'Drag on the waveform to loop a section' },
    ],
  },
  {
    title: 'Everywhere',
    rows: [
      { keys: ['?'], label: 'Show this overlay' },
      { keys: ['Esc'], label: 'Close dialogs' },
    ],
  },
]

export function ShortcutOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-stage-950/80 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel animate-rise w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-stage-100">
            Keyboard shortcuts
          </h2>
          <button onClick={onClose} aria-label="Close" className="btn-quiet">
            esc
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className="section-label">{group.title}</h3>
              <ul className="mt-2 flex flex-col gap-1.5">
                {group.rows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-stage-200">{row.label}</span>
                    <span className="flex shrink-0 gap-1">
                      {row.keys.map((k) => (
                        <kbd key={k} className="kbd">
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
