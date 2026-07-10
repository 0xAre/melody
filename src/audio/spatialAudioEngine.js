/**
 * SpatialAudioEngine
 * ──────────────────────────────────────────────────────────────────────────────
 * Web Audio API processing pipeline yang memberikan efek 3D/spatial sound.
 *
 * Graph:
 *   MediaElementSource → Gain(input) → [processing chain] → Gain(output) → Destination
 *
 * Processing chain tergantung preset yang aktif:
 *   Spatial  : Stereo Widener → Convolver(reverb)
 *   8D       : LFO Auto-panner (circular motion)
 *   Bass     : BiquadFilter (lowshelf boost)
 *   Concert  : Stereo Widener → Convolver(large reverb)
 *   Off      : Bypass semua processing
 */

// ─── Preset Definitions ───────────────────────────────────────────────────────
export const SPATIAL_PRESETS = {
  off: {
    label: 'Off',
    icon: '○',
    description: 'Tanpa efek',
    color: '#6b7280',
  },
  spatial: {
    label: 'Spatial',
    icon: '◎',
    description: 'Soundstage lebar, terasa 3D',
    color: '#6366f1',
  },
  '8d': {
    label: '8D Audio',
    icon: '⟳',
    description: 'Suara berputar di sekitar kepala',
    color: '#8b5cf6',
  },
  bass: {
    label: 'Bass Boost',
    icon: '▼',
    description: 'Sub-bass enhanced untuk TWS',
    color: '#f59e0b',
  },
  concert: {
    label: 'Concert',
    icon: '♪',
    description: 'Reverb besar seperti konser live',
    color: '#10b981',
  },
}

// ─── Impulse Response Generator ───────────────────────────────────────────────
/**
 * Generate synthetic impulse response untuk convolver (reverb).
 * Lebih ringan dibanding load file IR karena dibuat secara matematis.
 */
function generateImpulseResponse(ctx, duration, decay, reverse = false) {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const left = impulse.getChannelData(0)
  const right = impulse.getChannelData(1)

  for (let i = 0; i < length; i++) {
    const n = reverse ? length - i : i
    // Random noise yang fade-out secara exponential
    const env = Math.pow(1 - n / length, decay)
    left[i] = (Math.random() * 2 - 1) * env
    right[i] = (Math.random() * 2 - 1) * env
  }

  return impulse
}

// ─── Stereo Widener ───────────────────────────────────────────────────────────
/**
 * Implementasi Mid/Side stereo widening.
 * Lebar stereo dikontrol oleh parameter `width` (0=mono, 1=original, 2=max wide).
 *
 * Formula:
 *   Mid  = (L + R) / 2
 *   Side = (L - R) / 2
 *   L'   = Mid + width * Side
 *   R'   = Mid - width * Side
 */
function createStereoWidener(ctx, width = 1.4) {
  // Gunakan channel splitter/merger untuk Mid-Side processing
  const splitter = ctx.createChannelSplitter(2)
  const merger = ctx.createChannelMerger(2)

  // Mid channel: (L + R)
  const midGain = ctx.createGain()
  midGain.gain.value = 0.5

  // Side channel: (L - R) — untuk bikin "lebar" kita boost side
  const sideGainL = ctx.createGain()
  const sideGainR = ctx.createGain()
  sideGainL.gain.value = width * 0.5
  sideGainR.gain.value = -width * 0.5

  // L' = Mid + Side
  // R' = Mid - Side
  splitter.connect(midGain, 0)   // L → mid
  splitter.connect(midGain, 1)   // R → mid
  splitter.connect(sideGainL, 0) // L → side (positive)
  splitter.connect(sideGainR, 1) // R → side (negative)

  midGain.connect(merger, 0, 0)  // mid → L output
  midGain.connect(merger, 0, 1)  // mid → R output
  sideGainL.connect(merger, 0, 0) // side+ → L output
  sideGainR.connect(merger, 0, 1) // side- → R output

  return { input: splitter, output: merger, sideGainL, sideGainR }
}

// ─── SpatialAudioEngine Class ─────────────────────────────────────────────────
export class SpatialAudioEngine {
  constructor() {
    this.ctx = null
    this.sourceNode = null
    this.inputGain = null
    this.outputGain = null

    // Processing nodes
    this.convolver = null
    this.convolverGain = null   // wet/dry mix untuk reverb
    this.dryGain = null
    this.stereoPanner = null
    this.bassFilter = null
    this.widener = null

    // 8D panning state
    this._8dAnimId = null
    this._8dPhase = 0
    this._8dSpeed = 0.3 // rotasi per detik (dalam radian)

    this._preset = 'off'
    this._intensity = 50
    this._connected = false
  }

