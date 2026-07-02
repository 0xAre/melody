import { parseFile } from 'music-metadata'
import { readdir, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Sesuaikan path ini dengan lokasi musik kamu
const MUSIC_DIR = 'E:/Music'
const OUTPUT_JSON = './public/songs.json'
const ARTWORK_DIR = './public/artwork'
// Base URL file audio di Cloudflare R2 (isi setelah setup R2)
const R2_BASE_URL = 'https://pub-f4d03a030d7f4c209a8d24207670d483.r2.dev'

const AUDIO_EXTS = ['.mp3', '.m4a', '.webm', '.ogg', '.flac', '.wav']

async function scanDir(dir, baseFolder = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const results = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const sub = await scanDir(fullPath, entry.name)
      results.push(...sub)
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (AUDIO_EXTS.includes(ext)) {
        results.push({ fullPath, filename: entry.name, folder: baseFolder || path.basename(dir) })
      }
    }
  }
  return results
}

async function extractMetadata(file) {
  try {
    const meta = await parseFile(file.fullPath, { duration: true, skipCovers: false })
    const { title, artist, album, genre } = meta.common
    const duration = meta.format.duration || 0

    let artworkUrl = null
    if (meta.common.picture?.length > 0) {
      const pic = meta.common.picture[0]
      const hash = crypto.createHash('md5').update(file.filename).digest('hex').slice(0, 8)
      const ext = pic.format.includes('png') ? 'png' : 'jpg'
      const artName = `${hash}.${ext}`
      const artPath = path.join(ARTWORK_DIR, artName)
      if (!existsSync(artPath)) {
        await writeFile(artPath, pic.data)
      }
      artworkUrl = `/artwork/${artName}`
    }

    const encodedPath = file.folder
      ? `${encodeURIComponent(file.folder)}/${encodeURIComponent(file.filename)}`
      : encodeURIComponent(file.filename)

    return {
      id: crypto.createHash('md5').update(file.filename).digest('hex'),
      title: title || path.basename(file.filename, path.extname(file.filename)),
      artist: artist || '',
      album: album || '',
      genre: genre?.[0] || '',
      duration: Math.round(duration),
      folder: file.folder,
      filename: file.filename,
      url: `${R2_BASE_URL}/${encodedPath}`,
      artworkUrl,
    }
  } catch (err) {
    console.warn(`Skip ${file.filename}: ${err.message}`)
    const encodedPath = file.folder
      ? `${encodeURIComponent(file.folder)}/${encodeURIComponent(file.filename)}`
      : encodeURIComponent(file.filename)
    return {
      id: crypto.createHash('md5').update(file.filename).digest('hex'),
      title: path.basename(file.filename, path.extname(file.filename)),
      artist: '',
      album: '',
      genre: '',
      duration: 0,
      folder: file.folder,
      filename: file.filename,
      url: `${R2_BASE_URL}/${encodedPath}`,
      artworkUrl: null,
    }
  }
}

async function main() {
  if (!existsSync(ARTWORK_DIR)) await mkdir(ARTWORK_DIR, { recursive: true })

  console.log(`Scanning ${MUSIC_DIR}...`)
  const files = await scanDir(MUSIC_DIR)
  console.log(`Found ${files.length} audio files`)

  const songs = []
  for (let i = 0; i < files.length; i++) {
    const song = await extractMetadata(files[i])
    songs.push(song)
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${files.length}...`)
  }

  await writeFile(OUTPUT_JSON, JSON.stringify(songs, null, 2), 'utf8')
  console.log(`\nDone! ${songs.length} lagu disimpan ke ${OUTPUT_JSON}`)
  console.log(`Artwork: ${songs.filter((s) => s.artworkUrl).length} lagu punya cover art`)
}

main().catch(console.error)
