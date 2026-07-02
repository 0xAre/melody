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
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-indigo-900/60 to-surface flex items-end gap-6">
        <div className="w-36 h-36 rounded-xl gradient-primary flex items-center justify-center text-5xl shadow-xl flex-shrink-0">
          {isLiked ? '💕' : '🎵'}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Playlist</p>
          <h1 className="text-4xl font-bold text-white mt-1">{playlist.name}</h1>
          <p className="text-gray-400 text-sm mt-2">
            {playlist.songs.length} lagu · {totalMin} menit
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => playlist.songs.length && playQueue(playlist.songs, 0)}
          disabled={!playlist.songs.length}
          className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white text-2xl shadow-lg hover:scale-105 transition-transform disabled:opacity-40"
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
      <div className="px-6 pb-32">
        <SongList
          songs={playlist.songs}
          onRemove={isLiked ? null : (songId) => removeFromPlaylist(id, songId)}
        />
      </div>
    </div>
  )
}
