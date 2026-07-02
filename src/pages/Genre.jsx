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
      <div className={`px-6 pt-16 pb-8 bg-gradient-to-b ${meta.bg} from-opacity-80`}>
        <p className="text-sm font-medium text-white/80 uppercase tracking-wider">Mood</p>
        <h1 className="text-5xl font-bold text-white mt-2">
          {meta.emoji} {decoded === '_Unknown' ? 'Lainnya' : decoded}
        </h1>
        <p className="text-white/70 mt-2">{filtered.length} lagu</p>
      </div>

      {/* Gradient fade + action */}
      <div className="px-6 py-4 bg-gradient-to-b from-surface-2/80 to-surface flex items-center gap-4">
        <button
          onClick={() => filtered.length && playQueue(filtered, 0)}
          className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white text-2xl shadow-lg hover:scale-105 transition-transform"
        >
          ▶
        </button>
        <button
          onClick={() => {
            const shuffled = [...filtered].sort(() => Math.random() - 0.5)
            playQueue(shuffled, 0)
          }}
          className="px-5 py-2 rounded-full border border-gray-600 text-white text-sm hover:border-white transition-colors"
        >
          🔀 Shuffle
        </button>
      </div>

      <div className="px-6 pb-32">
        <SongList songs={filtered} />
      </div>
    </div>
  )
}
