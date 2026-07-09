import { useParams } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import SongList from '../components/SongList/SongList'
import { getMoodMeta } from '../utils/format'

export default function Genre({ songs }) {
  const { mood } = useParams()
  const { playQueue } = usePlayerStore()
  const decoded = decodeURIComponent(mood)
  const filtered = songs.filter((s) => s.folder === decoded)
  const meta = getMoodMeta(decoded)

  return (
    <div>
      {/* Hero header */}
      <div className={`px-4 md:px-6 pt-8 md:pt-16 pb-6 md:pb-8 bg-gradient-to-b ${meta.bg}`}>
        <p className="text-xs md:text-sm font-medium text-white/80 uppercase tracking-wider">Mood</p>
        <h1 className="text-3xl md:text-5xl font-bold text-white mt-1 flex items-center gap-3">
          <img src={meta.image} alt="Icon" className="w-10 h-10 md:w-14 md:h-14 object-contain mix-blend-screen drop-shadow-xl" />
          {decoded === '_Unknown' ? 'Lainnya' : decoded}
        </h1>
        <p className="text-white/70 mt-2 text-sm md:text-base">{filtered.length} lagu</p>
      </div>

      {/* Gradient fade + action */}
      <div className="px-4 md:px-6 py-4 bg-gradient-to-b from-surface-2/80 to-surface flex items-center gap-3">
        <button
          onClick={() => filtered.length && playQueue(filtered, 0)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-primary flex items-center justify-center text-white text-xl md:text-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          ▶
        </button>
        <button
          onClick={() => {
            const shuffled = [...filtered].sort(() => Math.random() - 0.5)
            playQueue(shuffled, 0)
          }}
          className="px-4 md:px-5 py-2 rounded-full border border-gray-600 text-white text-sm hover:border-white active:border-white transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" className="hidden" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h.01M4 16h.01M8 8h.01M8 16h.01M12 8h.01M12 16h.01M16 8h.01M16 16h.01M20 8h.01M20 16h.01" className="hidden" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
          </svg>
          Shuffle
        </button>
      </div>

      <div className="px-3 md:px-6 pb-6">
        <SongList songs={filtered} />
      </div>
    </div>
  )
}
