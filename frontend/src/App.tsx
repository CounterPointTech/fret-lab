import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { LibraryPage } from './pages/LibraryPage'

// Heavy routes are code-split; the library (landing page) stays eager.
const SongPage = lazy(() => import('./pages/SongPage').then((m) => ({ default: m.SongPage })))
const TheoryLabPage = lazy(() =>
  import('./pages/TheoryLabPage').then((m) => ({ default: m.TheoryLabPage })),
)
const SyncProtoPage = lazy(() =>
  import('./pages/SyncProtoPage').then((m) => ({ default: m.SyncProtoPage })),
)

function RouteFallback() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="skeleton h-8 w-64" />
      <div className="skeleton mt-6 h-40 w-full" />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LibraryPage />} />
        <Route
          path="/songs/:videoId"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SongPage />
            </Suspense>
          }
        />
        <Route
          path="/theory"
          element={
            <Suspense fallback={<RouteFallback />}>
              <TheoryLabPage />
            </Suspense>
          }
        />
        <Route
          path="/proto/sync"
          element={
            <Suspense fallback={<RouteFallback />}>
              <SyncProtoPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
