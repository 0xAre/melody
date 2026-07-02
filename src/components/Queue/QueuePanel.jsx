import { usePlayerStore } from '../../store/playerStore'
import { getMoodMeta } from '../../utils/format'

export default function QueuePanel({ open }) {
  const { queue, queueIndex, currentSong, playSong } = usePlayerStore()

  if (!open) return null

  const upcoming = queue.slice(queueIndex + 1)

  return (
    <div className="w-72 flex-shrink-0 bg-surface-2 border-l border-surface-3 flex flex-col overflow-hidden">
      <div className="px-4 py-4 border-b border-surface-3">
        <h2 className="font-bold text-white">Queue</h2>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {currentSong && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Sedang diputar</p>
            <SongRow song={currentSong} active />
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">Selanjutnya</p>
            {upcoming.slice(0, 30).map((song) => (
              <SongRow key={song.id} song={song} onPlay={() => playSong(song, queue)} />
            ))}
            {upcoming.length > 30 && (
              <p className="text-xs text-gray-500 text-center py-2">+{upcoming.length - 30} lagi</p>
            )}
          </div>
        )}

        {upcoming.length === 0 && !currentSong && (
          <p className="text-sm text-gray-500 text-center py-8">Queue kosong</p>
        )}
      </div>
    </div>
  )
}

function SongRow({ song, active, onPlay }) {
  const meta = getMoodMeta(song.folder)
  return (
    <div
      onClick={onPlay}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors
        ${active ? 'bg-surface-hover' : 'hover:bg-surface-3 cursor-pointer'}`}
    >
      <div className="w-9 h-9 rounded bg-surface-3 flex-shrink-0 overflow-hidden">
        {song.artworkUrl
          ? <img src={song.artworkUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-base">{meta.emoji}</div>
        }
      </div>
      <div className="min-w-0">
        <p className={`text-sm text-ellipsis-1 font-medium ${active ? 'text-primary' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-gray-500 text-ellipsis-1">{song.artist || 'Unknown'}</p>
      </div>
    </div>
  )
}
