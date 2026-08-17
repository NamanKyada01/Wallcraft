-- ============================================================
-- Wallcraft Database Schema — Initial Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
  ('Nature',      'nature',      '🌿', '#22C55E', 1),
  ('Abstract',    'abstract',    '🎨', '#A855F7', 2),
  ('Minimal',     'minimal',     '⬜', '#6366F1', 3),
  ('Dark',        'dark',        '🌑', '#374151', 4),
  ('Space',       'space',       '🚀', '#1E40AF', 5),
  ('Anime',       'anime',       '🎌', '#EC4899', 6),
  ('City',        'city',        '🏙️', '#F97316', 7),
  ('Animals',     'animals',     '🐾', '#14B8A6', 8),
  ('Art',         'art',         '🎭', '#E11D48', 9),
  ('Technology',  'technology',  '💻', '#06B6D4', 10),
  ('Texture',     'texture',     '🧱', '#92400E', 11);

-- ============================================================
-- WALLPAPERS
-- ============================================================
CREATE TABLE wallpapers (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  cloudinary_id   TEXT NOT NULL,
  cloudinary_url  TEXT NOT NULL,
  category_id     INT REFERENCES categories(id) ON DELETE SET NULL,
  tags            TEXT[] DEFAULT '{}',
  width           INT,
  height          INT,
  aspect_ratio    FLOAT GENERATED ALWAYS AS (
    CASE WHEN width IS NOT NULL AND height IS NOT NULL AND height > 0
    THEN width::FLOAT / height::FLOAT ELSE NULL END
  ) STORED,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE,
  download_count  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallpapers_category ON wallpapers(category_id);
CREATE INDEX idx_wallpapers_featured ON wallpapers(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_wallpapers_downloads ON wallpapers(download_count DESC);
CREATE INDEX idx_wallpapers_tags ON wallpapers USING GIN(tags);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id  INT NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, wallpaper_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- ============================================================
-- TICKETS
-- ============================================================
CREATE TABLE tickets (
  id          SERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('bug', 'feature', 'billing', 'other')),
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================================
-- TICKET MESSAGES
-- ============================================================
CREATE TABLE ticket_messages (
  id          SERIAL PRIMARY KEY,
  ticket_id   INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE downloads (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallpaper_id  INT NOT NULL REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_user ON downloads(user_id);
CREATE INDEX idx_downloads_wallpaper ON downloads(wallpaper_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories (public read)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wallpapers (public read)
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view wallpapers" ON wallpapers FOR SELECT USING (true);
CREATE POLICY "Admins can manage wallpapers" ON wallpapers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Favorites (own only)
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all favorites" ON favorites FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tickets (own only)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all tickets" ON tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Ticket Messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ticket messages" ON ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own ticket messages" ON ticket_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND user_id = auth.uid())
  AND sender_type = 'user'
);
CREATE POLICY "Admins can manage ticket messages" ON ticket_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Downloads
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own downloads" ON downloads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own downloads" ON downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all downloads" ON downloads FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert downloads" ON downloads FOR INSERT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wallpapers SET download_count = download_count + 1
  WHERE id = NEW.wallpaper_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_download_created
  AFTER INSERT ON downloads
  FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Function to update ticket updated_at
CREATE TRIGGER on_ticket_updated
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
