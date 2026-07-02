export function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function formatDuration(seconds) {
  if (!seconds) return '--:--'
  return formatTime(seconds)
}

export const MOOD_META = {
  'Jatuh Cinta': { color: '#ec4899', emoji: '💕', bg: 'from-pink-600 to-rose-700' },
  'Galau':        { color: '#3b82f6', emoji: '🌧️', bg: 'from-blue-600 to-indigo-700' },
  'Pop Indo':     { color: '#f97316', emoji: '🎵', bg: 'from-orange-500 to-amber-600' },
  'Indie Indo':   { color: '#eab308', emoji: '🎸', bg: 'from-yellow-500 to-orange-500' },
  'Barat':        { color: '#ef4444', emoji: '🌍', bg: 'from-red-600 to-rose-700' },
  'DJ & Remix':   { color: '#a855f7', emoji: '🎧', bg: 'from-purple-600 to-violet-700' },
  'Lofi':         { color: '#14b8a6', emoji: '☕', bg: 'from-teal-500 to-cyan-600' },
  'Islamic':      { color: '#10b981', emoji: '🌙', bg: 'from-emerald-600 to-green-700' },
  'Game OST':     { color: '#06b6d4', emoji: '🎮', bg: 'from-cyan-500 to-blue-600' },
  '_Unknown':     { color: '#6b7280', emoji: '❓', bg: 'from-gray-600 to-gray-700' },
}

export function getMoodMeta(folder) {
  return MOOD_META[folder] || { color: '#6b7280', emoji: '🎵', bg: 'from-gray-600 to-gray-700' }
}
