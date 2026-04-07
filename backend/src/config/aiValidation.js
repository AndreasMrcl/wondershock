// src/config/aiValidation.js
'use strict'

const Anthropic = require('@anthropic-ai/sdk')
const os        = require('os')
const path      = require('path')
const fs        = require('fs')

const client = new Anthropic({
  apiKey:  process.env.ANTHROPIC_API_KEY,
  timeout: 30_000, // ✅ FIX: timeout 30 detik — sebelumnya tidak ada
})

// ── MOCK MODE ──────────────────────────────────────────────────
const MOCK_MODE = process.env.AI_MOCK === 'true'

// ✅ FIX: nama model terbaru
const MODEL = 'claude-sonnet-4-5'

/**
 * Validate an image buffer against an answer key using Claude Vision.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} answerKey   - deskripsi apa yang harus terlihat di foto
 * @param {number} threshold   - 0–1, minimum confidence untuk dianggap lolos
 * @returns {Promise<{passed: boolean, reason: string, confidence: number}>}
 */
async function validateImage(imageBuffer, mimeType, answerKey, threshold = 0.75) {
  const SUPPORTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const safeMime  = SUPPORTED.includes(mimeType) ? mimeType : 'image/jpeg'

  if (MOCK_MODE) {
    console.log(`[AI MOCK] validateImage — answerKey: "${answerKey}"`)
    return { passed: true, reason: '[MOCK] Foto sesuai', confidence: 0.9 }
  }

  // ✅ FIX: validasi ukuran buffer (Claude max ~5MB base64 per image)
  const maxBytes = 4 * 1024 * 1024 // 4MB raw = ~5.3MB base64 ≈ aman
  if (imageBuffer.length > maxBytes) {
    return {
      passed:     false,
      reason:     'Foto terlalu besar untuk divalidasi. Kompres foto di bawah 4MB.',
      confidence: 0,
    }
  }

  const base64 = imageBuffer.toString('base64')

  try {
    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: safeMime, data: base64 },
          },
          {
            type: 'text',
            text: `Kamu adalah validator foto untuk kuis city hunt.

Kunci jawaban yang harus terlihat di foto: "${answerKey}"

Periksa apakah foto ini menunjukkan hal tersebut. Perhatikan: nama tempat, bentuk bangunan, tulisan, landmark, atau objek spesifik yang relevan.

Jawab HANYA dengan JSON berikut (tanpa teks lain, tanpa markdown, tanpa backtick):
{"passed": true atau false, "reason": "penjelasan singkat dalam Bahasa Indonesia max 1 kalimat", "confidence": angka 0.0 sampai 1.0}`,
          },
        ],
      }],
    })

    // ✅ FIX: handle jika response kosong atau format tidak terduga
    const raw = response.content?.[0]?.text?.trim()
    if (!raw) {
      return { passed: false, reason: 'Respons AI kosong', confidence: 0 }
    }

    // Bersihkan jika Claude masih membungkus dengan backtick
    const clean = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/,'').trim()

    const result = JSON.parse(clean)

    // ✅ FIX: validasi shape result sebelum dipakai
    if (typeof result.passed !== 'boolean' || typeof result.confidence !== 'number') {
      throw new Error('Format respons AI tidak valid')
    }

    return {
      passed:     result.passed === true && Number(result.confidence) >= threshold,
      reason:     String(result.reason || ''),
      confidence: Number(result.confidence) || 0,
    }
  } catch (err) {
    // ✅ FIX: bedakan error jaringan vs error parsing
    if (err instanceof SyntaxError) {
      console.error('[AI] Gagal parse JSON dari Claude:', err.message)
      return { passed: false, reason: 'Gagal membaca respons AI. Coba lagi.', confidence: 0 }
    }
    if (err.status === 401) {
      console.error('[AI] API key tidak valid')
      return { passed: false, reason: 'Konfigurasi server bermasalah.', confidence: 0 }
    }
    if (err.status === 529 || err.status === 529) {
      return { passed: false, reason: 'Server AI sedang sibuk. Coba beberapa saat lagi.', confidence: 0 }
    }
    console.error('[AI] validateImage error:', err.message)
    return { passed: false, reason: 'Gagal memproses foto. Coba lagi.', confidence: 0 }
  }
}

