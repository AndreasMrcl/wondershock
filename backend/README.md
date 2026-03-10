# Wondershock Quiz — Backend

Node.js + Express + PostgreSQL backend untuk City Hunt Quiz game.  
Subfolder `/backend` dalam monorepo Next.js Wondershock Theatre.

---

## Struktur

```
backend/
├── src/
│   ├── index.js              ← Entry point Express
│   ├── config/
│   │   ├── db.js             ← PostgreSQL pool
│   │   ├── storage.js        ← Cloudflare R2 upload/delete
│   │   └── aiValidation.js   ← Claude Vision + ffmpeg
│   ├── middleware/
│   │   ├── auth.js           ← JWT verify
│   │   └── upload.js         ← Multer file filter
│   └── routes/
│       ├── auth.js           ← Register, login, me
│       ├── questions.js      ← CRUD soal
│       ├── sessions.js       ← Mulai/selesai sesi
│       └── answers.js        ← Submit & validasi jawaban ← CORE
├── migrations/
│   ├── 001_init.sql          ← Schema PostgreSQL
│   └── run.js                ← Migration runner + seed admin
├── .env.example
├── nixpacks.toml             ← ffmpeg untuk Railway
└── package.json
```

---

## Setup Lokal

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Buat file `.env`

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi lokal
```

### 3. Siapkan PostgreSQL lokal

```bash
# Buat database
createdb wondershock_quiz

# Set DATABASE_URL di .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/wondershock_quiz
```

### 4. Jalankan migrasi

```bash
npm run migrate
# → Membuat semua tabel + index
# → Membuat akun admin dari ADMIN_EMAIL / ADMIN_PASSWORD di .env
```

### 5. Jalankan server

```bash
npm run dev     # development (nodemon, auto-restart)
npm start       # production
```

Server jalan di `http://localhost:3001`  
Health check: `http://localhost:3001/health`

---

## Deploy ke Railway (Monorepo)

Railway mendukung monorepo dengan root directory setting.

### 1. Push ke GitHub

Pastikan folder `/backend` sudah ada di repo.

### 2. Buat service baru di Railway

- New Project → Deploy from GitHub repo
- **Root Directory**: `backend`
- Railway akan otomatis detect Node.js dan baca `nixpacks.toml` untuk install ffmpeg

### 3. Tambah PostgreSQL

- New → Database → Add PostgreSQL
- Railway otomatis mengisi `DATABASE_URL` ke service backend

### 4. Set environment variables di Railway

```
NODE_ENV=production
FRONTEND_URL=https://your-nextjs-domain.vercel.app
JWT_SECRET=<random 64 karakter>
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=wondershock-answers
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_NAME=Admin Wondershock
ADMIN_EMAIL=admin@wondershock.id
ADMIN_PASSWORD=<password aman>
MAX_FILE_SIZE_MB=50
```

### 5. Jalankan migrasi di Railway

Di Railway dashboard → service backend → **Shell**:
```bash
npm run migrate
```

### 6. Update frontend `.env.local`

```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

---

## API Endpoints

### Auth
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/api/auth/register` | Daftar peserta |
| POST | `/api/auth/login` | Login peserta |
| POST | `/api/auth/admin/login` | Login admin |
| GET  | `/api/auth/me` | Profil user aktif |

### Questions
| Method | Path | Keterangan |
|--------|------|------------|
| GET  | `/api/questions` | Daftar soal aktif (peserta) |
| GET  | `/api/questions/admin` | Semua soal + answer_key (admin) |
| POST | `/api/questions` | Buat soal (admin) |
| PUT  | `/api/questions/reorder` | Ubah urutan (admin) |
| PUT  | `/api/questions/:id` | Edit soal (admin) |
| DELETE | `/api/questions/:id` | Arsipkan soal (admin) |

### Sessions
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/api/sessions/start` | Mulai sesi baru |
| POST | `/api/sessions/:id/finish` | Selesaikan sesi |
| GET  | `/api/sessions/:id/progress` | Progress sesi |
| GET  | `/api/sessions` | Semua sesi (admin) |

### Answers
| Method | Path | Keterangan |
|--------|------|------------|
| POST | `/api/answers/submit` | Submit jawaban (teks/foto/video) |
| GET  | `/api/answers/session/:sessionId` | Jawaban dalam sesi |
| GET  | `/api/answers/admin` | Semua jawaban (admin) |
| GET  | `/api/answers/:id/detail` | Detail jawaban (admin) |

---

## Alur Validasi

```
Submit Jawaban
│
├─ answer_type = 'text'
│   └─ pg_trgm similarity(input, answer_key) >= threshold → passed
│
├─ answer_type = 'photo'
│   ├─ Upload ke R2
│   └─ Claude Vision(image, answer_key) confidence >= threshold → passed
│
└─ answer_type = 'video'
    ├─ Upload ke R2
    ├─ ffmpeg extract 3 frames
    └─ Claude Vision tiap frame — passed jika ada 1 frame yang lolos
```

---

## Cloudflare R2 Setup

1. Buka Cloudflare dashboard → R2
2. Create bucket `wondershock-answers`
3. Settings → Public Access → Enable
4. Manage R2 API Tokens → Create token (beri akses Object Read & Write)
5. Catat Account ID, Access Key ID, Secret Access Key
6. R2_PUBLIC_URL = URL dari bagian "Public Bucket URL"
