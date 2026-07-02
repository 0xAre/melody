import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const REPEAT_MODES = ['off', 'all', 'one']

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      shuffle: false,
      repeatMode: 'off',
      volume: 0.8,
      isMuted: false,
      likedSongs: [],
      recentlyPlayed: [],
      playlists: [],

      playSong: (song, queue = null) => {
        const newQueue = queue || get().queue
        const index = newQueue.findIndex((s) => s.id === song.id)
        set({
          currentSong: song,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
        })
        get()._addToRecent(song)
      },

      playQueue: (songs, startIndex = 0) => {
        set({
          queue: songs,
          queueIndex: startIndex,
          currentSong: songs[startIndex],
          isPlaying: true,
        })
        get()._addToRecent(songs[startIndex])
      },

      setIsPlaying: (val) => set({ isPlaying: val }),

      next: () => {
        const { queue, queueIndex, shuffle, repeatMode } = get()
        if (!queue.length) return
        if (repeatMode === 'one') {
          set({ isPlaying: true })
          return
        }
        let nextIndex
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length)
        } else {
          nextIndex = queueIndex + 1
          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') nextIndex = 0
            else return set({ isPlaying: false })
          }
        }
        const nextSong = queue[nextIndex]
        set({ currentSong: nextSong, queueIndex: nextIndex, isPlaying: true })
        get()._addToRecent(nextSong)
      },

      prev: () => {
        const { queue, queueIndex } = get()
        if (!queue.length) return
        const prevIndex = Math.max(0, queueIndex - 1)
        set({ currentSong: queue[prevIndex], queueIndex: prevIndex, isPlaying: true })
      },

      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

      cycleRepeat: () =>
        set((s) => ({
          repeatMode: REPEAT_MODES[(REPEAT_MODES.indexOf(s.repeatMode) + 1) % REPEAT_MODES.length],
        })),

      setVolume: (v) => set({ volume: v, isMuted: v === 0 }),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      toggleLike: (song) =>
        set((s) => {
          const isLiked = s.likedSongs.some((l) => l.id === song.id)
          return {
            likedSongs: isLiked
              ? s.likedSongs.filter((l) => l.id !== song.id)
              : [song, ...s.likedSongs],
          }
        }),

      isLiked: (songId) => get().likedSongs.some((l) => l.id === songId),

      createPlaylist: (name) => {
        const playlist = { id: Date.now().toString(), name, songs: [], createdAt: Date.now() }
        set((s) => ({ playlists: [...s.playlists, playlist] }))
        return playlist.id
      },

      addToPlaylist: (playlistId, song) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.songs.some((x) => x.id === song.id)
              ? { ...p, songs: [...p.songs, song] }
              : p
          ),
        })),

      removeFromPlaylist: (playlistId, songId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, songs: p.songs.filter((x) => x.id !== songId) } : p
          ),
        })),

      deletePlaylist: (playlistId) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== playlistId) })),

      _addToRecent: (song) =>
        set((s) => ({
          recentlyPlayed: [song, ...s.recentlyPlayed.filter((x) => x.id !== song.id)].slice(0, 20),
        })),
    }),
    {
      name: 'melody-player',
      partialize: (s) => ({
        likedSongs: s.likedSongs,
        recentlyPlayed: s.recentlyPlayed,
        playlists: s.playlists,
        volume: s.volume,
        shuffle: s.shuffle,
        repeatMode: s.repeatMode,
      }),
    }
  )
)
