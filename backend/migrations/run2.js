// migrations/run2.js — jalankan: node migrations/run2.js
'use strict'
require('dotenv').config()

const fs   = require('fs')
const path = require('path')
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('\n▶  Running migration 002_events...')
    const sql = fs.readFileSync(path.join(__dirname, '002_events.sql'), 'utf8')
    await client.query(sql)
    console.log('   ✓ Events table created')
    console.log('\n✅  Migration complete!\n')
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()