import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import SongList from '../components/SongList/SongList'
import MoodGrid from '../components/MoodGrid/MoodGrid'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return {
    text: 'Selamat pagi',
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8 text-yellow-400 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 01-1.06-1.06l1.59-1.591a.75.75 0 111.061 1.06l-1.59 1.591zM2.25 12a.75.75 0 01.75-.75H5.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM5.106 6.166a.75.75 0 001.06-1.06l-1.591-1.59a.75.75 0 10-1.06 1.061l1.591 1.59z" />
      </svg>
    )
  }
  if (h < 17) return {
    text: 'Selamat siang',
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8 text-yellow-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 01-1.06-1.06l1.59-1.591a.75.75 0 111.061 1.06l-1.59 1.591zM2.25 12a.75.75 0 01.75-.75H5.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM5.106 6.166a.75.75 0 001.06-1.06l-1.591-1.59a.75.75 0 10-1.06 1.061l1.591 1.59z" />
      </svg>
    )
  }
  if (h < 19) return {
    text: 'Selamat sore',
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8 text-orange-400 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM6.166 18.894a.75.75 0 01-1.06-1.06l1.59-1.591a.75.75 0 111.061 1.06l-1.59 1.591zM2.25 12a.75.75 0 01.75-.75H5.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM5.106 6.166a.75.75 0 001.06-1.06l-1.591-1.59a.75.75 0 10-1.06 1.061l1.591 1.59z" />
      </svg>
    )
  }
  return {
    text: 'Selamat malam',
    icon: (
      <svg className="w-7 h-7 md:w-8 md:h-8 text-indigo-300 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
      </svg>
    )
  }
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

  const greeting = getGreeting()

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-screen-xl">
      {/* Greeting */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            {greeting.text} {greeting.icon}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{songs.length} lagu tersedia</p>
        </div>
        <button
          onClick={handlePlayAll}
          className="flex-shrink-0 gradient-primary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity"
        >
          ▶ Putar Semua
        </button>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <section>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Terakhir Diputar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {recentlyPlayed.slice(0, 6).map((song) => (
              <RecentCard key={song.id} song={song} onPlay={() => playSong(song, recentlyPlayed)} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Mood */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Browse by Mood</h2>
        <MoodGrid songs={songs} />
      </section>

      {/* Featured / Recommended */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">Mungkin kamu suka</h2>
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
