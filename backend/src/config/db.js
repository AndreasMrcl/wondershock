// src/config/db.js
'use strict'
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

module.exports = {
  query:     (text, params) => pool.query(text, params),
  getClient: ()             => pool.connect(),
}
