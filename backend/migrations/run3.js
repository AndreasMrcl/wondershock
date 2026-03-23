'use strict'
// backend/migrations/run3.js
// Jalankan: node migrations/run3.js

require('dotenv').config()
const { Pool } = require('pg')
const fs       = require('fs')
const path     = require('path')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '003_events_detail.sql'), 'utf8')
  try {
    await pool.query(sql)
    console.log('✓ Migration 003_events_detail berhasil')
  } catch (err) {
    console.error('✗ Migration gagal:', err.message)
  } finally {
    await pool.end()
  }
}

run()