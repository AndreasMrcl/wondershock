// migrations/run.js
'use strict'
require('dotenv').config()

const fs     = require('fs')
const path   = require('path')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function run() {
  const client = await pool.connect()
  try {
    console.log('\n▶  Running migrations...')

    const sql = fs.readFileSync(path.join(__dirname, '001_init.sql'), 'utf8')
    await client.query(sql)
    console.log('   ✓ Schema applied')

    // Seed admin
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env
    if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      const { rows } = await client.query(
        'SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL]
      )
      if (rows.length === 0) {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)
        await client.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)',
          [ADMIN_NAME || 'Admin', ADMIN_EMAIL, hash, 'admin']
        )
        console.log(`   ✓ Admin created: ${ADMIN_EMAIL}`)
      } else {
        console.log('   ℹ  Admin already exists — skipped')
      }
    } else {
      console.log('   ⚠  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping seed')
    }

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
