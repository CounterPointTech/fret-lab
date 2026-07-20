import { Route, Routes } from 'react-router-dom'

import { LibraryPage } from './pages/LibraryPage'
import { SongPage } from './pages/SongPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/songs/:videoId" element={<SongPage />} />
    </Routes>
  )
}

export default App
