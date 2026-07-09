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
  'Jatuh Cinta': { color: '#ec4899', image: '/images/moods/heart.png', bg: 'from-pink-500 via-rose-500 to-red-500' },
  'Galau':        { color: '#3b82f6', image: '/images/moods/rose.png', bg: 'from-slate-800 via-blue-900 to-indigo-900' },
  'Bengong':      { color: '#8b5cf6', image: '/images/moods/bengong.png', bg: 'from-violet-500 via-purple-600 to-indigo-800' },
  'Pop Indo':     { color: '#f97316', image: '/images/moods/microphone.png', bg: 'from-orange-500 via-amber-500 to-yellow-500' },
  'Indie Indo':   { color: '#eab308', image: '/images/moods/guitar.png', bg: 'from-yellow-700 via-amber-800 to-stone-800' },
  'Barat':        { color: '#ef4444', image: '/images/moods/vinyl.png', bg: 'from-blue-600 via-indigo-700 to-purple-800' },
  'DJ & Remix':   { color: '#a855f7', image: '/images/moods/headphones.png', bg: 'from-violet-600 via-fuchsia-600 to-purple-800' },
  'Lofi':         { color: '#14b8a6', image: '/images/moods/coffee.png', bg: 'from-teal-600 via-emerald-700 to-cyan-800' },
  'Islamic':      { color: '#10b981', image: '/images/moods/lantern.png', bg: 'from-emerald-600 via-green-700 to-teal-800' },
  'Game OST':     { color: '#06b6d4', image: '/images/moods/gamepad.png', bg: 'from-cyan-500 via-blue-600 to-indigo-800' },
  '_Unknown':     { color: '#6b7280', image: '/images/moods/mysterybox.png', bg: 'from-gray-600 via-slate-700 to-neutral-800' },
}

export function getMoodMeta(folder) {
  return MOOD_META[folder] || { color: '#6b7280', image: '/images/moods/mysterybox.png', bg: 'from-gray-600 to-gray-700' }
}
