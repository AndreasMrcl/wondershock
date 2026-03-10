-- migrations/001_init.sql
-- Wondershock Theatre — City Hunt Quiz
-- Jalankan: cd backend && npm run migrate

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'peserta'
                              CHECK (role IN ('peserta','admin')),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── QUESTIONS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text           TEXT         NOT NULL,
  location_name           VARCHAR(150) NOT NULL,
  answer_type             VARCHAR(10)  NOT NULL DEFAULT 'any'
                                       CHECK (answer_type IN ('text','photo','video','any')),
  answer_key              TEXT         NOT NULL,
  similarity_threshold    FLOAT        NOT NULL DEFAULT 0.7,
  ai_confidence_threshold FLOAT        NOT NULL DEFAULT 0.75,
  timer_seconds           INTEGER      NOT NULL DEFAULT 120,
  penalty_seconds         INTEGER      NOT NULL DEFAULT 30,
  hint                    TEXT,
  order_num               INTEGER      NOT NULL DEFAULT 0,
  is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_order
  ON questions(order_num) WHERE is_active = TRUE;

-- ── QUIZ SESSIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      VARCHAR(20) NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','finished')),
  started_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON quiz_sessions(user_id);

-- ── ANSWERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES questions(id)     ON DELETE CASCADE,
  attempt_number    INTEGER     NOT NULL DEFAULT 1,
  answer_type       VARCHAR(10) NOT NULL CHECK (answer_type IN ('text','photo','video')),
  text_content      TEXT,
  file_url          VARCHAR(500),
  file_key          VARCHAR(500),
  validation_method VARCHAR(20) CHECK (validation_method IN ('text_similarity','ai_vision')),
  similarity_score  FLOAT,
  ai_reason         TEXT,
  ai_confidence     FLOAT,
  passed            BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_session  ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_passed   ON answers(session_id, question_id, passed);