/**
 * Ekstrak frame dari video menggunakan ffmpeg.
 * Mengambil frame di awal, tengah, dan akhir video (bukan hanya 3 detik pertama).
 * @param {Buffer} videoBuffer
 * @returns {Promise<Buffer[]|null>}
 */
async function extractFrames(videoBuffer) {
  let ffmpeg
  try {
    ffmpeg = require('fluent-ffmpeg')
  } catch {
    console.warn('[AI] fluent-ffmpeg tidak tersedia')
    return null
  }

  const tmpIn  = path.join(os.tmpdir(), `ws_in_${Date.now()}.mp4`)
  const tmpDir = path.join(os.tmpdir(), `ws_frames_${Date.now()}`)

  fs.writeFileSync(tmpIn, videoBuffer)
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    // ✅ FIX: dapatkan durasi video dulu, lalu ambil frame di 25%, 50%, 75%
    // sehingga tidak hanya 3 detik pertama
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tmpIn, (err, meta) => {
        if (err) return reject(err)
        resolve(meta?.format?.duration || 10)
      })
    })

    // Pilih 3 titik waktu yang menyebar
    const timestamps = [
      Math.max(0.5, duration * 0.25),
      duration * 0.5,
      Math.min(duration - 0.5, duration * 0.75),
    ]

    const frames = []
    for (let i = 0; i < timestamps.length; i++) {
      const outPath = path.join(tmpDir, `frame${i + 1}.jpg`)
      await new Promise((resolve, reject) => {
        ffmpeg(tmpIn)
          .seekInput(timestamps[i])
          .frames(1)
          .output(outPath)
          .on('end', resolve)
          .on('error', reject)
          .run()
      })
      if (fs.existsSync(outPath)) {
        frames.push(fs.readFileSync(outPath))
      }
    }

    return frames.length > 0 ? frames : null
  } finally {
    try { fs.unlinkSync(tmpIn) } catch { /* ignore */ }
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ignore */ }
  }
}

/**
 * Validate a video buffer using Claude Vision on extracted frames.
 * @param {Buffer} videoBuffer
 * @param {string} answerKey
 * @param {number} threshold
 * @returns {Promise<{passed: boolean, reason: string, confidence: number}>}
 */
async function validateVideo(videoBuffer, answerKey, threshold = 0.75) {
  if (MOCK_MODE) {
    console.log(`[AI MOCK] validateVideo — answerKey: "${answerKey}"`)
    return { passed: true, reason: '[MOCK] Video sesuai', confidence: 0.9 }
  }

  let frames
  try {
    frames = await extractFrames(videoBuffer)
  } catch (err) {
    console.error('[AI] Frame extraction error:', err.message)
    return {
      passed:     false,
      reason:     'Gagal memproses video. Pastikan format MP4 atau MOV dan coba lagi.',
      confidence: 0,
    }
  }

  if (!frames) {
    return {
      passed:     false,
      reason:     'Server belum mendukung validasi video (ffmpeg tidak tersedia).',
      confidence: 0,
    }
  }

  if (frames.length === 0) {
    return {
      passed:     false,
      reason:     'Tidak ada frame yang bisa diambil dari video.',
      confidence: 0,
    }
  }

  // ✅ FIX: kumpulkan semua hasil, ambil yang confidence-nya tertinggi
  const results = []
  for (const frame of frames) {
    const result = await validateImage(frame, 'image/jpeg', answerKey, threshold)
    results.push(result)
    if (result.passed) {
      // Sudah ketemu — tidak perlu cek frame lain
      return {
        ...result,
        reason: `(dari video, frame ke-${results.length}) ${result.reason}`,
      }
    }
  }

  // Semua frame gagal — kembalikan yang confidence-nya paling tinggi sebagai feedback
  const best = results.reduce((a, b) => a.confidence > b.confidence ? a : b)
  return {
    passed:     false,
    reason:     `Video tidak menunjukkan "${answerKey}". ${best.reason}`,
    confidence: best.confidence,
  }
}

module.exports = { validateImage, validateVideo }