import { Route, Routes } from 'react-router-dom'

import { LibraryPage } from './pages/LibraryPage'
import { SongPage } from './pages/SongPage'
import { SyncProtoPage } from './pages/SyncProtoPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/songs/:videoId" element={<SongPage />} />
      <Route path="/proto/sync" element={<SyncProtoPage />} />
    </Routes>
  )
}

export default App
