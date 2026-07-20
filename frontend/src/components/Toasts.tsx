import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface Toast {
  id: number
  kind: 'error' | 'info' | 'success'
  message: string
  hint?: string
}

const ToastContext = createContext<(kind: Toast['kind'], message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

/** Turn known raw failure text into something the user can act on. */
function hintFor(message: string): string | undefined {
  const m = message.toLowerCase()
  if (m.includes('sign in to confirm') || m.includes('not a bot') || m.includes('po token')) {
    return 'YouTube bot check — update yt-dlp (pip install -U yt-dlp) or retry with browser cookies.'
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('econnrefused')) {
    return 'The backend may not be running — start it on port 8000 and retry.'
  }
  if (m.includes('video unavailable') || m.includes('private video')) {
    return 'This video can’t be downloaded — try a different upload of the song.'
  }
  return undefined
}

const KIND_STYLES: Record<Toast['kind'], { box: string; icon: string }> = {
  error: { box: 'border-rose-500/40 bg-rose-950/90 text-rose-100', icon: '✕' },
  info: { box: 'border-amp-500/40 bg-stage-850/95 text-amp-200', icon: 'ℹ' },
  success: { box: 'border-amp-500/40 bg-stage-850/95 text-amp-300', icon: '✓' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback((kind: Toast['kind'], message: string) => {
    const id = nextId.current++
    const hint = kind === 'error' ? hintFor(message) : undefined
    setToasts((t) => [...t, { id, kind, message, hint }])
    // errors with guidance stick around longer — the user has reading to do
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), hint ? 12000 : 6000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex w-96 max-w-[calc(100vw-3rem)] flex-col gap-2">
        {toasts.map((t) => {
          const style = KIND_STYLES[t.kind]
          return (
            <div
              key={t.id}
              role="alert"
              className={`animate-rise flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${style.box}`}
            >
              <span aria-hidden className="mt-0.5 font-mono text-xs opacity-70">
                {style.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words">{t.message}</p>
                {t.hint && <p className="mt-1.5 text-xs opacity-80">{t.hint}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 rounded p-0.5 font-mono text-xs opacity-50 transition hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
