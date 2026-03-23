// src/routes/events.js
'use strict'

const express = require('express')
const db      = require('../config/db')
const { adminAuth } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/events — public, semua event aktif ──────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, subtitle, date, type, image_url, price, description, order_num
       FROM events
       WHERE is_active = TRUE
       ORDER BY order_num ASC, date ASC`
    )
    res.json({ events: rows })
  } catch (err) {
    console.error('[events] list:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data event' })
  }
})

// ── GET /api/events/all — admin, semua termasuk nonaktif ─────────
router.get('/all', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT e.*, u.name AS created_by_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.order_num ASC, e.date ASC`
    )
    res.json({ events: rows })
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data event' })
  }
})

// ── GET /api/events/:id — public, detail satu event ─────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, subtitle, date, type, image_url, banner_url, price,
              description, venue, venue_address, venue_maps_url,
              performers, terms, ticket_types, capacity, tags, order_num
       FROM events
       WHERE id = $1 AND is_active = TRUE`,
      [req.params.id]
    )
    if (rows.length === 0)
      return res.status(404).json({ error: 'Event tidak ditemukan' })
    res.json({ event: rows[0] })
  } catch (err) {
    console.error('[events] detail:', err.message)
    res.status(500).json({ error: 'Gagal mengambil data event' })
  }
})

// ── POST /api/events — admin, tambah event ───────────────────────
router.post('/', adminAuth, async (req, res) => {
  const {
    title, subtitle, date, type, image_url, banner_url, price,
    description, order_num, is_active,
    venue, venue_address, venue_maps_url,
    performers, terms, ticket_types, capacity, tags,
  } = req.body

  if (!title?.trim())  return res.status(400).json({ error: 'Judul wajib diisi' })
  if (!date)           return res.status(400).json({ error: 'Tanggal wajib diisi' })
  if (!['show','workshop','special'].includes(type))
    return res.status(400).json({ error: 'Tipe tidak valid' })

  try {
    const { rows } = await db.query(
      `INSERT INTO events (
         title, subtitle, date, type, image_url, banner_url, price,
         description, order_num, is_active, created_by,
         venue, venue_address, venue_maps_url,
         performers, terms, ticket_types, capacity, tags
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
       ) RETURNING *`,
      [
        title.trim(),
        subtitle?.trim() || null,
        date,
        type,
        image_url?.trim()    || null,
        banner_url?.trim()   || null,
        price?.trim()        || null,
        description?.trim()  || null,
        order_num || 0,
        is_active !== false,
        req.user.id,
        venue?.trim()         || null,
        venue_address?.trim() || null,
        venue_maps_url?.trim()|| null,
        JSON.stringify(performers   || []),
        terms?.trim()         || null,
        JSON.stringify(ticket_types || []),
        capacity              || null,
        tags                  || [],
      ]
    )
    res.status(201).json({ event: rows[0] })
  } catch (err) {
    console.error('[events] create:', err.message)
    res.status(500).json({ error: 'Gagal menambah event' })
  }
})

// ── PUT /api/events/:id — admin, edit event ──────────────────────
router.put('/:id', adminAuth, async (req, res) => {
  const {
    title, subtitle, date, type, image_url, banner_url, price,
    description, order_num, is_active,
    venue, venue_address, venue_maps_url,
    performers, terms, ticket_types, capacity, tags,
  } = req.body

  try {
    const { rows: existing } = await db.query('SELECT id FROM events WHERE id=$1', [req.params.id])
    if (existing.length === 0) return res.status(404).json({ error: 'Event tidak ditemukan' })

    const { rows } = await db.query(
      `UPDATE events SET
         title           = COALESCE($1, title),
         subtitle        = $2,
         date            = COALESCE($3, date),
         type            = COALESCE($4, type),
         image_url       = $5,
         banner_url      = $6,
         price           = $7,
         description     = $8,
         order_num       = COALESCE($9, order_num),
         is_active       = COALESCE($10, is_active),
         venue           = $11,
         venue_address   = $12,
         venue_maps_url  = $13,
         performers      = COALESCE($14, performers),
         terms           = $15,
         ticket_types    = COALESCE($16, ticket_types),
         capacity        = $17,
         tags            = COALESCE($18, tags),
         updated_at      = NOW()
       WHERE id = $19
       RETURNING *`,
      [
        title?.trim()         || null,
        subtitle?.trim()      || null,
        date                  || null,
        type                  || null,
        image_url?.trim()     || null,
        banner_url?.trim()    || null,
        price?.trim()         || null,
        description?.trim()   || null,
        order_num !== undefined ? order_num : null,
        is_active !== undefined ? is_active : null,
        venue?.trim()         || null,
        venue_address?.trim() || null,
        venue_maps_url?.trim()|| null,
        performers ? JSON.stringify(performers) : null,
        terms?.trim()         || null,
        ticket_types ? JSON.stringify(ticket_types) : null,
        capacity              || null,
        tags                  || null,
        req.params.id,
      ]
    )
    res.json({ event: rows[0] })
  } catch (err) {
    console.error('[events] update:', err.message)
    res.status(500).json({ error: 'Gagal mengupdate event' })
  }
})

// ── DELETE /api/events/:id — admin, hapus event ──────────────────
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM events WHERE id=$1 RETURNING id', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Event tidak ditemukan' })
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus event' })
  }
})

module.exports = router