import { useNavigate } from 'react-router-dom'
import { getMoodMeta } from '../../utils/format'

const MOODS = [
  'Jatuh Cinta', 'Galau', 'Pop Indo', 'Indie Indo',
  'Barat', 'DJ & Remix', 'Lofi', 'Islamic', 'Game OST', '_Unknown',
]

export default function MoodGrid({ songs }) {
  const navigate = useNavigate()

  const countByMood = (mood) => songs.filter((s) => s.folder === mood).length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {MOODS.map((mood) => {
        const meta = getMoodMeta(mood)
        const count = countByMood(mood)
        if (count === 0) return null

        return (
          <button
            key={mood}
            onClick={() => navigate(`/genre/${encodeURIComponent(mood)}`)}
            className={`relative overflow-hidden rounded-xl p-4 text-left transition-transform hover:scale-105 bg-gradient-to-br ${meta.bg} h-28 shadow-lg`}
          >
            <p className="font-bold text-white text-base leading-tight">{mood === '_Unknown' ? 'Lainnya' : mood}</p>
            <p className="text-white/70 text-xs mt-1">{count} lagu</p>
            <span className="absolute bottom-2 right-3 text-4xl opacity-40">{meta.emoji}</span>
          </button>
        )
      })}
    </div>
  )
}
