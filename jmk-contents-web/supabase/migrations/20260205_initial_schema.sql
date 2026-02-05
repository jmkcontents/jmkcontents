-- ==============================================================================
-- JMK Contents - Initial Database Schema
-- Created: 2026-02-05
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table: apps
-- 앱 메타데이터 및 정보
-- ==============================================================================
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id TEXT UNIQUE NOT NULL,           -- e.g., 'indsafety_prod'
  app_name TEXT NOT NULL,                   -- e.g., '산업안전산업기사'
  app_name_full TEXT,                       -- e.g., '산업안전산업기사-기출문제,음성듣기'
  description TEXT,
  keywords TEXT[],
  icon_url TEXT,                            -- App icon stored in Supabase Storage
  app_store_url TEXT,                       -- Apple App Store link
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  categories TEXT[],                        -- ['EDUCATION', 'REFERENCE']

  -- Metadata
  privacy_url TEXT DEFAULT '/privacy',      -- Can override if app-specific
  support_url TEXT DEFAULT '/support',
  marketing_url TEXT,                       -- Generated as /apps/{bundle_id}

  -- Stats
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for apps table
CREATE INDEX IF NOT EXISTS idx_apps_bundle_id ON apps(bundle_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at DESC);

-- ==============================================================================
-- Table: concepts
-- 학습 개념 정리
-- ==============================================================================
CREATE TABLE IF NOT EXISTS concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  category TEXT NOT NULL,                   -- e.g., '산업안전관리론'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  importance TEXT CHECK (importance IN ('high', 'medium', 'low')),
  related_questions INTEGER[],              -- Question IDs

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for concepts table
CREATE INDEX IF NOT EXISTS idx_concepts_app_id ON concepts(app_id);
CREATE INDEX IF NOT EXISTS idx_concepts_category ON concepts(category);
CREATE INDEX IF NOT EXISTS idx_concepts_importance ON concepts(importance);

-- ==============================================================================
-- Table: lectures
-- 음성 강의 자료
-- ==============================================================================
CREATE TABLE IF NOT EXISTS lectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT,                           -- Stored in Supabase Storage
  transcript TEXT,
  duration INTEGER,                         -- seconds

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lectures table
CREATE INDEX IF NOT EXISTS idx_lectures_app_id ON lectures(app_id);
CREATE INDEX IF NOT EXISTS idx_lectures_category ON lectures(category);

-- ==============================================================================
-- Table: contact_submissions
-- 문의 사항 제출 내역
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES apps(id),          -- Optional: which app
  name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contact_submissions table
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- ==============================================================================
-- Function: Update updated_at timestamp automatically
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concepts_updated_at
  BEFORE UPDATE ON concepts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Apps: 모든 사용자가 published 앱을 읽을 수 있음
CREATE POLICY "Apps are viewable by everyone when published"
  ON apps FOR SELECT
  USING (status = 'published');

-- Concepts: 모든 사용자가 읽을 수 있음 (published 앱에 속한 것만)
CREATE POLICY "Concepts are viewable by everyone"
  ON concepts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = concepts.app_id
      AND apps.status = 'published'
    )
  );

-- Lectures: 모든 사용자가 읽을 수 있음 (published 앱에 속한 것만)
CREATE POLICY "Lectures are viewable by everyone"
  ON lectures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM apps
      WHERE apps.id = lectures.app_id
      AND apps.status = 'published'
    )
  );

-- Contact Submissions: 누구나 생성 가능
CREATE POLICY "Anyone can create contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- Storage Buckets
-- ==============================================================================
-- Note: 스토리지 버킷은 Supabase Dashboard에서 수동으로 생성하거나
-- Supabase CLI를 사용하여 생성해야 합니다.
--
-- 필요한 버킷:
-- 1. app-icons: 앱 아이콘 저장
-- 2. lectures: 음성 강의 파일 저장
-- 3. screenshots: 앱 스크린샷 저장
--
-- 생성 후 Public Access 정책 설정:
-- - app-icons: public read
-- - lectures: public read
-- - screenshots: public read
-- ==============================================================================

-- ==============================================================================
-- Sample Data (Optional)
-- 개발 및 테스트용 샘플 데이터
-- ==============================================================================

-- 샘플 앱 데이터
INSERT INTO apps (bundle_id, app_name, app_name_full, description, categories, app_store_url, status, rating, review_count, download_count) VALUES
  ('indsafety_prod', '산업안전산업기사', '산업안전산업기사-기출문제,음성듣기', '산업안전산업기사 자격증 시험 준비를 위한 기출문제와 음성 듣기 기능을 제공합니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123456', 'published', 4.5, 120, 5000),
  ('electrician_prod', '전기기사', '전기기사-기출문제,음성듣기', '전기기사 자격증 시험 대비 기출문제 및 학습 자료를 제공합니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123457', 'published', 4.7, 250, 8000),
  ('fire_safety_prod', '소방설비기사', '소방설비기사-기출문제,음성듣기', '소방설비기사 자격증 시험을 위한 완벽한 학습 도구입니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123458', 'published', 4.6, 180, 6500),
  ('construction_prod', '건축기사', '건축기사-기출문제,음성듣기', '건축기사 자격증 시험 준비를 위한 종합 학습 앱입니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123459', 'published', 4.4, 95, 3200),
  ('mechanical_prod', '기계기사', '기계기사-기출문제,음성듣기', '기계기사 자격증 취득을 위한 필수 학습 자료를 제공합니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123460', 'published', 4.5, 140, 4800),
  ('environment_prod', '환경기사', '환경기사-기출문제,음성듣기', '환경기사 자격증 시험의 모든 과목을 체계적으로 학습할 수 있습니다.', ARRAY['교육', '시험'], 'https://apps.apple.com/app/id123461', 'published', 4.3, 75, 2100)
ON CONFLICT (bundle_id) DO NOTHING;

-- ==============================================================================
-- Verification
-- 생성된 테이블 확인
-- ==============================================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM apps;
