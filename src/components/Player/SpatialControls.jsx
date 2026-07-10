import { useState, useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store/playerStore'
import { SPATIAL_PRESETS } from '../../audio/spatialAudioEngine'

// ── Icons ──────────────────────────────────────────────────────────────────────
const HeadphoneIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    {active && (
      <>
        <circle cx="6" cy="16" r="0.5" fill="currentColor" />
        <circle cx="18" cy="16" r="0.5" fill="currentColor" />
      </>
    )}
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

// ── Animated sound-wave indicator ─────────────────────────────────────────────
function WaveIndicator({ active, color }) {
  return (
    <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
      {[0.4, 1, 0.7, 1, 0.4].map((h, i) => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${h * 100}%`,
            borderRadius: '2px',
            backgroundColor: active ? color : '#374151',
            transition: 'background-color 0.3s',
            animation: active ? `wave-bar ${0.6 + i * 0.12}s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main SpatialControls Component ────────────────────────────────────────────
export default function SpatialControls({ buttonClassName = '' }) {
  const { spatialPreset, spatialIntensity, setSpatialPreset, setSpatialIntensity } =
    usePlayerStore()

  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  const isActive = spatialPreset !== 'off'
  const activePreset = SPATIAL_PRESETS[spatialPreset]

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        id="spatial-audio-toggle"
        onClick={() => setOpen((v) => !v)}
        title={isActive ? `Spatial: ${activePreset.label}` : 'Spatial Audio'}
        className={`transition-all duration-200 relative ${
          isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
        } ${buttonClassName}`}
        aria-label="Toggle spatial audio panel"
        aria-expanded={open}
      >
        <HeadphoneIcon active={isActive} />
        {/* Active dot indicator */}
        {isActive && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface-2"
            style={{ backgroundColor: activePreset.color }}
          />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="absolute bottom-full mb-2 right-0 z-50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            width: 'min(18rem, calc(100vw - 1.5rem))',
            background: 'linear-gradient(135deg, rgba(17,17,28,0.97) 0%, rgba(24,24,40,0.97) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">🎧 Spatial Audio</span>
              {isActive && (
                <WaveIndicator active={isActive} color={activePreset.color} />
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 hover:text-white transition-colors p-1"
              aria-label="Close spatial panel"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Preset Grid */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {Object.entries(SPATIAL_PRESETS).map(([key, preset]) => {
              const isSelected = spatialPreset === key
              return (
                <button
                  key={key}
                  id={`spatial-preset-${key}`}
                  onClick={() => setSpatialPreset(key)}
                  className={`
                    relative flex flex-col items-start gap-1 p-3 rounded-xl text-left
                    border transition-all duration-200 group
                    ${isSelected
                      ? 'border-white/20 shadow-lg scale-[1.02]'
                      : 'border-white/5 hover:border-white/15 hover:scale-[1.01]'}
                  `}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${preset.color}22 0%, ${preset.color}11 100%)`
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Active checkmark */}
                  {isSelected && (
                    <span
                      className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: preset.color }}
                    >
                      ✓
                    </span>
                  )}
                  <span
                    className="text-base font-medium"
                    style={{ color: isSelected ? preset.color : '#9ca3af' }}
                  >
                    {preset.icon} {preset.label}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    {preset.description}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Intensity Slider (hanya tampil kalau bukan Off) */}
          {spatialPreset !== 'off' && (
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">Intensitas</span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: activePreset.color }}
                >
                  {spatialIntensity}%
                </span>
              </div>
              <div className="relative">
                <input
                  id="spatial-intensity-slider"
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={spatialIntensity}
                  onChange={(e) => setSpatialIntensity(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${activePreset.color} ${spatialIntensity}%, rgba(255,255,255,0.1) ${spatialIntensity}%)`,
                    accentColor: activePreset.color,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-600">Subtle</span>
                <span className="text-[10px] text-gray-600">Max</span>
              </div>
            </div>
          )}

          {/* Footer hint */}
          <div className="px-4 pb-3">
            <p className="text-[10px] text-gray-600 text-center">
              Direkomendasikan untuk TWS / earbuds stereo
            </p>
          </div>
        </div>
      )}

      {/* Keyframe animation (injected once) */}
      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
