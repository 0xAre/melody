import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SongList from '../components/SongList/SongList'
import { getMoodMeta } from '../utils/format'

const MOODS = ['Jatuh Cinta', 'Galau', 'Pop Indo', 'Indie Indo', 'Barat', 'DJ & Remix', 'Lofi', 'Islamic', 'Game OST']

export default function Search({ songs }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.folder?.toLowerCase().includes(q)
    ).slice(0, 50)
  }, [query, songs])

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-6 md:mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          autoFocus
          type="text"
          placeholder="Cari lagu, artis, atau genre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:max-w-xl bg-surface-3 text-white placeholder-gray-500 rounded-full py-3 pl-12 pr-4 outline-none border border-transparent focus:border-primary transition-colors text-sm"
        />
        {query && (
          <button onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">✕</button>
        )}
      </div>

      {query ? (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            {results.length > 0 ? `${results.length} hasil untuk "${query}"` : `Tidak ada hasil untuk "${query}"`}
          </p>
          <SongList songs={results} />
        </div>
      ) : (
        <div>
          <h2 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">Browse Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {MOODS.map((mood) => {
              const meta = getMoodMeta(mood)
              const count = songs.filter((s) => s.folder === mood).length
              return (
                <button
                  key={mood}
                  onClick={() => navigate(`/genre/${encodeURIComponent(mood)}`)}
                  className={`bg-gradient-to-br ${meta.bg} rounded-xl p-3 md:p-4 text-left hover:scale-105 active:scale-95 transition-transform h-20 md:h-24 relative overflow-hidden group`}
                >
                  <p className="font-bold text-white text-sm md:text-base">{mood === '_Unknown' ? 'Lainnya' : mood}</p>
                  <p className="text-white/70 text-xs">{count} lagu</p>
                  <img 
                    src={meta.image} 
                    alt={mood}
                    className="absolute -bottom-2 -right-2 w-14 h-14 md:w-16 md:h-16 object-contain opacity-80 group-hover:scale-110 transition-transform mix-blend-screen drop-shadow-2xl" 
                  />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
