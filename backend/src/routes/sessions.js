// src/routes/sessions.js
'use strict'

const express = require('express')
const db      = require('../config/db')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ── POST /api/sessions/start ── Mulai sesi baru
router.post('/start', auth, async (req, res) => {
  try {
    // Tutup sesi aktif sebelumnya (kalau ada)
    await db.query(
      `UPDATE quiz_sessions
       SET status = 'finished', finished_at = NOW()
       WHERE user_id = $1 AND status = 'active'`,
      [req.user.id]
    )

    const { rows } = await db.query(
      `INSERT INTO quiz_sessions (user_id) VALUES ($1)
       RETURNING *`,
      [req.user.id]
    )
    res.status(201).json({ session: rows[0] })
  } catch (err) {
    console.error('[sessions] start:', err.message)
    res.status(500).json({ error: 'Gagal memulai sesi' })
  }
})

// ── POST /api/sessions/:id/finish ── Selesaikan sesi
router.post('/:id/finish', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `UPDATE quiz_sessions
       SET status = 'finished', finished_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Sesi tidak ditemukan' })
    res.json({ session: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menyelesaikan sesi' })
  }
})

// ── GET /api/sessions/:id/progress ── Progress sesi milik user
router.get('/:id/progress', auth, async (req, res) => {
  try {
    // Verifikasi kepemilikan
    const { rows: sessionRows } = await db.query(
      `SELECT * FROM quiz_sessions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    )
    if (sessionRows.length === 0)
      return res.status(404).json({ error: 'Sesi tidak ditemukan' })

    // Soal yang sudah dijawab benar
    const { rows: passedRows } = await db.query(
      `SELECT DISTINCT question_id FROM answers
       WHERE session_id = $1 AND passed = TRUE`,
      [req.params.id]
    )

    // Total soal aktif
    const { rows: totalRows } = await db.query(
      `SELECT COUNT(*) AS total FROM questions WHERE is_active = TRUE`
    )

    res.json({
      session:     sessionRows[0],
      passed_count: passedRows.length,
      total_count:  parseInt(totalRows[0].total, 10),
      passed_ids:   passedRows.map(r => r.question_id),
    })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil progress' })
  }
})

// ── GET /api/sessions ── Semua sesi (admin)
router.get('/', adminAuth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         qs.*,
         u.name  AS user_name,
         u.email AS user_email,
         COUNT(DISTINCT a.question_id) FILTER (WHERE a.passed = TRUE) AS passed_count
       FROM   quiz_sessions qs
       JOIN   users u ON qs.user_id = u.id
       LEFT JOIN answers a ON qs.id = a.session_id
       GROUP  BY qs.id, u.name, u.email
       ORDER  BY qs.started_at DESC`
    )
    res.json({ sessions: rows })
  } catch (err) {
    console.error('[sessions] admin list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data sesi' })
  }
})

module.exports = router
