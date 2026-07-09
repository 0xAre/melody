/**
 * Retry upload file yang gagal dari upload-r2.js
 * Cara pakai:
 *   1. Jalankan setelah upload-r2.js selesai
 *   2. Script ini akan baca log, cari yang ✗, lalu retry
 *
 * PowerShell:
 *   $env:CLOUDFLARE_API_TOKEN="..."; node scripts/retry-failed.js
 *
 * Atau pass log file manual:
 *   $env:CLOUDFLARE_API_TOKEN="..."; node scripts/retry-failed.js path/to/task.log
 */

import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { lookup as mimeLookup } from 'mime-types'

const MUSIC_DIR  = 'E:/Music'
const BUCKET     = 'melody-music'
const PARALLEL   = 4   // lebih kecil agar tidak timeout
const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || '5833c680770b4a930c64b5d31ae46dec'
const API_TOKEN  = process.env.CLOUDFLARE_API_TOKEN

if (!API_TOKEN) {
  console.error('❌ Set env: $env:CLOUDFLARE_API_TOKEN="your_token"')
  process.exit(1)
}

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`

// --- Parse log untuk cari file yang gagal ---
async function getFailedKeysFromLog(logPath) {
  if (!logPath || !existsSync(logPath)) {
    console.error(`❌ Log file tidak ditemukan: ${logPath}`)
    console.error('   Usage: node scripts/retry-failed.js <path-to-log>')
    process.exit(1)
  }

  const content = await readFile(logPath, 'utf8')
  const failed = []

  // Match baris seperti: ✗ [6/566] Barat/Lainnya/file.mp3: fetch failed
  const regex = /✗ \[\d+\/\d+\] (.+?)(?:: .+)?$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    failed.push(match[1].trim())
  }

  return [...new Set(failed)] // deduplicate
}

// --- Upload satu file ---
async function uploadFile(key, index, total, retryCount = 3) {
  const localPath = path.join(MUSIC_DIR, key.replace(/\//g, path.sep))
  if (!existsSync(localPath)) {
    console.warn(`  ⚠ Skip (file not found): ${key}`)
    return
  }

  const body = await readFile(localPath)
  const mime = mimeLookup(localPath) || 'audio/mpeg'
  const url  = `${BASE_URL}/${key.split('/').map(encodeURIComponent).join('/')}`

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${API_TOKEN}`, 'Content-Type': mime },
        body,
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`HTTP ${res.status}: ${txt}`)
      }
      process.stdout.write(`  ✓ [${index}/${total}] ${key}\n`)
      return
    } catch (err) {
      if (attempt < retryCount) {
        process.stdout.write(`  ↻ [${index}/${total}] attempt ${attempt} gagal, retry... (${key})\n`)
        await new Promise(r => setTimeout(r, 1000 * attempt)) // backoff
      } else {
        throw err
      }
    }
  }
}

// --- Main ---
async function main() {
  const logPath = process.argv[2]

  if (!logPath) {
    console.error('❌ Harap sertakan path ke log file:')
    console.error('   node scripts/retry-failed.js <path-to-task-log>')
    console.error('')
    console.error('   Log biasanya ada di:')
    console.error('   C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\<conv-id>\\.system_generated\\tasks\\task-XX.log')
    process.exit(1)
  }

  console.log(`📋 Membaca log: ${logPath}`)
  const failedKeys = await getFailedKeysFromLog(logPath)

  if (failedKeys.length === 0) {
    console.log('✅ Tidak ada file yang gagal di log!')
    return
  }

  console.log(`\n🔁 Retry ${failedKeys.length} file yang gagal (${PARALLEL} paralel)...\n`)
  failedKeys.forEach((k, i) => console.log(`  ${i + 1}. ${k}`))
  console.log()

  let done = 0, failed = 0
  const total = failedKeys.length

  for (let i = 0; i < failedKeys.length; i += PARALLEL) {
    const batch = failedKeys.slice(i, i + PARALLEL)
    const results = await Promise.allSettled(
      batch.map((key, j) => uploadFile(key, i + j + 1, total))
    )
    results.forEach((r, j) => {
      if (r.status === 'rejected') {
        failed++
        console.error(`  ✗ [${i+j+1}/${total}] ${batch[j]}: ${r.reason.message}`)
      } else done++
    })
  }

  console.log(`\n=== Retry Selesai: ${done} berhasil, ${failed} masih gagal dari ${total} file ===`)
  if (failed > 0) {
    console.log('💡 Jalankan lagi jika masih ada yang gagal (network issue biasanya sementara)')
  }
}

main().catch(console.error)
