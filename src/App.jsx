import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar/Sidebar'
import PlayerBar from './components/Player/PlayerBar'
import QueuePanel from './components/Queue/QueuePanel'
import Home from './pages/Home'
import Genre from './pages/Genre'
import Search from './pages/Search'
import Playlist from './pages/Playlist'
import Library from './pages/Library'

export default function App() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [queueOpen, setQueueOpen] = useState(false)

  useEffect(() => {
    fetch('/songs.json')
      .then((r) => r.json())
      .then((data) => { setSongs(data); setLoading(false) })
      .catch(() => { setSongs([]); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="text-5xl animate-bounce block mb-4">♪</span>
          <p className="text-white font-semibold text-lg">Melody</p>
          <p className="text-gray-400 text-sm mt-1">Memuat koleksi musik...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col overflow-hidden bg-surface">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-b from-surface-2 to-surface">
            <Routes>
              <Route path="/" element={<Home songs={songs} />} />
              <Route path="/search" element={<Search songs={songs} />} />
              <Route path="/library" element={<Library songs={songs} />} />
              <Route path="/genre/:mood" element={<Genre songs={songs} />} />
              <Route path="/liked" element={<Playlist />} />
              <Route path="/playlist/:id" element={<Playlist />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <QueuePanel open={queueOpen} />
        </div>

        <PlayerBar onQueueToggle={() => setQueueOpen((v) => !v)} />
      </div>
    </BrowserRouter>
  )
}
