import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { useAudio } from '../../hooks/useAudio'
import { formatTime } from '../../utils/format'

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
)
const SkipNextIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
)
const SkipPrevIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
)
const ShuffleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
)
const RepeatIcon = ({ mode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    {mode === 'one'
      ? <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
      : <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />}
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
const VolumeIcon = ({ muted, level }) => {
  if (muted || level === 0)
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
  if (level < 0.5)
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
}
const QueueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" /></svg>
)

export default function PlayerBar({ onQueueToggle }) {
  const {
    currentSong, isPlaying, shuffle, repeatMode, volume, isMuted,
    setIsPlaying, next, prev, toggleShuffle, cycleRepeat, setVolume, toggleMute, toggleLike, isLiked,
  } = usePlayerStore()

  const { seek, getSeek, getDuration, getCurrentTime } = useAudio()
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const raf = useRef(null)

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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.code === 'Space') { e.preventDefault(); setIsPlaying(!isPlaying) }
      if (e.code === 'ArrowRight') seek(Math.min(1, getSeek() + 10 / (getDuration() || 1)))
      if (e.code === 'ArrowLeft') seek(Math.max(0, getSeek() - 10 / (getDuration() || 1)))
      if (e.code === 'ArrowUp') { e.preventDefault(); setVolume(Math.min(1, volume + 0.1)) }
      if (e.code === 'ArrowDown') { e.preventDefault(); setVolume(Math.max(0, volume - 0.1)) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isPlaying, volume])

  if (!currentSong) {
    return (
      <div className="h-20 bg-surface-2 border-t border-surface-3 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Pilih lagu untuk mulai</p>
      </div>
    )
  }

  const liked = isLiked(currentSong.id)

  return (
    <div className="h-20 bg-surface-2 border-t border-surface-3 flex items-center px-4 gap-4">
      {/* Song Info */}
      <div className="flex items-center gap-3 w-72 flex-shrink-0">
        <div className="w-14 h-14 rounded bg-surface-3 flex-shrink-0 overflow-hidden">
          {currentSong.artworkUrl
            ? <img src={currentSong.artworkUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🎵</div>
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white text-ellipsis-1">{currentSong.title}</p>
          <p className="text-xs text-gray-400 text-ellipsis-1">{currentSong.artist || 'Unknown Artist'}</p>
        </div>
        <button
          onClick={() => toggleLike(currentSong)}
          className={`ml-1 transition-colors flex-shrink-0 ${liked ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      {/* Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={`transition-colors ${shuffle ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
          >
            <ShuffleIcon />
          </button>
          <button onClick={prev} className="text-gray-300 hover:text-white transition-colors">
            <SkipPrevIcon />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={next} className="text-gray-300 hover:text-white transition-colors">
            <SkipNextIcon />
          </button>
          <button
            onClick={cycleRepeat}
            className={`transition-colors relative ${repeatMode !== 'off' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
          >
            <RepeatIcon mode={repeatMode} />
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1 bg-surface-3 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              seek((e.clientX - rect.left) / rect.width)
            }}
          >
            <div
              className="h-full bg-white rounded-full group-hover:bg-primary transition-colors relative"
              style={{ width: `${progress * 100}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
          <span className="text-xs text-gray-500 w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume + Queue */}
      <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
        <button onClick={onQueueToggle} className="text-gray-400 hover:text-white transition-colors">
          <QueueIcon />
        </button>
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          <VolumeIcon muted={isMuted} level={volume} />
        </button>
        <input
          type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-24 accent-primary h-1 cursor-pointer"
        />
      </div>
    </div>
  )
}
