import { Link } from 'react-router-dom'

import { CircleOfFifths } from '../../components/theory/CircleOfFifths'
import { MetronomeWidget } from '../../components/theory/MetronomeWidget'
import type { Block } from '../types'
import { JamCTA } from './JamCTA'
import { LessonFretboard } from './LessonFretboard'
import { Markdown } from './Markdown'
import { QuizBlock } from './QuizBlock'

interface Props {
  blocks: Block[]
  onQuizScore?: (correct: number, total: number) => void
}

/** Renders a lesson's block list in order. */
export function LessonBlocks({ blocks, onQuizScore }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'text':
            return (
              <section key={i}>
                {block.heading && (
                  <h2 className="mb-2 font-display text-xl font-bold text-stage-100">
                    {block.heading}
                  </h2>
                )}
                <Markdown md={block.md} />
              </section>
            )
          case 'fretboard':
            return (
              <LessonFretboard
                key={i}
                spec={block.spec}
                caption={block.caption}
                showIntervals={block.showIntervals}
                fretCount={block.fretCount}
              />
            )
          case 'circle':
            return (
              <figure key={i} className="panel flex flex-col items-center p-4">
                <Link to={`/learn/tools?key=${encodeURIComponent(`${block.tonic} ${block.mode}`)}`}>
                  <CircleOfFifths tonic={block.tonic} mode={block.mode} onSelect={() => {}} />
                </Link>
                {block.caption && (
                  <figcaption className="pt-2 text-center font-mono text-xs text-stage-400">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          case 'quiz':
            return <QuizBlock key={i} questions={block.questions} onScore={onQuizScore} />
          case 'jam':
            return (
              <JamCTA key={i} md={block.md} tonic={block.tonic} mode={block.mode} scale={block.scale} />
            )
          case 'metronome':
            return (
              <div key={i}>
                {block.label && (
                  <p className="mb-2 font-mono text-xs text-stage-400">{block.label}</p>
                )}
                <MetronomeWidget initialBpm={block.bpm} />
              </div>
            )
          case 'table':
            return (
              <figure key={i} className="panel overflow-x-auto p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {block.head.map((h, j) => (
                        <th
                          key={j}
                          className="border-b border-stage-700 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider text-stage-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-stage-800/60 last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-3 py-2 ${c === 0 ? 'font-mono text-amp-300' : 'text-stage-200'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {block.caption && (
                  <figcaption className="pt-2 font-mono text-xs text-stage-400">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
        }
      })}
    </div>
  )
}
