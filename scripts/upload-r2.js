/**
 * Upload musik ke Cloudflare R2 menggunakan AWS SDK v3 (S3-compatible).
 * Jalankan: node scripts/upload-r2.js
 *
 * Perlu R2 API credentials dari:
 * Cloudflare Dashboard → R2 → Manage R2 API Tokens → Create API Token
 * Pilih: Object Read & Write → Specific bucket: melody-music
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { lookup as mimeLookup } from 'mime-types'

const MUSIC_DIR  = 'E:/Music'
const BUCKET     = 'melody-music'
const PARALLEL   = 8  // jumlah upload paralel

// Isi dengan credentials dari Cloudflare Dashboard
const ACCOUNT_ID  = process.env.CF_ACCOUNT_ID  || 'ISI_ACCOUNT_ID'
const ACCESS_KEY  = process.env.R2_ACCESS_KEY   || 'ISI_ACCESS_KEY_ID'
const SECRET_KEY  = process.env.R2_SECRET_KEY   || 'ISI_SECRET_ACCESS_KEY'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
})

async function fileExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch { return false }
}

async function scanDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      files.push(...await scanDir(full))
    } else if (/\.(mp3|m4a|webm)$/i.test(e.name)) {
      files.push({ fullPath: full, folder: e.name === full ? '' : path.basename(path.dirname(full)), name: e.name })
    }
  }
  return files
}

async function upload(file, index, total) {
  const key = file.folder ? `${file.folder}/${file.name}` : file.name
  if (await fileExists(key)) {
    process.stdout.write(`  skip [${index}/${total}] ${file.name}\n`)
    return
  }
  const body = await readFile(file.fullPath)
  const contentType = mimeLookup(file.name) || 'audio/mpeg'
  await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }))
  process.stdout.write(`  ✓ [${index}/${total}] ${file.name}\n`)
}

async function main() {
  const files = await scanDir(MUSIC_DIR)
  console.log(`\nMulai upload ${files.length} file ke R2...\n`)

  for (let i = 0; i < files.length; i += PARALLEL) {
    const batch = files.slice(i, i + PARALLEL)
    await Promise.all(batch.map((f, j) => upload(f, i + j + 1, files.length)))
  }

  console.log('\n=== Upload selesai! ===')
}

main().catch(console.error)
