import { Fragment, type ReactNode } from 'react'

/**
 * Tiny first-party markdown subset for lesson prose: paragraphs, **bold**,
 * *italic*, `code`, and -/1. lists. Content is authored in-repo against a
 * style guide, so this deliberately supports nothing else — no headings
 * (structural, via block `heading` fields), no HTML, no links-to-anywhere.
 */

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g

function renderInline(text: string): ReactNode[] {
  return text.split(INLINE_RE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-stage-100">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="rounded bg-stage-800 px-1 py-0.5 font-mono text-[0.85em] text-amp-300">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

type Chunk =
  | { type: 'p'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }

function parse(md: string): Chunk[] {
  const chunks: Chunk[] = []
  for (const raw of md.split(/\n\s*\n/)) {
    const block = raw.trim()
    if (!block) continue
    const lines = block.split('\n').map((l) => l.trim())
    if (lines.every((l) => l.startsWith('- '))) {
      chunks.push({ type: 'ul', items: lines.map((l) => l.slice(2)) })
    } else if (lines.every((l) => /^\d+\.\s/.test(l))) {
      chunks.push({ type: 'ol', items: lines.map((l) => l.replace(/^\d+\.\s/, '')) })
    } else {
      chunks.push({ type: 'p', text: lines.join(' ') })
    }
  }
  return chunks
}

export function Markdown({ md }: { md: string }) {
  return (
    <>
      {parse(md).map((chunk, i) => {
        if (chunk.type === 'p') {
          return (
            <p key={i} className="mt-3 leading-relaxed text-stage-200 first:mt-0">
              {renderInline(chunk.text)}
            </p>
          )
        }
        const List = chunk.type === 'ul' ? 'ul' : 'ol'
        return (
          <List
            key={i}
            className={`mt-3 flex flex-col gap-1.5 pl-5 text-stage-200 ${
              chunk.type === 'ul' ? 'list-disc marker:text-amp-500' : 'list-decimal marker:text-amp-400'
            }`}
          >
            {chunk.items.map((item, j) => (
              <li key={j} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </List>
        )
      })}
    </>
  )
}
