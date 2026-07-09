import { useParams, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../store/playerStore'
import SongList from '../components/SongList/SongList'

export default function Playlist() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { playlists, likedSongs, playQueue, removeFromPlaylist, deletePlaylist } = usePlayerStore()

  const isLiked = id === 'liked'
  const playlist = isLiked
    ? { id: 'liked', name: 'Liked Songs', songs: likedSongs }
    : playlists.find((p) => p.id === id)

  if (!playlist) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p className="text-4xl mb-3">😕</p>
        <p>Playlist tidak ditemukan.</p>
      </div>
    )
  }

  const totalSecs = playlist.songs.reduce((a, s) => a + (s.duration || 0), 0)
  const totalMin = Math.round(totalSecs / 60)

  const handleDelete = () => {
    if (confirm(`Hapus playlist "${playlist.name}"?`)) {
      deletePlaylist(id)
      navigate('/')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="px-4 md:px-6 pt-8 md:pt-12 pb-4 md:pb-6 bg-gradient-to-b from-indigo-900/60 to-surface flex flex-col sm:flex-row items-start sm:items-end gap-4 md:gap-6">
        <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-xl bg-surface-2 flex items-center justify-center shadow-xl flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <img 
            src={isLiked ? '/images/moods/heart.png' : '/images/moods/microphone.png'} 
            alt="Playlist Cover" 
            className="w-16 h-16 sm:w-24 sm:h-24 object-contain mix-blend-screen drop-shadow-2xl" 
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Playlist</p>
          <h1 className="text-2xl md:text-4xl font-bold text-white mt-1 text-ellipsis-2">{playlist.name}</h1>
          <p className="text-gray-400 text-sm mt-2">
            {playlist.songs.length} lagu · {totalMin} menit
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-6 py-4 flex items-center gap-3 md:gap-4">
        <button
          onClick={() => playlist.songs.length && playQueue(playlist.songs, 0)}
          disabled={!playlist.songs.length}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-primary flex items-center justify-center text-white text-xl md:text-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
        >
          ▶
        </button>
        {!isLiked && (
          <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Hapus playlist
          </button>
        )}
      </div>

      {/* Song list */}
      <div className="px-2 md:px-6 pb-6">
        <SongList
          songs={playlist.songs}
          onRemove={isLiked ? null : (songId) => removeFromPlaylist(id, songId)}
        />
      </div>
    </div>
  )
}
