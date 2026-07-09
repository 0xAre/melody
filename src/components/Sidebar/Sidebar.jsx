import { NavLink, useNavigate } from 'react-router-dom'
import { usePlayerStore } from '../../store/playerStore'

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const LibraryIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
  </svg>
)
const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)
const MusicNoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
)
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

export default function Sidebar({ isOpen, onClose }) {
  const { playlists, likedSongs, createPlaylist } = usePlayerStore()
  const navigate = useNavigate()

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
    ${isActive ? 'text-white bg-surface-hover' : 'text-gray-400 hover:text-white'}`

  const handleNewPlaylist = () => {
    const name = prompt('Nama playlist:')
    if (name?.trim()) {
      const id = createPlaylist(name.trim())
      navigate(`/playlist/${id}`)
      onClose?.()
    }
  }

  const handleNavClick = () => {
    onClose?.()
  }

  const sidebarContent = (
    <aside className="w-64 flex-shrink-0 bg-black flex flex-col h-full">
      {/* Logo + Close button (mobile only) */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">♪</span>
          <span className="text-xl font-bold text-white tracking-tight">Melody</span>
        </div>
        {/* Close button only visible in mobile drawer mode */}
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="px-3 space-y-1" onClick={handleNavClick}>
        <NavLink to="/" end className={navClass}>
          <HomeIcon />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navClass}>
          <SearchIcon />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={navClass}>
          <LibraryIcon />
          <span>Your Library</span>
        </NavLink>
      </nav>

      {/* Library Section */}
      <div className="mt-6 px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Playlist</span>
          <button
            onClick={handleNewPlaylist}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title="Buat playlist baru"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Liked Songs */}
        <NavLink
          to="/liked"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
            ${isActive ? 'text-white bg-surface-hover' : 'text-gray-400 hover:text-white'}`
          }
        >
          <div className="w-8 h-8 rounded gradient-primary flex items-center justify-center flex-shrink-0">
            <HeartIcon />
          </div>
          <div className="min-w-0">
            <p className="text-ellipsis-1 text-white text-sm font-medium">Liked Songs</p>
            <p className="text-xs text-gray-500">{likedSongs.length} lagu</p>
          </div>
        </NavLink>

        {/* User Playlists */}
        {playlists.map((pl) => (
          <NavLink
            key={pl.id}
            to={`/playlist/${pl.id}`}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer
              ${isActive ? 'text-white bg-surface-hover' : 'text-gray-400 hover:text-white'}`
            }
          >
            <div className="w-8 h-8 rounded bg-surface-3 flex items-center justify-center flex-shrink-0">
              <MusicNoteIcon />
            </div>
            <div className="min-w-0">
              <p className="text-ellipsis-1 text-white text-sm font-medium">{pl.name}</p>
              <p className="text-xs text-gray-500">{pl.songs.length} lagu</p>
            </div>
          </NavLink>
        ))}
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible sidebar */}
      <div className="hidden md:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile: drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-in"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <div className="relative h-full slide-up" style={{ animation: 'slideLeft 0.3s cubic-bezier(0.32, 0.72, 0, 1) forwards' }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
