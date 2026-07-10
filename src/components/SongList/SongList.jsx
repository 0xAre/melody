import { useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { formatDuration, getMoodMeta } from '../../utils/format'

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
)

export default function SongList({ songs, showIndex = true, showAlbum = false, onRemove }) {
  const { currentSong, isPlaying, playSong, setIsPlaying, toggleLike, isLiked, playlists, addToPlaylist } = usePlayerStore()
  const [menuSong, setMenuSong] = useState(null)

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      playSong(song, songs)
    }
  }

  const handleContextMenu = (e, song) => {
    e.preventDefault()
    setMenuSong(song)
  }

  return (
    <div className="w-full" onClick={() => setMenuSong(null)}>
      {/* Header — desktop shows all columns, mobile shows minimal */}
      <div
        className="hidden sm:grid text-xs text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-surface-3 mb-1"
        style={{ gridTemplateColumns: showIndex ? '32px 1fr auto auto auto' : '1fr auto auto auto' }}
      >
        {showIndex && <span>#</span>}
        <span>Judul</span>
        {showAlbum && <span className="px-4">Album</span>}
        <span className="px-6">Genre</span>
        <span className="w-12 text-center">♥</span>
        <span className="w-12 text-right">⏱</span>
      </div>
      {/* Mobile header */}
      <div className="sm:hidden text-xs text-gray-500 uppercase tracking-wider px-4 py-2 border-b border-surface-3 mb-1">
        <span>Judul</span>
      </div>

      {/* Rows */}
      {songs.map((song, i) => {
        const isActive = currentSong?.id === song.id
        const liked = isLiked(song.id)
        const meta = getMoodMeta(song.folder)

        return (
          <div
            key={song.id}
            onDoubleClick={() => handlePlay(song)}
            onContextMenu={(e) => handleContextMenu(e, song)}
            className={`group cursor-default transition-colors rounded-lg
              ${isActive ? 'bg-surface-hover' : 'hover:bg-surface-3'}`}
          >
            {/* Desktop row */}
            <div
              className="hidden sm:grid items-center px-4 py-2"
              style={{ gridTemplateColumns: showIndex ? '32px 1fr auto auto auto' : '1fr auto auto auto' }}
            >
              {showIndex && (
                <span className="text-sm">
                  <span className={`group-hover:hidden ${isActive ? 'hidden' : 'block'} text-gray-500`}>{i + 1}</span>
                  <button
                    onClick={() => handlePlay(song)}
                    className={`hidden group-hover:block ${isActive ? '!block' : ''} ${isActive ? 'text-primary' : 'text-white'}`}
                  >
                    {isActive && isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </span>
              )}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-surface-3 flex-shrink-0 overflow-hidden">
                  {song.artworkUrl
                    ? <img src={song.artworkUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  : <img src={meta.image} alt="fallback" loading="lazy" decoding="async" className="w-full h-full object-cover mix-blend-screen opacity-70 drop-shadow-md" />
                  }
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium text-ellipsis-1 ${isActive ? 'text-primary' : 'text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 text-ellipsis-1">{song.artist || 'Unknown'}</p>
                </div>
              </div>
              <div className="px-6">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: meta.color + '33', color: meta.color }}>
                  {song.folder}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(song) }}
                className={`w-12 flex justify-center transition-colors
                  ${liked ? 'text-primary opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
              >
                <HeartIcon filled={liked} />
              </button>
              <div className="w-12 flex items-center justify-end gap-2 relative">
                <span className="text-xs text-gray-500 group-hover:hidden">{formatDuration(song.duration)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuSong(menuSong?.id === song.id ? null : song) }}
                  className="hidden group-hover:flex text-gray-400 hover:text-white"
                >
                  <DotsIcon />
                </button>
                {menuSong?.id === song.id && (
                  <div
                    className="absolute bottom-8 right-0 bg-surface-3 border border-surface-hover rounded-lg shadow-xl z-50 min-w-48 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ContextMenuItems song={song} liked={liked} handlePlay={handlePlay} toggleLike={toggleLike} playlists={playlists} addToPlaylist={addToPlaylist} onRemove={onRemove} setMenuSong={setMenuSong} />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile row — compact layout */}
            <div
              className="sm:hidden flex items-center px-3 py-3 gap-3"
              onClick={() => handlePlay(song)}
            >
              {/* Artwork */}
              <div className="w-12 h-12 rounded-lg bg-surface-3 flex-shrink-0 overflow-hidden">
                {song.artworkUrl
                  ? <img src={song.artworkUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  : <img src={meta.image} alt="fallback" loading="lazy" decoding="async" className="w-full h-full object-cover mix-blend-screen opacity-70 drop-shadow-md" />
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-ellipsis-1 ${isActive ? 'text-primary' : 'text-white'}`}>
                  {song.title}
                </p>
                <p className="text-xs text-gray-400 text-ellipsis-1">{song.artist || 'Unknown'}</p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => toggleLike(song)}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${liked ? 'text-primary' : 'text-gray-500'}`}
                >
                  <HeartIcon filled={liked} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuSong(menuSong?.id === song.id ? null : song) }}
                  className="w-9 h-9 flex items-center justify-center text-gray-400"
                >
                  <DotsIcon />
                </button>
                {menuSong?.id === song.id && (
                  <div
                    className="absolute right-3 bg-surface-3 border border-surface-hover rounded-lg shadow-xl z-50 min-w-48 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ContextMenuItems song={song} liked={liked} handlePlay={handlePlay} toggleLike={toggleLike} playlists={playlists} addToPlaylist={addToPlaylist} onRemove={onRemove} setMenuSong={setMenuSong} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {songs.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🎵</p>
          <p>Tidak ada lagu</p>
        </div>
      )}
    </div>
  )
}

function ContextMenuItems({ song, liked, handlePlay, toggleLike, playlists, addToPlaylist, onRemove, setMenuSong }) {
  return (
    <>
      <button onClick={() => { handlePlay(song); setMenuSong(null) }}
        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-surface-hover">
        Putar
      </button>
      <button onClick={() => { toggleLike(song); setMenuSong(null) }}
        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-surface-hover">
        {liked ? 'Hapus dari Liked' : 'Tambah ke Liked'}
      </button>
      {playlists.length > 0 && (
        <div className="border-t border-surface-hover mt-1 pt-1">
          <p className="px-4 py-1 text-xs text-gray-500">Tambah ke Playlist</p>
          {playlists.map((pl) => (
            <button key={pl.id} onClick={() => { addToPlaylist(pl.id, song); setMenuSong(null) }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-surface-hover text-ellipsis-1">
              {pl.name}
            </button>
          ))}
        </div>
      )}
      {onRemove && (
        <button onClick={() => { onRemove(song.id); setMenuSong(null) }}
          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-hover border-t border-surface-hover mt-1">
          Hapus dari daftar
        </button>
      )}
    </>
  )
}
