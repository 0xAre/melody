import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { usePlayerStore } from '../store/playerStore'

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

  useEffect(() => {
    if (!howlRef.current) return
    if (isPlaying) howlRef.current.play()
    else howlRef.current.pause()
  }, [isPlaying])

  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

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

  const getDuration = () => howlRef.current?.duration() || 0
  const getCurrentTime = () => howlRef.current?.seek() || 0

  return { seek, getSeek, getDuration, getCurrentTime }
}
