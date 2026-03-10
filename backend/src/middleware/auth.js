// src/middleware/auth.js
'use strict'

const jwt = require('jsonwebtoken')
const db  = require('../config/db')

/**
 * Verifikasi JWT — attach req.user untuk semua role
 */
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' })
    }

    const token   = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const { rows } = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' })
    }

    req.user = rows[0]
    next()
  } catch {
    return res.status(401).json({ error: 'Token tidak valid atau sudah expired' })
  }
}

/**
 * Hanya admin yang boleh lewat
 */
function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses ditolak — hanya admin' })
    }
    next()
  })
}

module.exports = { auth, adminAuth }
