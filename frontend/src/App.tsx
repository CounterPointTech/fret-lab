import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { LibraryPage } from './pages/LibraryPage'

// Heavy routes are code-split; the songs library (landing page) stays eager.
const SongPage = lazy(() => import('./pages/SongPage').then((m) => ({ default: m.SongPage })))
const TheoryLabPage = lazy(() =>
  import('./pages/TheoryLabPage').then((m) => ({ default: m.TheoryLabPage })),
)
const LearnCatalogPage = lazy(() =>
  import('./pages/LearnCatalogPage').then((m) => ({ default: m.LearnCatalogPage })),
)
const LearnCoursePage = lazy(() =>
  import('./pages/LearnCoursePage').then((m) => ({ default: m.LearnCoursePage })),
)
const LearnLessonPage = lazy(() =>
  import('./pages/LearnLessonPage').then((m) => ({ default: m.LearnLessonPage })),
)
const LearnReferencePage = lazy(() =>
  import('./pages/LearnReferencePage').then((m) => ({ default: m.LearnReferencePage })),
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

/** Old Theory Lab URL → Theory Tools, keeping ?key=&song= deep-link params. */
function TheoryRedirect() {
  const location = useLocation()
  return <Navigate to={{ pathname: '/learn/tools', search: location.search }} replace />
}

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<LibraryPage />} />
        <Route path="/songs/:videoId" element={lazyRoute(<SongPage />)} />
        <Route path="/learn" element={lazyRoute(<LearnCatalogPage />)} />
        <Route path="/learn/tools" element={lazyRoute(<TheoryLabPage />)} />
        <Route path="/learn/reference" element={lazyRoute(<LearnReferencePage />)} />
        <Route path="/learn/:courseId" element={lazyRoute(<LearnCoursePage />)} />
        <Route path="/learn/:courseId/:lessonId" element={lazyRoute(<LearnLessonPage />)} />
        <Route path="/theory" element={<TheoryRedirect />} />
        <Route path="/proto/sync" element={lazyRoute(<SyncProtoPage />)} />
      </Route>
    </Routes>
  )
}

export default App
