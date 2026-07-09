/**
 * Upload musik ke Cloudflare R2 via Cloudflare REST API (paralel 8 file).
 * Jalankan: node scripts/upload-r2.js
 * Butuh env var: CLOUDFLARE_API_TOKEN dan CF_ACCOUNT_ID
 *
 * PowerShell: $env:CLOUDFLARE_API_TOKEN="..."; $env:CF_ACCOUNT_ID="..."; node scripts/upload-r2.js
 */

import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { lookup as mimeLookup } from 'mime-types'

const MUSIC_DIR  = 'E:/Music'
const BUCKET     = 'melody-music'
const PARALLEL   = 8
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID  || '5833c680770b4a930c64b5d31ae46dec'
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN

if (!API_TOKEN) {
  console.error('Set env: $env:CLOUDFLARE_API_TOKEN="your_token"')
  process.exit(1)
}

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`

async function uploadFile(localPath, key, index, total) {
  const body  = await readFile(localPath)
  const mime  = mimeLookup(localPath) || 'audio/mpeg'
  const url   = `${BASE_URL}/${encodeURIComponent(key).replace(/%2F/g, '/')}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': mime },
    body,
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`HTTP ${res.status}: ${txt}`)
  }
  process.stdout.write(`  ✓ [${index}/${total}] ${key}\n`)
}

async function scanDir(dir, relPath = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      const sub = await scanDir(full, relPath ? `${relPath}/${e.name}` : e.name)
      files.push(...sub)
    } else if (/\.(mp3|m4a|webm)$/i.test(e.name)) {
      const key = relPath ? `${relPath}/${e.name}` : e.name
      files.push({ fullPath: full, key })
    }
  }
  return files
}

async function main() {
  const files = await scanDir(MUSIC_DIR)
  console.log(`\nUpload ${files.length} file ke R2 bucket "${BUCKET}" (${PARALLEL} paralel)...\n`)

  let done = 0, failed = 0
  for (let i = 0; i < files.length; i += PARALLEL) {
    const batch = files.slice(i, i + PARALLEL)
    const results = await Promise.allSettled(
      batch.map((f, j) => uploadFile(f.fullPath, f.key, i + j + 1, files.length))
    )
    results.forEach((r, j) => {
      if (r.status === 'rejected') {
        failed++
        console.error(`  ✗ [${i+j+1}/${files.length}] ${batch[j].key}: ${r.reason.message}`)
      } else done++
    })
  }

  console.log(`\n=== Selesai: ${done} berhasil, ${failed} gagal dari ${files.length} file ===`)
}

main().catch(console.error)
