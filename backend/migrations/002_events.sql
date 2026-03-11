-- migrations/002_events.sql
-- Wondershock Theatre — Events table
-- Jalankan: node migrations/run2.js

CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(200) NOT NULL,
  subtitle    VARCHAR(300),
  date        DATE         NOT NULL,
  type        VARCHAR(20)  NOT NULL DEFAULT 'show'
              CHECK (type IN ('show','workshop','special')),
  image_url   VARCHAR(500),
  price       VARCHAR(100),
  description TEXT,
  order_num   INTEGER      NOT NULL DEFAULT 0,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date
  ON events(date) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_events_order
  ON events(order_num) WHERE is_active = TRUE;