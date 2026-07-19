import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

interface Toast {
  id: number
  kind: 'error' | 'info'
  message: string
}

const ToastContext = createContext<(kind: Toast['kind'], message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const push = useCallback((kind: Toast['kind'], message: string) => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-96 max-w-[calc(100vw-3rem)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`animate-rise rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${
              t.kind === 'error'
                ? 'border-red-500/40 bg-red-950/80 text-red-200'
                : 'border-amp-500/40 bg-stage-800/90 text-amp-300'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
