import { useEffect, useRef, useState } from 'react'

import type { JobEvent } from '../lib/api'

const TERMINAL = new Set(['done', 'error', 'cancelled'])

/**
 * Subscribe to a job's SSE progress stream. Calls onTerminal exactly once
 * when the job reaches done/error/cancelled, then closes the EventSource.
 */
export function useJobEvents(jobId: string | null, onTerminal: (event: JobEvent) => void) {
  const [event, setEvent] = useState<JobEvent | null>(null)
  // keep the latest callback without resubscribing the stream
  const onTerminalRef = useRef(onTerminal)
  onTerminalRef.current = onTerminal

  useEffect(() => {
    if (!jobId) return
    setEvent(null)
    const source = new EventSource(`/api/jobs/${jobId}/events`)
    let finished = false

    source.addEventListener('progress', (e) => {
      const parsed = JSON.parse((e as MessageEvent).data) as JobEvent
      setEvent(parsed)
      if (TERMINAL.has(parsed.status) && !finished) {
        finished = true
        source.close()
        onTerminalRef.current(parsed)
      }
    })
    // No onerror handler: before a terminal event we want EventSource's
    // built-in reconnect (backend restarts mid-download); after it we have
    // already closed the stream ourselves.
    return () => source.close()
  }, [jobId])

  return event
}
