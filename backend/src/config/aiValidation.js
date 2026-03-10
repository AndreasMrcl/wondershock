// src/config/aiValidation.js
'use strict'

const Anthropic = require('@anthropic-ai/sdk')
const os        = require('os')
const path      = require('path')
const fs        = require('fs')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── MOCK MODE ──────────────────────────────────────────────────
// Set AI_MOCK=true di .env untuk test tanpa kredit Anthropic
const MOCK_MODE = process.env.AI_MOCK === 'true'

/**
 * Validate an image buffer against an answer key using Claude Vision.
 */
async function validateImage(imageBuffer, mimeType, answerKey, threshold = 0.75) {
  // Normalize mime type — Claude hanya terima jpeg/png/gif/webp
  const SUPPORTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const safeMime  = SUPPORTED.includes(mimeType) ? mimeType : 'image/jpeg'

  const base64 = imageBuffer.toString('base64')

  // Mock mode — simulasi response AI
  if (MOCK_MODE) {
    console.log(`[AI MOCK] validateImage — answerKey: "${answerKey}"`)
    // Simulasi: selalu lolos dengan confidence 0.9
    // Ganti passed: false untuk test skenario gagal
    return { passed: true, reason: '[MOCK] Foto terlihat sesuai dengan kunci jawaban', confidence: 0.9 }
  }

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
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
          text: `Kamu adalah validator kuis foto untuk acara city hunt.

Kunci jawaban yang diharapkan terlihat di foto: "${answerKey}"

Tugasmu: tentukan apakah foto ini menunjukkan hal tersebut.
Perhatikan detail seperti nama tempat, bentuk bangunan, tulisan, atau objek spesifik.

Jawab HANYA dalam format JSON berikut (tanpa teks lain, tanpa markdown):
{"passed": true/false, "reason": "penjelasan singkat dalam bahasa Indonesia", "confidence": 0.0-1.0}`,
        },
      ],
    }],
  })

  try {
    const text   = response.content[0].text.trim()
    const clean  = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    return {
      passed:     result.passed === true && Number(result.confidence || 0) >= threshold,
      reason:     result.reason     || '',
      confidence: Number(result.confidence || 0),
    }
  } catch {
    return { passed: false, reason: 'Gagal memproses respons AI', confidence: 0 }
  }
}

/**
 * Extract 3 JPEG frames from a video buffer using ffmpeg.
 * Returns null if ffmpeg is not available.
 */
async function extractFrames(videoBuffer) {
  let ffmpeg
  try {
    ffmpeg = require('fluent-ffmpeg')
  } catch {
    console.warn('[AI] fluent-ffmpeg tidak tersedia — skip frame extraction')
    return null
  }

  const tmpIn  = path.join(os.tmpdir(), `ws_in_${Date.now()}.mp4`)
  const tmpDir = path.join(os.tmpdir(), `ws_frames_${Date.now()}`)

  fs.writeFileSync(tmpIn, videoBuffer)
  fs.mkdirSync(tmpDir, { recursive: true })

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .outputOptions([
        '-vf', 'fps=1',
        '-frames:v', '3',
      ])
      .output(path.join(tmpDir, 'frame%d.jpg'))
      .on('end', resolve)
      .on('error', reject)
      .run()
  })

  const frames = []
  for (let i = 1; i <= 3; i++) {
    const p = path.join(tmpDir, `frame${i}.jpg`)
    if (fs.existsSync(p)) frames.push(fs.readFileSync(p))
  }

  try {
    fs.unlinkSync(tmpIn)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  } catch { /* ignore */ }

  return frames
}

/**
 * Validate a video buffer using Claude Vision on extracted frames.
 */
async function validateVideo(videoBuffer, answerKey, threshold = 0.75) {
  let frames
  try {
    frames = await extractFrames(videoBuffer)
  } catch (err) {
    console.error('[AI] Frame extraction error:', err.message)
    return {
      passed:     false,
      reason:     'Gagal memproses video — pastikan ffmpeg terinstall dan format MP4/MOV',
      confidence: 0,
    }
  }

  if (frames === null) {
    return {
      passed:     false,
      reason:     'Server belum mendukung validasi video (ffmpeg tidak terinstall)',
      confidence: 0,
    }
  }

  if (frames.length === 0) {
    return { passed: false, reason: 'Tidak ada frame yang bisa diambil dari video', confidence: 0 }
  }

  for (const frame of frames) {
    const result = await validateImage(frame, 'image/jpeg', answerKey, threshold)
    if (result.passed) return result
  }

  const last = await validateImage(frames[frames.length - 1], 'image/jpeg', answerKey, threshold)
  return { passed: false, reason: last.reason, confidence: last.confidence }
}

module.exports = { validateImage, validateVideo }