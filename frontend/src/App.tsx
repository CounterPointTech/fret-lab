import { Route, Routes } from 'react-router-dom'

import { LibraryPage } from './pages/LibraryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
    </Routes>
  )
}

export default App
