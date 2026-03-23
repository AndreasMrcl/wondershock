-- Migration 003: tambah kolom detail untuk halaman event
-- Jalankan: node migrations/run3.js

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS venue          TEXT,
  ADD COLUMN IF NOT EXISTS venue_address  TEXT,
  ADD COLUMN IF NOT EXISTS venue_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS performers     JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS terms          TEXT,
  ADD COLUMN IF NOT EXISTS ticket_types   JSONB    DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS capacity       INTEGER,
  ADD COLUMN IF NOT EXISTS banner_url     TEXT,
  ADD COLUMN IF NOT EXISTS tags           TEXT[]   DEFAULT '{}';

-- performers format:
-- [{ "name": "John Doe", "role": "Director", "photo_url": "https://..." }]

-- ticket_types format (placeholder untuk future):
-- [{ "name": "Regular", "price": 150000, "quota": 100, "description": "..." }]

COMMENT ON COLUMN events.performers    IS 'JSON array of performer objects';
COMMENT ON COLUMN events.ticket_types  IS 'JSON array of ticket type objects (future ticketing)';