import { Link } from 'react-router-dom'

import { CHORD_FORMULAS, INTERVALS, KEY_SIGNATURES, MODES } from '../learn/referenceData'

function RefTable({ title, head, rows }: { title: string; head: string[]; rows: string[][] }) {
  return (
    <section className="animate-rise panel overflow-x-auto p-5">
      <h2 className="section-label text-amp-300">{title}</h2>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-stage-700 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-stage-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-stage-800/60 last:border-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={`px-3 py-2 ${c === 0 ? 'whitespace-nowrap font-mono text-amp-300' : 'text-stage-200'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export function LearnReferencePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <nav className="pt-6 font-mono text-sm">
        <Link to="/learn" className="text-stage-300 transition hover:text-amp-300">
          ← Learn
        </Link>
      </nav>

      <header className="animate-rise pt-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Reference <span className="text-amp-400">sheets</span>
        </h1>
        <p className="mt-2 text-stage-300">
          The lookup tables behind the lessons — intervals, keys, chord formulas, and the modes.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-6">
        <RefTable
          title="Intervals"
          head={['Frets', 'Name', 'On the neck', 'Sounds like']}
          rows={INTERVALS}
        />
        <RefTable
          title="Key signatures (all 12 major keys)"
          head={['Key', 'Signature', 'Notes', 'Relative minor']}
          rows={KEY_SIGNATURES}
        />
        <RefTable
          title="Chord formulas"
          head={['Chord', 'Formula', 'Example', 'Character']}
          rows={CHORD_FORMULAS}
        />
        <RefTable
          title="The seven modes"
          head={['Mode', 'Degrees', 'Color note', 'Character']}
          rows={MODES}
        />
      </div>
    </div>
  )
}
