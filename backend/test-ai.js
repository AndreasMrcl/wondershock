// test-ai.js — versi yang diperbaiki
// Jalankan dari folder backend/:
//   node test-ai.js                              → test koneksi saja
//   node test-ai.js foto.jpg "Lawang Sewu" 0.75  → test foto
//   node test-ai.js video.mp4 "Lawang Sewu" 0.75 → test video
'use strict'

require('dotenv').config()
const fs   = require('fs')
const path = require('path')
const { validateImage, validateVideo } = require('./src/config/aiValidation')

const IMAGE_PATH = process.argv[2] || null
const ANSWER_KEY = process.argv[3] || 'Lawang Sewu Semarang'
const THRESHOLD  = parseFloat(process.argv[4] || '0.75')

async function main() {
  console.log('\n🎭  Wondershock AI Validation Test')
  console.log('─'.repeat(45))

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.startsWith('sk-ant-xxx') || apiKey === 'your_key_here') {
    console.error('❌  ANTHROPIC_API_KEY belum diset di backend/.env')
    process.exit(1)
  }
  console.log('✓  API Key:', apiKey.slice(0, 18) + '...' + apiKey.slice(-4))
  console.log('✓  Mock mode:', process.env.AI_MOCK === 'true' ? 'AKTIF' : 'nonaktif')

  // ── Test koneksi saja jika tidak ada file ──
  if (!IMAGE_PATH) {
    console.log('\nMenguji koneksi ke Anthropic API...')
    try {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey, timeout: 15_000 })
      const res = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 20,
        messages: [{ role: 'user', content: 'Balas: OK' }],
      })
      const text = res.content[0]?.text?.trim()
      console.log('✓  Respons API:', text)
      console.log('\n✅  Koneksi OK. Siap validasi foto/video!\n')
      console.log('Cara test foto:')
      console.log('  node test-ai.js <path-foto> "<kunci jawaban>" [threshold]')
      console.log('  node test-ai.js foto.jpg "Lawang Sewu Semarang" 0.75\n')
    } catch (err) {
      console.error('❌  Gagal koneksi:', err.message)
      if (err.status === 401) console.error('   → API Key tidak valid atau sudah expired')
      if (err.status === 529) console.error('   → API sedang overloaded, coba lagi nanti')
    }
    return
  }

  // ── Test file ──
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`❌  File tidak ditemukan: ${IMAGE_PATH}`)
    process.exit(1)
  }

  const ext     = path.extname(IMAGE_PATH).toLowerCase()
  const isVideo = ['.mp4', '.mov', '.avi'].includes(ext)
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png',  '.webp': 'image/webp',
    '.mp4': 'video/mp4',  '.mov': 'video/quicktime',
  }
  const mimeType = mimeMap[ext] || 'image/jpeg'
  const buffer   = fs.readFileSync(IMAGE_PATH)

  console.log(`📎  File    : ${IMAGE_PATH}`)
  console.log(`📏  Ukuran  : ${(buffer.length / 1024).toFixed(1)} KB`)
  console.log(`🎯  Kunci   : ${ANSWER_KEY}`)
  console.log(`📊  Threshold: ${THRESHOLD}`)
  console.log(`🔧  Tipe    : ${isVideo ? 'VIDEO' : 'FOTO'}`)
  console.log('\nMengirim ke Claude...')

  const start = Date.now()
  try {
    const result = isVideo
      ? await validateVideo(buffer, ANSWER_KEY, THRESHOLD)
      : await validateImage(buffer, mimeType, ANSWER_KEY, THRESHOLD)

    const ms = Date.now() - start
    console.log('\n── Hasil ──────────────────────────────────')
    console.log('Status     :', result.passed ? '✅ LOLOS' : '❌ TIDAK LOLOS')
    console.log('Confidence :', (result.confidence * 100).toFixed(1) + '%')
    console.log('Alasan     :', result.reason)
    console.log('Waktu      :', ms + 'ms')
    console.log('─'.repeat(45) + '\n')
  } catch (err) {
    const ms = Date.now() - start
    console.error('\n❌  Error setelah', ms + 'ms:', err.message)
  }
}

main()