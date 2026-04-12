-- =============================================
-- INSTA-AUTOGRAM DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Instagram Accounts ───────────────────────────────────
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id            SERIAL PRIMARY KEY,
  page_name     VARCHAR(255) NOT NULL,
  username      VARCHAR(255) NOT NULL UNIQUE,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  category      VARCHAR(100) NOT NULL,
  instagram_user_id VARCHAR(255),
  access_token  TEXT,
  app_id        VARCHAR(255),
  app_secret    VARCHAR(255),
  posting_mode  VARCHAR(20) DEFAULT 'manual' CHECK (posting_mode IN ('manual', 'auto')),
  auto_viral_threshold DECIMAL(5,4) DEFAULT 0.70,
  watermark_text VARCHAR(100),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Posts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  category      VARCHAR(100),
  media_url     TEXT,
  raw_media_url TEXT,
  thumbnail_url TEXT,
  caption       TEXT,
  hashtags      TEXT,
  resolution    VARCHAR(20),
  width         INTEGER,
  height        INTEGER,
  duration      DECIMAL(10,2),
  source        VARCHAR(100),
  source_url    TEXT,
  file_hash     VARCHAR(64) UNIQUE,
  viral_score   DECIMAL(5,4) DEFAULT 0,
  likes_count   BIGINT DEFAULT 0,
  comments_count BIGINT DEFAULT 0,
  views_count   BIGINT DEFAULT 0,
  shares_count  BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,4) DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'published', 'failed')),
  instagram_media_id VARCHAR(255),
  published_at  TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Analytics ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  post_id       INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  likes         BIGINT DEFAULT 0,
  comments      BIGINT DEFAULT 0,
  views         BIGINT DEFAULT 0,
  shares        BIGINT DEFAULT 0,
  saves         BIGINT DEFAULT 0,
  reach         BIGINT DEFAULT 0,
  impressions   BIGINT DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  recorded_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Job Logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_logs (
  id            SERIAL PRIMARY KEY,
  job_name      VARCHAR(100),
  account_id    INTEGER,
  status        VARCHAR(20) DEFAULT 'started',
  message       TEXT,
  metadata      JSONB,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_account_id    ON posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_status        ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_file_hash     ON posts(file_hash);
CREATE INDEX IF NOT EXISTS idx_posts_viral_score   ON posts(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_account   ON analytics(account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_post      ON analytics(post_id);

-- ─── Update Timestamp Trigger ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON instagram_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
