import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

if (!existsSync('public/icons')) mkdirSync('public/icons', { recursive: true })

function createIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Rounded rect background dengan gradient
  const r = size * 0.195
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#6366f1')
  grad.addColorStop(1, '#a855f7')

  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  // Note musik
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = `bold ${Math.round(size * 0.55)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('♪', size / 2, size / 2 + size * 0.04)

  return canvas.toBuffer('image/png')
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of sizes) {
  const buf = createIcon(size)
  writeFileSync(`public/icons/icon-${size}.png`, buf)
  console.log(`✓ icon-${size}.png`)
}

// Alias untuk manifest (icon-192 dan icon-512 sudah dibuat di atas)
console.log('\nDone! Semua icon berhasil di-generate.')
