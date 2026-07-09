import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useAudio } from '../../hooks/useAudio'
import { formatTime } from '../../utils/format'

const PlayIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
)
const SkipNextIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
)
const SkipPrevIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
)
const ShuffleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
)
const RepeatIcon = ({ mode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    {mode === 'one'
      ? <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      : <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />}
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
const ChevronDownIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" /></svg>
)
const VolumeIcon = ({ muted, level }) => {
  if (muted || level === 0)
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
  if (level < 0.5)
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
}

export default function MiniPlayer({ onClose }) {
  const {
    currentSong, isPlaying, shuffle, repeatMode, volume, isMuted,
    setIsPlaying, next, prev, toggleShuffle, cycleRepeat, setVolume, toggleMute, toggleLike, isLiked,
  } = usePlayerStore()

  const { seek, getSeek, getDuration, getCurrentTime } = useAudio()
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const raf = useRef(null)

  // Touch drag to dismiss
  const [dragY, setDragY] = useState(0)
  const touchStartY = useRef(null)

  useEffect(() => {
    const tick = () => {
      setProgress(getSeek())
      setCurrentTime(getCurrentTime())
      setDuration(getDuration())
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e) => {
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setDragY(dy)
  }
  const handleTouchEnd = () => {
    if (dragY > 120) onClose()
    setDragY(0)
  }

  if (!currentSong) return null

  const liked = isLiked(currentSong.id)

  return (
    <div
      className="fixed inset-0 z-50 bg-surface flex flex-col"
      style={{ transform: `translateY(${dragY}px)`, transition: dragY === 0 ? 'transform 0.3s ease' : 'none' }}
    >
      {/* Drag handle area */}
      <div
        className="flex flex-col items-center pt-safe"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mt-3 mb-2" />
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-4 pb-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white active:text-white"
          >
            <ChevronDownIcon />
          </button>
          <div className="text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sedang Diputar</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Artwork */}
      <div className="flex-1 flex items-center justify-center px-8 py-4 min-h-0">
        <div
          className="w-full aspect-square max-w-xs rounded-2xl bg-surface-3 overflow-hidden shadow-2xl"
          style={{
            boxShadow: isPlaying
              ? '0 30px 80px rgba(99,102,241,0.35), 0 10px 30px rgba(0,0,0,0.5)'
              : '0 20px 60px rgba(0,0,0,0.5)',
            transform: isPlaying ? 'scale(1)' : 'scale(0.9)',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          {currentSong.artworkUrl
            ? <img src={currentSong.artworkUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-7xl">🎵</div>
          }
        </div>
      </div>

      {/* Info + Like */}
      <div className="px-8 mb-5 flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <p className="text-xl font-bold text-white text-ellipsis-1">{currentSong.title}</p>
          <p className="text-sm text-gray-400 mt-0.5 text-ellipsis-1">{currentSong.artist || 'Unknown Artist'}</p>
        </div>
        <button
          onClick={() => toggleLike(currentSong)}
          className={`flex-shrink-0 transition-colors ${liked ? 'text-primary' : 'text-gray-500'}`}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-8 mb-3">
        <div
          className="w-full h-1.5 bg-surface-3 rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            seek((e.clientX - rect.left) / rect.width)
          }}
        >
          <div
            className="h-full bg-white rounded-full group-hover:bg-primary transition-colors relative"
            style={{ width: `${progress * 100}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-500 tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-xs text-gray-500 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="px-8 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleShuffle}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${shuffle ? 'text-primary' : 'text-gray-500'}`}
          >
            <ShuffleIcon />
          </button>
          <button onClick={prev} className="w-12 h-12 flex items-center justify-center text-white transition-opacity active:opacity-70">
            <SkipPrevIcon />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={next} className="w-12 h-12 flex items-center justify-center text-white transition-opacity active:opacity-70">
            <SkipNextIcon />
          </button>
          <button
            onClick={cycleRepeat}
            className={`w-10 h-10 flex items-center justify-center relative transition-colors ${repeatMode !== 'off' ? 'text-primary' : 'text-gray-500'}`}
          >
            <RepeatIcon mode={repeatMode} />
            {repeatMode !== 'off' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Volume */}
      <div
        className="px-8 flex items-center gap-3 mb-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <button onClick={toggleMute} className="text-gray-400">
          <VolumeIcon muted={isMuted} level={volume} />
        </button>
        <input
          type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-primary h-1 cursor-pointer"
        />
      </div>
    </div>
  )
}
