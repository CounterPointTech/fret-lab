import { useEffect, useState } from 'react'

interface Health {
  status: string
  gpu: string | null
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setHealth)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center gap-4">
      <h1 className="text-5xl font-bold tracking-tight">
        Fret <span className="text-amber-400">Lab</span>
      </h1>
      <p className="text-neutral-400">Learn songs. Learn the fretboard. Jam.</p>
      {health && (
        <p className="text-sm text-emerald-400">
          backend: {health.status}
          {health.gpu ? ` · ${health.gpu}` : ' · no GPU detected'}
        </p>
      )}
      {error && <p className="text-sm text-red-400">backend unreachable: {error}</p>}
      {!health && !error && <p className="text-sm text-neutral-500">checking backend…</p>}
    </main>
  )
}

export default App