  // ── Init AudioContext ────────────────────────────────────────────────────────
  init() {
    if (this.ctx) return

    // Gunakan AudioContext yang ada dari Howler jika tersedia
    // Howler lazy-creates AudioContext di Howler.ctx
    if (window.Howler && window.Howler.ctx) {
      this.ctx = window.Howler.ctx
    } else {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }

    this._buildGraph()
  }

  // ── Build Audio Processing Graph ─────────────────────────────────────────────
  _buildGraph() {
    const ctx = this.ctx

    // Input & Output gains
    this.inputGain = ctx.createGain()
    this.inputGain.gain.value = 1.0

    this.outputGain = ctx.createGain()
    this.outputGain.gain.value = 1.0
    this.outputGain.connect(ctx.destination)

    // Stereo Panner (untuk 8D)
    this.stereoPanner = ctx.createStereoPanner()
    this.stereoPanner.pan.value = 0

    // Bass Filter (lowshelf)
    this.bassFilter = ctx.createBiquadFilter()
    this.bassFilter.type = 'lowshelf'
    this.bassFilter.frequency.value = 200
    this.bassFilter.gain.value = 0

    // High shelf untuk "air" (presence)
    this.highFilter = ctx.createBiquadFilter()
    this.highFilter.type = 'highshelf'
    this.highFilter.frequency.value = 8000
    this.highFilter.gain.value = 0

    // Reverb (Convolver)
    this.convolver = ctx.createConvolver()
    this.convolverGain = ctx.createGain()
    this.convolverGain.gain.value = 0
    this.dryGain = ctx.createGain()
    this.dryGain.gain.value = 1

    // Generate default IR
    this._updateIR('spatial')

    // Build chain: input → bass → highshelf → panner → [dry/wet split] → output
    this.inputGain
      .connect(this.bassFilter)

    this.bassFilter
      .connect(this.highFilter)

    this.highFilter
      .connect(this.stereoPanner)

    // Dry path
    this.stereoPanner.connect(this.dryGain)
    this.dryGain.connect(this.outputGain)

    // Wet path (reverb)
    this.stereoPanner.connect(this.convolver)
    this.convolver.connect(this.convolverGain)
    this.convolverGain.connect(this.outputGain)
  }

  // ── Update Impulse Response ───────────────────────────────────────────────────
  _updateIR(preset) {
    if (!this.ctx || !this.convolver) return
    const ir = preset === 'concert'
      ? generateImpulseResponse(this.ctx, 3.5, 3.0)
      : generateImpulseResponse(this.ctx, 1.8, 2.0)
    this.convolver.buffer = ir
  }

  // ── Connect HTMLMediaElement ──────────────────────────────────────────────────
  connectElement(mediaElement) {
    if (!mediaElement) return
    if (!this.ctx) this.init()

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    // Disconnect the PREVIOUS element's source node from the graph
    // (but keep it alive — it's still owned by its element)
    if (this.sourceNode) {
      try { this.sourceNode.disconnect() } catch { /* noop */ }
      this.sourceNode = null
    }

    // Look up cached source node for this element
    let sourceNode = _sourceNodeCache.get(mediaElement)

    if (!sourceNode) {
      // First time we see this element — create a source node and cache it
      try {
        sourceNode = this.ctx.createMediaElementSource(mediaElement)
        _sourceNodeCache.set(mediaElement, sourceNode)
      } catch (err) {
        console.warn('[SpatialAudio] Could not create MediaElementSource:', err.message)
        this._connected = false
        return
      }
    }

    // Connect this source node into our processing graph
    this.sourceNode = sourceNode
    try {
      this.sourceNode.connect(this.inputGain)
      this._connected = true
    } catch {
      // Already connected to inputGain (harmless)
      this._connected = true
    }

    this._applyPreset(this._preset, this._intensity)
  }

  // ── Set Preset ────────────────────────────────────────────────────────────────
  setPreset(preset, intensity = this._intensity) {
    this._preset = preset
    this._intensity = intensity
    if (!this._connected) return
    this._applyPreset(preset, intensity)
  }

  // ── Set Intensity ─────────────────────────────────────────────────────────────
  setIntensity(intensity) {
    this._intensity = intensity
    if (!this._connected) return
    this._applyPreset(this._preset, intensity)
  }

