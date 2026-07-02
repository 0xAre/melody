import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import SongList from '../components/SongList/SongList'
import MoodGrid from '../components/MoodGrid/MoodGrid'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Selamat pagi ☀️'
  if (h < 17) return 'Selamat siang 🌤️'
  if (h < 20) return 'Selamat sore 🌆'
  return 'Selamat malam 🌙'
}

export default function Home({ songs }) {
  const { recentlyPlayed, playQueue, playSong } = usePlayerStore()
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    if (songs.length) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5)
      setFeatured(shuffled.slice(0, 8))
    }
  }, [songs.length])

  const handlePlayAll = () => {
    if (songs.length) playQueue(songs, 0)
  }

  return (
    <div className="p-6 space-y-8 max-w-screen-xl">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
          <p className="text-gray-400 mt-1">{songs.length} lagu tersedia</p>
        </div>
        <button
          onClick={handlePlayAll}
          className="gradient-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          ▶ Putar Semua
        </button>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Terakhir Diputar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <RecentCard key={song.id} song={song} onPlay={() => playSong(song, recentlyPlayed)} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Mood */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Browse by Mood</h2>
        <MoodGrid songs={songs} />
      </section>

      {/* Featured / Recommended */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Mungkin kamu suka</h2>
          <SongList songs={featured} />
        </section>
      )}
    </div>
  )
}

function RecentCard({ song, onPlay }) {
  return (
    <button
      onClick={onPlay}
      className="group flex flex-col bg-surface-2 rounded-xl overflow-hidden hover:bg-surface-3 transition-colors text-left"
    >
      <div className="aspect-square w-full bg-surface-3 overflow-hidden relative">
        {song.artworkUrl
          ? <img src={song.artworkUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🎵</div>
        }
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl shadow-lg">▶</span>
        </div>
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-white text-ellipsis-1">{song.title}</p>
        <p className="text-xs text-gray-400 text-ellipsis-1">{song.artist || 'Unknown'}</p>
      </div>
    </button>
  )
}
