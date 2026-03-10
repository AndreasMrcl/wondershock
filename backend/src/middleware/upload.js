// src/middleware/upload.js
'use strict'

const multer = require('multer')

const MAX_MB   = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10)
const IMG_MIME = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/heic,image/webp').split(',')
const VID_MIME = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/quicktime,video/x-msvideo').split(',')
const ALLOWED  = [...IMG_MIME, ...VID_MIME]

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true)
    cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}`))
  },
})

module.exports = upload
