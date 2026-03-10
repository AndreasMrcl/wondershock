// src/config/storage.js
'use strict'
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET     = process.env.R2_BUCKET_NAME
const PUBLIC_URL = process.env.R2_PUBLIC_URL

/**
 * Upload buffer → R2, return public URL
 * @param {Buffer} buffer
 * @param {string} key        e.g. "answers/session-id/question-id/uuid.jpg"
 * @param {string} contentType
 * @returns {Promise<string>} public URL
 */
async function uploadToR2(buffer, key, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }))
  return `${PUBLIC_URL}/${key}`
}

/**
 * Delete file from R2 by key (silently ignores if key is falsy)
 * @param {string|null} key
 */
async function deleteFromR2(key) {
  if (!key) return
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch (err) {
    console.warn('[R2] Delete warning:', err.message)
  }
}

module.exports = { uploadToR2, deleteFromR2 }