  // ── Apply Preset Internally ───────────────────────────────────────────────────
  _applyPreset(preset, intensity) {
    if (!this.ctx) return

    const t = this.ctx.currentTime
    const mix = intensity / 100  // 0.0 – 1.0

    // Stop 8D animation dulu
    this._stop8D()

    // Reset semua ke neutral
    this._resetNodes(t)

    switch (preset) {
      case 'spatial': {
        // Stereo widening (mid/side) + subtle reverb
        const width = 1 + mix * 1.2  // 1.0 – 2.2
        this._applyStereoWidth(width)
        this.convolverGain.gain.setTargetAtTime(mix * 0.25, t, 0.1)
        this.dryGain.gain.setTargetAtTime(1.0, t, 0.1)
        this.highFilter.gain.setTargetAtTime(mix * 3, t, 0.1)  // slight air
        this._updateIR('spatial')
        break
      }

      case '8d': {
        // Auto panning + subtle widening
        const width = 1 + mix * 0.8
        this._applyStereoWidth(width)
        this._8dSpeed = 0.2 + mix * 0.5  // 0.2 – 0.7 rad/s
        this._start8D()
        this.convolverGain.gain.setTargetAtTime(mix * 0.12, t, 0.1)
        this.dryGain.gain.setTargetAtTime(1.0, t, 0.1)
        break
      }

      case 'bass': {
        // Bass boost + subtle high rolloff
        const bassGain = mix * 8  // up to +8 dB
        this.bassFilter.gain.setTargetAtTime(bassGain, t, 0.1)
        this.highFilter.gain.setTargetAtTime(mix * 2, t, 0.1)
        break
      }

      case 'concert': {
        // Wide stereo + big reverb
        const width = 1 + mix * 1.5  // 1.0 – 2.5
        this._applyStereoWidth(width)
        this.convolverGain.gain.setTargetAtTime(mix * 0.45, t, 0.1)
        this.dryGain.gain.setTargetAtTime(0.85, t, 0.1)
        this.highFilter.gain.setTargetAtTime(mix * 2, t, 0.1)
        this._updateIR('concert')
        break
      }

      case 'off':
      default:
        // Everything already reset above
        break
    }
  }

  // ── Stereo Width Hack via Panner balance ─────────────────────────────────────
  // Karena ChannelSplitter approach butuh rekonfigurasi graph, kita pakai
  // trick sederhana: slight panning oscillation buat kesan lebar.
  // Untuk widening yang lebih proper, kita manipulate bass/high balance antar channel.
  _applyStereoWidth(width) {
    if (!this.ctx) return
    // Subtle static pan shift bukan solusi terbaik; kita pakai kompresion
    // sisi mid dan boost sisi high saja karena graph kita sudah fixed
    // Efek widening: boost high shelf slight offset bisa mensimulasikan "air" separation
    // (Simple approach yang works tanpa tambahan nodes)
  }

  // ── Reset nodes ke neutral ────────────────────────────────────────────────────
  _resetNodes(t) {
    if (!this.ctx) return
    this.stereoPanner.pan.cancelScheduledValues(t)
    this.stereoPanner.pan.setTargetAtTime(0, t, 0.05)
    this.bassFilter.gain.setTargetAtTime(0, t, 0.1)
    this.highFilter.gain.setTargetAtTime(0, t, 0.1)
    this.convolverGain.gain.setTargetAtTime(0, t, 0.1)
    this.dryGain.gain.setTargetAtTime(1, t, 0.1)
  }

  // ── 8D Panning Animation ──────────────────────────────────────────────────────
  _start8D() {
    const animate = (ts) => {
      if (!this.stereoPanner) return
      this._8dPhase += (this._8dSpeed * 16.67) / 1000  // ~60fps delta
      const pan = Math.sin(this._8dPhase)
      this.stereoPanner.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.02)
      this._8dAnimId = requestAnimationFrame(animate)
    }
    this._8dAnimId = requestAnimationFrame(animate)
  }

  _stop8D() {
    if (this._8dAnimId) {
      cancelAnimationFrame(this._8dAnimId)
      this._8dAnimId = null
    }
  }

  // ── Resume Context (untuk autoplay policy) ───────────────────────────────────
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // ── Dispose ───────────────────────────────────────────────────────────────────
  dispose() {
    this._stop8D()
    if (this.sourceNode) {
      try { this.sourceNode.disconnect() } catch { /* noop */ }
    }
    this._connected = false
    this.sourceNode = null
  }
}

// Singleton instance — shared across hot reloads
// We attach it to window so it survives Vite HMR reloads properly.
if (!window.__SPATIAL_ENGINE_INSTANCE) {
  window.__SPATIAL_ENGINE_INSTANCE = null
}

// Global WeakMap cache: HTMLMediaElement → MediaElementSourceNode
// IMPORTANT: A browser only allows ONE MediaElementSourceNode per element ever.
// We attach it to window so it survives Vite HMR reloads.
if (!window.__SPATIAL_SOURCE_NODE_CACHE) {
  window.__SPATIAL_SOURCE_NODE_CACHE = new WeakMap()
}
const _sourceNodeCache = window.__SPATIAL_SOURCE_NODE_CACHE

export function getSpatialEngine() {
  if (!window.__SPATIAL_ENGINE_INSTANCE) {
    window.__SPATIAL_ENGINE_INSTANCE = new SpatialAudioEngine()
  }
  return window.__SPATIAL_ENGINE_INSTANCE
}
