-- migrations/004_chapters_rewards.sql
-- Chapters & Rewards tables

-- ── CHAPTERS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                 VARCHAR(100) NOT NULL UNIQUE,
  title                VARCHAR(150) NOT NULL,
  subtitle             VARCHAR(300),
  location             VARCHAR(200),
  city                 VARCHAR(100),
  status               VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                       CHECK (status IN ('ongoing','upcoming','expired')),
  bg_image             VARCHAR(500),
  color                VARCHAR(20) NOT NULL DEFAULT '#ec2b25',
  tags                 TEXT[] DEFAULT '{}',
  date_start           DATE,
  date_end             DATE,
  description          TEXT,
  timer_seconds        INTEGER NOT NULL DEFAULT 5280,
  hint_penalty_seconds INTEGER NOT NULL DEFAULT 600,
  order_num            INTEGER NOT NULL DEFAULT 0,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(status) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_chapters_slug   ON chapters(slug);

-- ── Link questions to chapters ────────────────────────────────────
ALTER TABLE questions ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);

-- ── REWARDS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rewards (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id  UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  type        VARCHAR(30) NOT NULL DEFAULT 'ticket'
              CHECK (type IN ('ticket','voucher','merchandise','experience')),
  icon        VARCHAR(10) DEFAULT '🎁',
  value       VARCHAR(100),
  requirement VARCHAR(300) DEFAULT 'Selesaikan semua soal dalam chapter',
  order_num   INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_chapter ON rewards(chapter_id);
