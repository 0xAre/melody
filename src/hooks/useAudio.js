import { useEffect, useRef } from 'react'
import { Howl, Howler } from 'howler'
import { usePlayerStore } from '../store/playerStore'
import { useMediaSession } from './useMediaSession'
import { getSpatialEngine } from '../audio/spatialAudioEngine'

export function useAudio() {
  const howlRef = useRef(null)
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    spatialPreset,
    spatialIntensity,
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

    const engine = getSpatialEngine()

    /**
     * buildHowl(withCORS)
     * ─────────────────────────────────────────────────────────────────────────
     * Buat Howl instance. Kalau withCORS=true, set crossOrigin='anonymous'
     * sebelum load agar Web Audio API bisa process audio lintas-origin.
     *
     * Jika CORS request gagal (server nggak kirim CORS headers = error 4),
     * onloaderror akan fallback ke buildHowl(false) yang load tanpa CORS.
     * Ini menjamin audio selalu bisa diputar — spatial effects jadi opsional.
     */
    const buildHowl = (withCORS) => {
      const srcUrl = withCORS ? `${currentSong.url}?cors=true` : currentSong.url;

      // ❗ CRITICAL FIX: Setting crossOrigin after 'new Howl()' is too late because 
      // Howler sets node.src synchronously, causing the browser to fetch WITHOUT CORS.
      // To bypass this, we inject a pre-configured <audio> node into Howler's pool
      // RIGHT BEFORE creating the Howl. Howler will pop this exact node and use it!
      if (Howler) {
        const preConfiguredNode = new Audio()
        if (withCORS) preConfiguredNode.crossOrigin = 'anonymous'
        
        if (!Howler._html5AudioPool) Howler._html5AudioPool = []
        Howler._html5AudioPool.push(preConfiguredNode)
      }

      const h = new Howl({
        src: [srcUrl],
        html5: true,
        preload: true, // we can safely preload now
        volume: isMuted ? 0 : volume,
        onplay: () => {
          setIsPlaying(true)
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing'
          }
        },
        onpause: () => {
          setIsPlaying(false)
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'
          }
        },
        onend: () => {
          if (repeatMode === 'one') {
            h.play()
          } else {
            next()
          }
        },
        onloaderror: (_, err) => {
          if (withCORS) {
            console.info('[SpatialAudio] CORS load failed (err=%s), retrying without CORS — spatial effects disabled', err)
            h.unload()
            
            // Kosongkan pool agar fallback dipaksa membuat <audio> baru (diinject ulang di atas)
            if (Howler && Howler._html5AudioPool) {
              Howler._html5AudioPool = []
            }

            const fallback = buildHowl(false)
            howlRef.current = fallback
            if (usePlayerStore.getState().isPlaying) fallback.play()
          } else {
            console.error('Load error:', err)
            next()
          }
        },
        onload: () => {
          if (!withCORS) return

          try {
            const node = h._sounds?.[0]?._node
            if (node) {
              engine.init()
              engine.connectElement(node)
              engine.setPreset(spatialPreset, spatialIntensity)
            }
          } catch (err) {
            console.warn('[SpatialAudio] Failed to connect:', err)
          }
        },
      })
      return h
    }

    // Tainted elements flag
    let _taintedNode = null;

    // Coba dengan CORS dulu; fallback otomatis ke non-CORS kalau gagal
    const howl = buildHowl(true)
    howlRef.current = howl
    if (isPlaying) howl.play()

    return () => {
      engine.dispose()
      howlRef.current?.unload()
    }
  }, [currentSong?.id])

  // ── Howl: play/pause ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!howlRef.current) return
    if (isPlaying) {
      getSpatialEngine().resume()
      howlRef.current.play()
    } else {
      howlRef.current.pause()
    }
  }, [isPlaying])

  // ── Howl: volume ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  // ── Spatial: sync preset & intensity changes ─────────────────────────────
  useEffect(() => {
    getSpatialEngine().setPreset(spatialPreset, spatialIntensity)
  }, [spatialPreset, spatialIntensity])

  return { seek, getSeek, getDuration, getCurrentTime }
}
