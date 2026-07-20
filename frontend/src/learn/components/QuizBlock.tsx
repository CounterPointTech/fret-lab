import { useState } from 'react'

import type { QuizQuestion } from '../types'

interface Props {
  questions: QuizQuestion[]
  /** Fires once, when the last question gets answered. */
  onScore?: (correct: number, total: number) => void
}

/**
 * Lesson quiz: pick an answer → choices lock, the right one lights up amber,
 * a wrong pick turns rose, and the explanation reveals. Score reported when
 * every question is answered.
 */
export function QuizBlock({ questions, onScore }: Props) {
  // picked[i] = chosen index, or undefined while unanswered
  const [picked, setPicked] = useState<Record<number, number>>({})

  const answered = Object.keys(picked).length
  const correct = questions.reduce(
    (n, q, i) => n + (picked[i] === q.answer ? 1 : 0),
    0,
  )

  function pick(qIdx: number, cIdx: number) {
    if (picked[qIdx] != null) return
    const next = { ...picked, [qIdx]: cIdx }
    setPicked(next)
    if (Object.keys(next).length === questions.length) {
      const finalCorrect = questions.reduce(
        (n, q, i) => n + (next[i] === q.answer ? 1 : 0),
        0,
      )
      onScore?.(finalCorrect, questions.length)
    }
  }

  return (
    <div className="panel p-5" data-testid="quiz">
      <div className="flex items-center justify-between">
        <h3 className="section-label text-amp-300">Check yourself</h3>
        <span className="font-mono text-xs text-stage-400">
          {answered}/{questions.length} answered
          {answered > 0 && <span className="ml-2 text-amp-300">{correct} correct</span>}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {questions.map((q, qIdx) => {
          const chosen = picked[qIdx]
          const done = chosen != null
          return (
            <div key={qIdx}>
              <p className="font-medium text-stage-100">
                <span className="mr-2 font-mono text-xs text-stage-500">{qIdx + 1}.</span>
                {q.prompt}
              </p>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {q.choices.map((choice, cIdx) => {
                  const isAnswer = cIdx === q.answer
                  const isChosen = cIdx === chosen
                  let style = 'border-stage-700 text-stage-200 hover:border-amp-500/50 hover:text-amp-200'
                  if (done) {
                    if (isAnswer) style = 'border-amp-500/70 bg-amp-500/10 text-amp-300 font-semibold'
                    else if (isChosen) style = 'border-rose-500/60 bg-rose-500/10 text-rose-300'
                    else style = 'border-stage-800 text-stage-500'
                  }
                  return (
                    <button
                      key={cIdx}
                      onClick={() => pick(qIdx, cIdx)}
                      disabled={done}
                      className={`w-full rounded-lg border px-3.5 py-2 text-left text-sm transition ${style} ${
                        done ? 'cursor-default' : ''
                      }`}
                    >
                      {done && isAnswer && <span className="mr-1.5">✓</span>}
                      {done && isChosen && !isAnswer && <span className="mr-1.5">✕</span>}
                      {choice}
                    </button>
                  )
                })}
              </div>
              {done && (
                <p className="animate-fade-in mt-2 rounded-lg bg-stage-900/70 px-3.5 py-2.5 text-sm leading-relaxed text-stage-300">
                  {q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
