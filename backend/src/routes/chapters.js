// src/routes/chapters.js
'use strict'

const express = require('express')
const db      = require('../config/db')
const { auth, adminAuth } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/chapters ── Public: active chapters
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = c.id AND q.is_active = TRUE) AS question_count,
              (SELECT COUNT(DISTINCT qs.user_id) FROM quiz_sessions qs JOIN answers a ON a.session_id = qs.id JOIN questions q2 ON q2.id = a.question_id WHERE q2.chapter_id = c.id) AS participants
       FROM chapters c
       WHERE c.is_active = TRUE
       ORDER BY c.order_num ASC, c.created_at DESC`
    )
    res.json({ chapters: rows })
  } catch (err) {
    console.error('[chapters] list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data chapter' })
  }
})

// ── GET /api/chapters/admin ── All chapters (admin)
router.get('/admin', adminAuth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = c.id AND q.is_active = TRUE) AS question_count,
              (SELECT COUNT(DISTINCT qs.user_id) FROM quiz_sessions qs JOIN answers a ON a.session_id = qs.id JOIN questions q2 ON q2.id = a.question_id WHERE q2.chapter_id = c.id) AS participants
       FROM chapters c
       ORDER BY c.order_num ASC, c.created_at DESC`
    )
    res.json({ chapters: rows })
  } catch (err) {
    console.error('[chapters] admin list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data chapter' })
  }
})

// ── GET /api/chapters/:slug ── Single chapter by slug
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM questions q WHERE q.chapter_id = c.id AND q.is_active = TRUE) AS question_count,
              (SELECT COUNT(DISTINCT qs.user_id) FROM quiz_sessions qs JOIN answers a ON a.session_id = qs.id JOIN questions q2 ON q2.id = a.question_id WHERE q2.chapter_id = c.id) AS participants
       FROM chapters c
       WHERE c.slug = $1 AND c.is_active = TRUE`,
      [req.params.slug]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Chapter tidak ditemukan' })
    res.json({ chapter: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil chapter' })
  }
})

// ── POST /api/chapters ── Create chapter (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      title, subtitle, slug, location, city, status = 'upcoming',
      bg_image, color = '#ec2b25', tags = [], date_start, date_end,
      description, timer_seconds = 5280, hint_penalty_seconds = 600, order_num = 0,
    } = req.body

    if (!title || !slug)
      return res.status(400).json({ error: 'title dan slug wajib diisi' })

    const { rows } = await db.query(
      `INSERT INTO chapters
        (title, subtitle, slug, location, city, status,
         bg_image, color, tags, date_start, date_end,
         description, timer_seconds, hint_penalty_seconds, order_num, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [title, subtitle, slug, location, city, status,
       bg_image, color, tags, date_start || null, date_end || null,
       description, timer_seconds, hint_penalty_seconds, order_num, req.user.id]
    )
    res.status(201).json({ chapter: rows[0] })
  } catch (err) {
    if (err.code === '23505' && err.constraint?.includes('slug'))
      return res.status(400).json({ error: 'Slug sudah digunakan' })
    console.error('[chapters] create:', err.message)
    res.status(500).json({ error: 'Gagal membuat chapter' })
  }
})

// ── PUT /api/chapters/:id ── Update chapter (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      title, subtitle, slug, location, city, status,
      bg_image, color, tags, date_start, date_end,
      description, timer_seconds, hint_penalty_seconds, order_num, is_active,
    } = req.body

    const { rows } = await db.query(
      `UPDATE chapters SET
         title                = COALESCE($1,  title),
         subtitle             = COALESCE($2,  subtitle),
         slug                 = COALESCE($3,  slug),
         location             = COALESCE($4,  location),
         city                 = COALESCE($5,  city),
         status               = COALESCE($6,  status),
         bg_image             = COALESCE($7,  bg_image),
         color                = COALESCE($8,  color),
         tags                 = COALESCE($9,  tags),
         date_start           = COALESCE($10, date_start),
         date_end             = COALESCE($11, date_end),
         description          = COALESCE($12, description),
         timer_seconds        = COALESCE($13, timer_seconds),
         hint_penalty_seconds = COALESCE($14, hint_penalty_seconds),
         order_num            = COALESCE($15, order_num),
         is_active            = COALESCE($16, is_active),
         updated_at           = NOW()
       WHERE id = $17
       RETURNING *`,
      [title, subtitle, slug, location, city, status,
       bg_image, color, tags, date_start, date_end,
       description, timer_seconds, hint_penalty_seconds, order_num, is_active,
       req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Chapter tidak ditemukan' })
    res.json({ chapter: rows[0] })
  } catch (err) {
    console.error('[chapters] update:', err.message)
    res.status(500).json({ error: 'Gagal update chapter' })
  }
})

// ── DELETE /api/chapters/:id ── Soft-delete (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE chapters SET is_active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING id',
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Chapter tidak ditemukan' })
    res.json({ message: 'Chapter diarsipkan' })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus chapter' })
  }
})

// ── REWARDS sub-routes ────────────────────────────────────────────

// GET /api/chapters/:id/rewards — rewards for a chapter
router.get('/:id/rewards', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM rewards WHERE chapter_id = $1 AND is_active = TRUE ORDER BY order_num ASC`,
      [req.params.id]
    )
    res.json({ rewards: rows })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil rewards' })
  }
})

// POST /api/chapters/:id/rewards — add reward to chapter (admin)
router.post('/:id/rewards', adminAuth, async (req, res) => {
  try {
    const { title, description, type = 'ticket', icon = '🎁', value, requirement, order_num = 0 } = req.body
    if (!title)
      return res.status(400).json({ error: 'title wajib diisi' })

    const { rows } = await db.query(
      `INSERT INTO rewards (chapter_id, title, description, type, icon, value, requirement, order_num, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [req.params.id, title, description, type, icon, value,
       requirement || 'Selesaikan semua soal dalam chapter', order_num, req.user.id]
    )
    res.status(201).json({ reward: rows[0] })
  } catch (err) {
    console.error('[rewards] create:', err.message)
    res.status(500).json({ error: 'Gagal membuat reward' })
  }
})

// PUT /api/chapters/rewards/:rewardId — update reward (admin)
router.put('/rewards/:rewardId', adminAuth, async (req, res) => {
  try {
    const { title, description, type, icon, value, requirement, order_num, is_active } = req.body
    const { rows } = await db.query(
      `UPDATE rewards SET
         title       = COALESCE($1, title),
         description = COALESCE($2, description),
         type        = COALESCE($3, type),
         icon        = COALESCE($4, icon),
         value       = COALESCE($5, value),
         requirement = COALESCE($6, requirement),
         order_num   = COALESCE($7, order_num),
         is_active   = COALESCE($8, is_active),
         updated_at  = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, description, type, icon, value, requirement, order_num, is_active, req.params.rewardId]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Reward tidak ditemukan' })
    res.json({ reward: rows[0] })
  } catch (err) {
    console.error('[rewards] update:', err.message)
    res.status(500).json({ error: 'Gagal update reward' })
  }
})

// DELETE /api/chapters/rewards/:rewardId — soft-delete reward (admin)
router.delete('/rewards/:rewardId', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE rewards SET is_active=FALSE, updated_at=NOW() WHERE id=$1 RETURNING id',
      [req.params.rewardId]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Reward tidak ditemukan' })
    res.json({ message: 'Reward diarsipkan' })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus reward' })
  }
})

module.exports = router
