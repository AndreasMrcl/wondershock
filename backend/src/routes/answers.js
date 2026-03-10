// src/routes/answers.js
'use strict'

const express  = require('express')
const { v4: uuidv4 } = require('uuid')
const db       = require('../config/db')
const { uploadToR2 } = require('../config/storage')
const { validateImage, validateVideo } = require('../config/aiValidation')
const upload   = require('../middleware/upload')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ─────────────────────────────────────────────────────────────────
// POST /api/answers/submit
// Body: FormData atau JSON
//   session_id, question_id, answer_type ('text'|'photo'|'video')
//   text_content  — untuk answer_type='text'
//   file          — untuk answer_type='photo'|'video'
// ─────────────────────────────────────────────────────────────────
router.post('/submit', auth, upload.single('file'), async (req, res) => {
  const { session_id, question_id, answer_type, text_content } = req.body

  // ── Validasi input dasar ──
  if (!session_id || !question_id || !answer_type)
    return res.status(400).json({ error: 'session_id, question_id, dan answer_type wajib diisi' })
  if (!['text', 'photo', 'video'].includes(answer_type))
    return res.status(400).json({ error: 'answer_type harus text, photo, atau video' })
  if (answer_type === 'text' && !text_content?.trim())
    return res.status(400).json({ error: 'text_content wajib diisi untuk jawaban teks' })
  if ((answer_type === 'photo' || answer_type === 'video') && !req.file)
    return res.status(400).json({ error: 'File wajib diupload untuk jawaban foto/video' })

  try {
    // ── Verifikasi sesi ──
    const { rows: sessionRows } = await db.query(
      `SELECT * FROM quiz_sessions WHERE id=$1 AND user_id=$2 AND status='active'`,
      [session_id, req.user.id]
    )
    if (sessionRows.length === 0)
      return res.status(403).json({ error: 'Sesi tidak valid atau sudah selesai' })

    // ── Ambil soal + kunci ──
    const { rows: qRows } = await db.query(
      `SELECT * FROM questions WHERE id=$1 AND is_active=TRUE`,
      [question_id]
    )
    if (qRows.length === 0)
      return res.status(404).json({ error: 'Soal tidak ditemukan' })

    const question = qRows[0]

    // Cek tipe jawaban cocok dengan soal
    if (question.answer_type !== 'any' && question.answer_type !== answer_type)
      return res.status(400).json({ error: `Soal ini hanya menerima jawaban ${question.answer_type}` })

    // ── Hitung attempt number ──
    const { rows: attemptRows } = await db.query(
      `SELECT COUNT(*) AS cnt FROM answers
       WHERE session_id=$1 AND question_id=$2`,
      [session_id, question_id]
    )
    const attempt_number = parseInt(attemptRows[0].cnt, 10) + 1

    // ── VALIDASI ──────────────────────────────────────────────────
    let passed            = false
    let validationMethod  = null
    let similarityScore   = null
    let aiReason          = null
    let aiConfidence      = null
    let fileUrl           = null
    let fileKey           = null

    if (answer_type === 'text') {
      // Text similarity via pg_trgm
      validationMethod = 'text_similarity'
      const { rows: simRows } = await db.query(
        `SELECT similarity($1, $2) AS score`,
        [text_content.trim().toLowerCase(), question.answer_key.toLowerCase()]
      )
      similarityScore = parseFloat(simRows[0].score)
      passed = similarityScore >= (question.similarity_threshold || 0.7)

    } else {
      // AI Vision (photo or video)
      validationMethod = 'ai_vision'
      const fileBuffer  = req.file.buffer
      const mimeType    = req.file.mimetype
      const threshold   = question.ai_confidence_threshold || 0.75

      let aiResult
      if (answer_type === 'photo') {
        aiResult = await validateImage(fileBuffer, mimeType, question.answer_key, threshold)
      } else {
        aiResult = await validateVideo(fileBuffer, question.answer_key, threshold)
      }

      passed       = aiResult.passed
      aiReason     = aiResult.reason
      aiConfidence = aiResult.confidence

      // Upload file ke R2
      const ext  = mimeType.split('/')[1].replace('quicktime', 'mov')
      fileKey    = `answers/${session_id}/${question_id}/${uuidv4()}.${ext}`
      fileUrl    = await uploadToR2(fileBuffer, fileKey, mimeType)
    }

    // ── Simpan jawaban ──
    const { rows: savedRows } = await db.query(
      `INSERT INTO answers
         (session_id, question_id, attempt_number, answer_type,
          text_content, file_url, file_key,
          validation_method, similarity_score,
          ai_reason, ai_confidence, passed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        session_id, question_id, attempt_number, answer_type,
        text_content?.trim() || null, fileUrl, fileKey,
        validationMethod, similarityScore,
        aiReason, aiConfidence, passed,
      ]
    )

    // ── Response ──
    res.json({
      passed,
      attempt_number,
      answer_id: savedRows[0].id,
      // Hanya kirim penalty & hint jika salah
      ...(passed ? {} : {
        penalty_seconds: question.penalty_seconds,
        hint: question.hint || null,
      }),
    })
  } catch (err) {
    console.error('[answers] submit error:', err.message)
    res.status(500).json({ error: 'Gagal memproses jawaban: ' + err.message })
  }
})

// ── GET /api/answers/session/:sessionId ── Semua jawaban dalam satu sesi
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    // Pastikan sesi milik user ini
    const { rows: sRows } = await db.query(
      `SELECT id FROM quiz_sessions WHERE id=$1 AND user_id=$2`,
      [req.params.sessionId, req.user.id]
    )
    if (sRows.length === 0)
      return res.status(403).json({ error: 'Akses ditolak' })

    const { rows } = await db.query(
      `SELECT a.*, q.question_text, q.location_name
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.session_id = $1
       ORDER BY a.submitted_at ASC`,
      [req.params.sessionId]
    )
    res.json({ answers: rows })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil jawaban' })
  }
})

// ── GET /api/answers/admin ── Semua jawaban (admin), filter opsional
router.get('/admin', adminAuth, async (req, res) => {
  try {
    const conditions = []
    const params     = []

    if (req.query.question_id) {
      params.push(req.query.question_id)
      conditions.push(`a.question_id = $${params.length}`)
    }
    if (req.query.passed !== undefined) {
      params.push(req.query.passed === 'true')
      conditions.push(`a.passed = $${params.length}`)
    }
    if (req.query.session_id) {
      params.push(req.query.session_id)
      conditions.push(`a.session_id = $${params.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await db.query(
      `SELECT
         a.*,
         u.name  AS user_name,
         u.email AS user_email,
         q.question_text,
         q.location_name
       FROM answers a
       JOIN quiz_sessions qs ON a.session_id = qs.id
       JOIN users u          ON qs.user_id   = u.id
       JOIN questions q      ON a.question_id = q.id
       ${where}
       ORDER BY a.submitted_at DESC
       LIMIT 500`,
      params
    )
    res.json({ answers: rows })
  } catch (err) {
    console.error('[answers] admin list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data jawaban' })
  }
})

// ── GET /api/answers/:id/detail ── Detail satu jawaban (admin)
router.get('/:id/detail', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         a.*,
         u.name  AS user_name,
         u.email AS user_email,
         q.question_text,
         q.answer_key,
         q.location_name
       FROM answers a
       JOIN quiz_sessions qs ON a.session_id = qs.id
       JOIN users u          ON qs.user_id   = u.id
       JOIN questions q      ON a.question_id = q.id
       WHERE a.id = $1`,
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Jawaban tidak ditemukan' })
    res.json({ answer: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil detail jawaban' })
  }
})

module.exports = router
