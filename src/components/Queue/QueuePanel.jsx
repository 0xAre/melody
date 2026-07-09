import { usePlayerStore } from '../../store/playerStore'
import { getMoodMeta } from '../../utils/format'

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

export default function QueuePanel({ open, onClose }) {
  const { queue, queueIndex, currentSong, playSong } = usePlayerStore()

  if (!open) return null

  const upcoming = queue.slice(queueIndex + 1)

  return (
    <>
      {/* Desktop: side panel */}
      <div className="hidden md:flex w-72 flex-shrink-0 bg-surface-2 border-l border-surface-3 flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-surface-3 flex items-center justify-between">
          <h2 className="font-bold text-white">Queue</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>
        <QueueContent currentSong={currentSong} upcoming={upcoming} queue={queue} playSong={playSong} />
      </div>

      {/* Mobile: bottom sheet overlay */}
      <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in"
          onClick={onClose}
        />
        {/* Sheet */}
        <div className="relative bg-surface-2 rounded-t-2xl border-t border-surface-3 slide-up max-h-[75vh] flex flex-col"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 7.5rem)' }}
        >
          {/* Drag handle */}
          <div className="flex items-center justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>
          <div className="px-4 py-2 border-b border-surface-3 flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold text-white">Queue</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <CloseIcon />
            </button>
          </div>
          <QueueContent currentSong={currentSong} upcoming={upcoming} queue={queue} playSong={playSong} />
        </div>
      </div>
    </>
  )
}

function QueueContent({ currentSong, upcoming, queue, playSong }) {
  return (
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
          : <img src={meta.image} alt="fallback" className="w-full h-full object-cover mix-blend-screen opacity-70 drop-shadow-md p-1" />
        }
      </div>
      <div className="min-w-0">
        <p className={`text-sm text-ellipsis-1 font-medium ${active ? 'text-primary' : 'text-white'}`}>{song.title}</p>
        <p className="text-xs text-gray-500 text-ellipsis-1">{song.artist || 'Unknown'}</p>
      </div>
    </div>
  )
}
