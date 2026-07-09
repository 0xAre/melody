import { useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import { getMoodMeta } from '../utils/format'

const MOODS = ['Jatuh Cinta', 'Galau', 'Pop Indo', 'Indie Indo', 'Barat', 'DJ & Remix', 'Lofi', 'Islamic', 'Game OST', '_Unknown']

export default function Library({ songs }) {
  const navigate = useNavigate()
  const { playlists, likedSongs, createPlaylist } = usePlayerStore()

  const handleNewPlaylist = () => {
    const name = prompt('Nama playlist:')
    if (name?.trim()) {
      const id = createPlaylist(name.trim())
      navigate(`/playlist/${id}`)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <h1 className="text-xl md:text-2xl font-bold text-white">Your Library</h1>

      {/* System collections */}
      <section>
        <h2 className="text-base md:text-lg font-bold text-white mb-3">Koleksi</h2>
        <div className="space-y-2">
          <CollectionRow
            image="/images/moods/heart.png" name="Liked Songs" subtitle={`${likedSongs.length} lagu`}
            onClick={() => navigate('/liked')}
          />
          {MOODS.map((mood) => {
            const count = songs.filter((s) => s.folder === mood).length
            if (!count) return null
            const meta = getMoodMeta(mood)
            return (
              <CollectionRow
                key={mood} image={meta.image}
                name={mood === '_Unknown' ? 'Lainnya' : mood}
                subtitle={`${count} lagu`}
                color={meta.color}
                onClick={() => navigate(`/genre/${encodeURIComponent(mood)}`)}
              />
            )
          })}
        </div>
      </section>

      {/* Playlists */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">Playlist Saya</h2>
          <button onClick={handleNewPlaylist}
            className="text-sm text-primary hover:text-primary-light transition-colors">
            + Buat Baru
          </button>
        </div>
        {playlists.length === 0
          ? <p className="text-gray-500 text-sm">Belum ada playlist. Buat yang pertama!</p>
          : <div className="space-y-2">
              {playlists.map((pl) => (
                <CollectionRow
                  key={pl.id} image="/images/moods/microphone.png" name={pl.name} subtitle={`${pl.songs.length} lagu`}
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                />
              ))}
            </div>
        }
      </section>
    </div>
  )
}

function CollectionRow({ image, name, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-3 transition-colors text-left group"
    >
      <div
        className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative"
      >
        <img src={image} alt={name} className="w-12 h-12 object-contain mix-blend-screen drop-shadow-md group-hover:scale-105 transition-transform" />
      </div>
      <div>
        <p className="font-medium text-white">{name}</p>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </button>
  )
}
