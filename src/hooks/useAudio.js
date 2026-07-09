import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'
import { useMediaSession } from './useMediaSession'

export function useAudio() {
  const howlRef = useRef(null)
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    setIsPlaying,
    next,
  } = usePlayerStore()

  // ── Audio helpers (dibutuhkan oleh Media Session) ──────────────────────────
  const seek = (ratio) => {
    if (!howlRef.current) return
    const duration = howlRef.current.duration()
    howlRef.current.seek(ratio * duration)
  }

  const getSeek = () => {
    if (!howlRef.current) return 0
    const duration = howlRef.current.duration()
    if (!duration) return 0
    return howlRef.current.seek() / duration
  }

  const getDuration    = () => howlRef.current?.duration()    || 0
  const getCurrentTime = () => howlRef.current?.seek()        || 0

  // ── Media Session API (lock screen + notification controls) ────────────────
  useMediaSession({ getCurrentTime, getDuration, seek })

  // ── Howl: ganti lagu ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentSong) return

    if (howlRef.current) {
      howlRef.current.unload()
    }

    const howl = new Howl({
      src: [currentSong.url],
      html5: true,
      volume: isMuted ? 0 : volume,
      onend: () => {
        if (repeatMode === 'one') {
          howl.seek(0)
          howl.play()
        } else {
          next()
        }
      },
      onloaderror: (_, err) => {
        console.error('Load error:', err)
        next()
      },
    })

    howlRef.current = howl
    if (isPlaying) howl.play()

    return () => howl.unload()
  }, [currentSong?.id])

  // ── Howl: play/pause ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!howlRef.current) return
    if (isPlaying) howlRef.current.play()
    else howlRef.current.pause()
  }, [isPlaying])

  // ── Howl: volume ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  return { seek, getSeek, getDuration, getCurrentTime }
}
