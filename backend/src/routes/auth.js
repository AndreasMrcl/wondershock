// src/routes/auth.js
'use strict'

const express = require('express')
const bcrypt  = require('bcrypt')
const jwt     = require('jsonwebtoken')
const db      = require('../config/db')
const { auth } = require('../middleware/auth')

const router = express.Router()

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// ── POST /api/auth/register ── Daftar peserta baru
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email, dan password wajib diisi' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password minimal 6 karakter' })

    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()])
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'Email sudah terdaftar' })

    const hash   = await bcrypt.hash(password, 12)
    const { rows } = await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name.trim(), email.toLowerCase().trim(), hash, 'peserta']
    )

    res.status(201).json({ token: signToken(rows[0].id), user: rows[0] })
  } catch (err) {
    console.error('[auth] register:', err.message)
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

// ── POST /api/auth/login ── Login peserta
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email dan password wajib diisi' })

    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    if (rows.length === 0)
      return res.status(401).json({ error: 'Email atau password salah' })

    const valid = await bcrypt.compare(password, rows[0].password_hash)
    if (!valid)
      return res.status(401).json({ error: 'Email atau password salah' })

    const { id, name, email: em, role } = rows[0]
    res.json({ token: signToken(id), user: { id, name, email: em, role } })
  } catch (err) {
    console.error('[auth] login:', err.message)
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

// ── POST /api/auth/admin/login ── Login admin
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email dan password wajib diisi' })

    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'admin'",
      [email.toLowerCase().trim()]
    )
    if (rows.length === 0)
      return res.status(401).json({ error: 'Email atau password admin salah' })

    const valid = await bcrypt.compare(password, rows[0].password_hash)
    if (!valid)
      return res.status(401).json({ error: 'Email atau password admin salah' })

    const { id, name, email: em, role } = rows[0]
    res.json({ token: signToken(id), user: { id, name, email: em, role } })
  } catch (err) {
    console.error('[auth] admin login:', err.message)
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

// ── GET /api/auth/me ── Profil user aktif
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user })
})

module.exports = router