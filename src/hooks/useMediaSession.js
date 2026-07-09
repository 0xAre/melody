/**
 * useMediaSession
 * Menghubungkan player ke Media Session API browser sehingga:
 *  - Lock screen controls muncul di Android/iOS
 *  - Notification bar menampilkan artwork, judul, artis + tombol prev/play/pause/next
 *  - Headset hardware buttons (play/pause/next/prev) berfungsi
 */
import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function useMediaSession({ getCurrentTime, getDuration, seek }) {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    next,
    prev,
  } = usePlayerStore()

  // Set metadata setiap kali lagu berganti
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!currentSong) return

    const artwork = []

    // Gunakan artworkUrl lokal jika ada
    if (currentSong.artworkUrl) {
      // artworkUrl bisa berupa path relatif (/artwork/xxx.jpg) — jadikan absolute
      const base = window.location.origin
      const href = currentSong.artworkUrl.startsWith('http')
        ? currentSong.artworkUrl
        : `${base}${currentSong.artworkUrl}`

      artwork.push(
        { src: href, sizes: '96x96',   type: 'image/jpeg' },
        { src: href, sizes: '128x128', type: 'image/jpeg' },
        { src: href, sizes: '192x192', type: 'image/jpeg' },
        { src: href, sizes: '256x256', type: 'image/jpeg' },
        { src: href, sizes: '512x512', type: 'image/jpeg' },
      )
    } else {
      // Fallback: icon app
      const base = window.location.origin
      artwork.push(
        { src: `${base}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      )
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title:  currentSong.title  || 'Unknown',
      artist: currentSong.artist || 'Unknown Artist',
      album:  currentSong.album  || currentSong.folder || 'Melody',
      artwork,
    })
  }, [currentSong?.id, currentSong?.artworkUrl])

  // Sync playback state ke Media Session
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // Daftarkan action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const handlers = {
      play:          () => setIsPlaying(true),
      pause:         () => setIsPlaying(false),
      stop:          () => setIsPlaying(false),
      nexttrack:     () => next(),
      previoustrack: () => prev(),
      seekto: (details) => {
        if (details.seekTime !== undefined) {
          const dur = getDuration()
          if (dur) seek(details.seekTime / dur)
        }
      },
      seekforward: (details) => {
        const skip = details.seekOffset ?? 10
        const cur  = getCurrentTime()
        const dur  = getDuration()
        if (dur) seek(Math.min((cur + skip) / dur, 1))
      },
      seekbackward: (details) => {
        const skip = details.seekOffset ?? 10
        const cur  = getCurrentTime()
        const dur  = getDuration()
        if (dur) seek(Math.max((cur - skip) / dur, 0))
      },
    }

    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // Browser lama mungkin tidak support semua action
      }
    }

    return () => {
      for (const action of Object.keys(handlers)) {
        try { navigator.mediaSession.setActionHandler(action, null) } catch { /* noop */ }
      }
    }
  }, [next, prev, seek, getCurrentTime, getDuration, setIsPlaying])

  // Update posisi (position state) secara berkala agar seekbar lock screen akurat
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    if (!isPlaying) return

    const interval = setInterval(() => {
      try {
        const dur = getDuration()
        const pos = getCurrentTime()
        if (dur > 0) {
          navigator.mediaSession.setPositionState({
            duration:     dur,
            playbackRate: 1,
            position:     Math.min(pos, dur),
          })
        }
      } catch { /* noop */ }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, getDuration, getCurrentTime])
}
