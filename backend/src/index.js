// src/index.js
'use strict'

require('dotenv').config()

const express     = require('express')
const cors        = require('cors')
const rateLimit   = require('express-rate-limit')

const authRoutes      = require('./routes/auth')
const questionRoutes  = require('./routes/questions')
const sessionRoutes   = require('./routes/sessions')
const answerRoutes    = require('./routes/answers')
const eventsRouter    = require('./routes/events')
const chapterRoutes   = require('./routes/chapters')

const app  = express()
const PORT = process.env.PORT || 3001

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    // Izinkan semua subdomain Railway saat development
    /\.railway\.app$/,
  ],
  credentials: true,
}))

// ── Body parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Rate limiting ─────────────────────────────────────────────────
// Auth endpoints — lebih ketat
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 menit
  max: 20,
  message: { error: 'Terlalu banyak percobaan, coba lagi dalam 15 menit' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API — lebih longgar
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 menit
  max: 120,
  message: { error: 'Terlalu banyak request' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth', authLimiter)
app.use('/api',      apiLimiter)

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/sessions',  sessionRoutes)
app.use('/api/answers',   answerRoutes)
app.use('/api/events', eventsRouter)
app.use('/api/chapters', chapterRoutes)

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'wondershock-quiz-backend',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  })
})

app.get('/', (_req, res) => {
  res.json({ message: 'Wondershock Quiz API' })
})

// ── 404 ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' })
})

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(413).json({ error: `File terlalu besar. Maksimal ${process.env.MAX_FILE_SIZE_MB || 50}MB` })
  if (err.message?.includes('Tipe file tidak diizinkan'))
    return res.status(415).json({ error: err.message })

  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎭  Wondershock Quiz Backend`)
  console.log(`   Port  : ${PORT}`)
  console.log(`   Env   : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/health\n`)
})

module.exports = app
