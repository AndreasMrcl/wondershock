// test-ai.js — jalankan: node test-ai.js
// Test AI vision tanpa perlu frontend
'use strict'

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { validateImage } = require('./src/config/aiValidation')

// ── CONFIG ──────────────────────────────────────────────────────
// Ganti dengan path foto yang mau ditest dan kunci jawaban
const IMAGE_PATH  = process.argv[2] || null
const ANSWER_KEY  = process.argv[3] || 'Lawang Sewu Semarang'
const THRESHOLD   = parseFloat(process.argv[4] || '0.75')
// ────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎭  Wondershock AI Validation Test')
  console.log('─'.repeat(45))

  // Cek API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-xxx')) {
    console.error('❌  ANTHROPIC_API_KEY belum diset di backend/.env')
    process.exit(1)
  }
  console.log('✓  API Key:', process.env.ANTHROPIC_API_KEY.slice(0, 20) + '...')

  // Cek file
  if (!IMAGE_PATH || !fs.existsSync(IMAGE_PATH)) {
    console.log('\nUsage: node test-ai.js <path-ke-foto> "<kunci-jawaban>" [threshold]')
    console.log('Contoh: node test-ai.js foto.jpg "Lawang Sewu Semarang" 0.75')
    console.log('\nMenjalankan test dengan foto placeholder...\n')

    // Test tanpa foto — cek apakah API bisa dipanggil
    try {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const res = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        messages: [{ role: 'user', content: 'Balas dengan: {"status":"ok"}' }],
      })
      console.log('✓  Koneksi API berhasil:', res.content[0].text.trim())
      console.log('\n✅  API siap digunakan untuk validasi foto/video!\n')
    } catch (err) {
      console.error('❌  Gagal koneksi API:', err.message)
    }
    return
  }

  const ext      = path.extname(IMAGE_PATH).toLowerCase()
  const mimeMap  = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
  const mimeType = mimeMap[ext] || 'image/jpeg'
  const buffer   = fs.readFileSync(IMAGE_PATH)

  console.log('📷  File  :', IMAGE_PATH, `(${(buffer.length / 1024).toFixed(1)} KB)`)
  console.log('🔑  Kunci :', ANSWER_KEY)
  console.log('📊  Threshold:', THRESHOLD)
  console.log('\nMengirim ke Claude Vision...')

  try {
    const start  = Date.now()
    const result = await validateImage(buffer, mimeType, ANSWER_KEY, THRESHOLD)
    const ms     = Date.now() - start

    console.log('\n── Hasil ──────────────────────────────────')
    console.log('Status    :', result.passed ? '✅ LOLOS' : '❌ TIDAK LOLOS')
    console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%')
    console.log('Alasan    :', result.reason)
    console.log('Waktu     :', ms + 'ms')
    console.log('─'.repeat(45) + '\n')
  } catch (err) {
    console.error('\n❌  Error:', err.message)
    if (err.status === 401) console.error('   → API Key tidak valid')
    if (err.status === 400) console.error('   → Request format salah:', err.error?.error?.message)
  }
}

main()