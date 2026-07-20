import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

import { ShortcutOverlay } from './ShortcutOverlay'

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation()
  const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
  return (
    <Link
      to={to}
      className={`rounded-lg px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition ${
        active ? 'bg-amp-500/10 text-amp-300' : 'text-stage-400 hover:text-stage-100'
      }`}
    >
      {label}
    </Link>
  )
}

/** Shared chrome: slim top bar, global "?" shortcut overlay, page outlet. */
export function AppShell() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.key === '?') {
        e.preventDefault()
        setShortcutsOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stage-800/80 bg-stage-950/70 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-6">
          <Link
            to="/"
            className="mr-4 font-display text-base font-extrabold tracking-tight text-stage-100"
          >
            Fret <span className="text-amp-400">Lab</span>
          </Link>
          <NavLink to="/learn" label="Learn" />
          <NavLink to="/" label="Songs" />
          <button
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            className="ml-auto grid h-7 w-7 place-items-center rounded-full border border-stage-700 font-mono text-xs text-stage-400 transition hover:border-amp-500/50 hover:text-amp-300"
          >
            ?
          </button>
        </div>
      </header>

      <Outlet />

      {shortcutsOpen && <ShortcutOverlay onClose={() => setShortcutsOpen(false)} />}
    </>
  )
}
