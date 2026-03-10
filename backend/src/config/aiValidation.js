// src/config/aiValidation.js
'use strict'

const Anthropic = require('@anthropic-ai/sdk')
const ffmpeg    = require('fluent-ffmpeg')
const os        = require('os')
const path      = require('path')
const fs        = require('fs')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Validate an image buffer against an answer key using Claude Vision.
 *
 * @param {Buffer} imageBuffer
 * @param {string} mimeType          e.g. 'image/jpeg'
 * @param {string} answerKey         description of expected content
 * @param {number} threshold         confidence threshold (0–1), default 0.75
 * @returns {Promise<{passed:boolean, reason:string, confidence:number}>}
 */
async function validateImage(imageBuffer, mimeType, answerKey, threshold = 0.75) {
  const base64 = imageBuffer.toString('base64')

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: [
        {
          type:   'image',
          source: { type: 'base64', media_type: mimeType, data: base64 },
        },
        {
          type: 'text',
          text: `Kamu adalah validator kuis foto untuk acara city hunt.

Kunci jawaban yang diharapkan terlihat di foto: "${answerKey}"

Tugasmu: tentukan apakah foto ini menunjukkan hal tersebut.
Perhatikan detail seperti nama tempat, bentuk bangunan, tulisan, atau objek spesifik.

Jawab HANYA dalam format JSON berikut (tanpa teks lain, tanpa markdown backtick):
{"passed": true/false, "reason": "penjelasan singkat dalam bahasa Indonesia", "confidence": 0.0-1.0}`,
        },
      ],
    }],
  })

  try {
    const text  = response.content[0].text.trim()
    const clean = text.replace(/```json|```/g, '').trim()
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
 * Returns an array of Buffers (may be fewer than 3 if video is very short).
 *
 * @param {Buffer} videoBuffer
 * @returns {Promise<Buffer[]>}
 */
async function extractFrames(videoBuffer) {
  const tmpIn  = path.join(os.tmpdir(), `ws_in_${Date.now()}.mp4`)
  const tmpDir = path.join(os.tmpdir(), `ws_frames_${Date.now()}`)

  fs.writeFileSync(tmpIn, videoBuffer)
  fs.mkdirSync(tmpDir, { recursive: true })

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .outputOptions([
        '-vf', "select='eq(n\\,0)+eq(n\\,round(n/2))+gte(n\\,n-2)'",
        '-vsync', '0',
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

  // Cleanup temp files
  try {
    fs.unlinkSync(tmpIn)
    fs.rmSync(tmpDir, { recursive: true, force: true })
  } catch { /* ignore */ }

  return frames
}

/**
 * Validate a video buffer using Claude Vision on extracted frames.
 * Returns passed = true as soon as any frame passes.
 *
 * @param {Buffer} videoBuffer
 * @param {string} answerKey
 * @param {number} threshold
 * @returns {Promise<{passed:boolean, reason:string, confidence:number}>}
 */
async function validateVideo(videoBuffer, answerKey, threshold = 0.75) {
  let frames
  try {
    frames = await extractFrames(videoBuffer)
  } catch (err) {
    console.error('[AI] Frame extraction error:', err.message)
    return { passed: false, reason: 'Gagal memproses video — pastikan format MP4/MOV', confidence: 0 }
  }

  if (frames.length === 0) {
    return { passed: false, reason: 'Tidak ada frame yang bisa diambil dari video', confidence: 0 }
  }

  for (const frame of frames) {
    const result = await validateImage(frame, 'image/jpeg', answerKey, threshold)
    if (result.passed) return result
  }

  return { passed: false, reason: 'Tidak ada frame video yang cocok dengan kunci jawaban', confidence: 0 }
}

module.exports = { validateImage, validateVideo }
