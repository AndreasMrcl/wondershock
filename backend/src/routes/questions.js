// src/routes/questions.js
'use strict'

const express = require('express')
const db      = require('../config/db')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/questions ── Soal aktif untuk peserta (tanpa answer_key)
router.get('/', auth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, question_text, location_name, answer_type,
              timer_seconds, penalty_seconds, hint, order_num
       FROM   questions
       WHERE  is_active = TRUE
       ORDER  BY order_num ASC, created_at ASC`
    )
    res.json({ questions: rows })
  } catch (err) {
    console.error('[questions] list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data soal' })
  }
})

// ── GET /api/questions/admin ── Semua soal termasuk answer_key (admin)
router.get('/admin', adminAuth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT q.*, u.name AS created_by_name
       FROM   questions q
       LEFT JOIN users u ON q.created_by = u.id
       ORDER  BY q.order_num ASC, q.created_at ASC`
    )
    res.json({ questions: rows })
  } catch (err) {
    console.error('[questions] admin list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data soal' })
  }
})

// ── GET /api/questions/:id ── Satu soal (peserta — tanpa answer_key)
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, question_text, location_name, answer_type,
              timer_seconds, penalty_seconds, hint, order_num
       FROM   questions WHERE id = $1 AND is_active = TRUE`,
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Soal tidak ditemukan' })
    res.json({ question: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil soal' })
  }
})

// ── POST /api/questions ── Buat soal (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      question_text, location_name, answer_type = 'any',
      answer_key, similarity_threshold = 0.7,
      ai_confidence_threshold = 0.75, timer_seconds = 120,
      penalty_seconds = 30, hint, order_num = 0,
    } = req.body

    if (!question_text || !location_name || !answer_key)
      return res.status(400).json({ error: 'question_text, location_name, dan answer_key wajib diisi' })

    const { rows } = await db.query(
      `INSERT INTO questions
         (question_text, location_name, answer_type, answer_key,
          similarity_threshold, ai_confidence_threshold, timer_seconds,
          penalty_seconds, hint, order_num, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        question_text.trim(), location_name.trim(), answer_type,
        answer_key.trim(), similarity_threshold, ai_confidence_threshold,
        timer_seconds, penalty_seconds, hint || null, order_num, req.user.id,
      ]
    )
    res.status(201).json({ question: rows[0] })
  } catch (err) {
    console.error('[questions] create:', err.message)
    res.status(500).json({ error: 'Gagal membuat soal' })
  }
})

// ── PUT /api/questions/reorder ── Ubah urutan (harus SEBELUM /:id)
router.put('/reorder', adminAuth, async (req, res) => {
  const { order } = req.body
  if (!Array.isArray(order))
    return res.status(400).json({ error: 'order harus berupa array [{id, order_num}]' })

  const client = await db.getClient()
  try {
    await client.query('BEGIN')
    for (const item of order)
      await client.query('UPDATE questions SET order_num=$1 WHERE id=$2', [item.order_num, item.id])
    await client.query('COMMIT')
    res.json({ message: 'Urutan soal diperbarui' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: 'Gagal mengubah urutan soal' })
  } finally { client.release() }
})

// ── PUT /api/questions/:id ── Update soal (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      question_text, location_name, answer_type, answer_key,
      similarity_threshold, ai_confidence_threshold, timer_seconds,
      penalty_seconds, hint, order_num, is_active,
    } = req.body

    const { rows } = await db.query(
      `UPDATE questions SET
         question_text           = COALESCE($1,  question_text),
         location_name           = COALESCE($2,  location_name),
         answer_type             = COALESCE($3,  answer_type),
         answer_key              = COALESCE($4,  answer_key),
         similarity_threshold    = COALESCE($5,  similarity_threshold),
         ai_confidence_threshold = COALESCE($6,  ai_confidence_threshold),
         timer_seconds           = COALESCE($7,  timer_seconds),
         penalty_seconds         = COALESCE($8,  penalty_seconds),
         hint                    = COALESCE($9,  hint),
         order_num               = COALESCE($10, order_num),
         is_active               = COALESCE($11, is_active),
         updated_at              = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        question_text, location_name, answer_type, answer_key,
        similarity_threshold, ai_confidence_threshold, timer_seconds,
        penalty_seconds, hint, order_num, is_active, req.params.id,
      ]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Soal tidak ditemukan' })
    res.json({ question: rows[0] })
  } catch (err) {
    console.error('[questions] update:', err.message)
    res.status(500).json({ error: 'Gagal update soal' })
  }
})

// ── DELETE /api/questions/:id ── Soft-delete (arsipkan)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE questions SET is_active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Soal tidak ditemukan' })
    res.json({ message: 'Soal berhasil diarsipkan' })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus soal' })
  }
})

module.exports = router
