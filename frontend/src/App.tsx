import { Route, Routes } from 'react-router-dom'

import { LibraryPage } from './pages/LibraryPage'
import { SongPage } from './pages/SongPage'
import { SyncProtoPage } from './pages/SyncProtoPage'
import { TheoryLabPage } from './pages/TheoryLabPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/songs/:videoId" element={<SongPage />} />
      <Route path="/theory" element={<TheoryLabPage />} />
      <Route path="/proto/sync" element={<SyncProtoPage />} />
    </Routes>
  )
}

export default App
