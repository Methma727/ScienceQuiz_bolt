-- ============================================================
-- QuizMaster Full Setup Script
-- Run this ONCE in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. QUizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  score integer NOT NULL,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 4. Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- QUIZZES policies
-- ============================================================
DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quizzes" ON quizzes;
CREATE POLICY "auth_insert_quizzes" ON quizzes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "auth_update_quizzes" ON quizzes;
CREATE POLICY "auth_update_quizzes" ON quizzes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "auth_delete_quizzes" ON quizzes;
CREATE POLICY "auth_delete_quizzes" ON quizzes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- ============================================================
-- QUESTIONS policies
-- ============================================================
DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_questions" ON questions;
CREATE POLICY "auth_insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "auth_update_questions" ON questions;
CREATE POLICY "auth_update_questions" ON questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "auth_delete_questions" ON questions;
CREATE POLICY "auth_delete_questions" ON questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- ============================================================
-- LEADERBOARD policies (public read + insert with validation)
-- ============================================================
DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard" ON leaderboard FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    student_name IS NOT NULL
    AND student_name != ''
    AND score >= 0
    AND EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id)
  );

-- ============================================================
-- ADMIN_USERS policies
-- ============================================================
DROP POLICY IF EXISTS "auth_select_admin_users" ON admin_users;
CREATE POLICY "auth_select_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_admin_users" ON admin_users;
CREATE POLICY "admin_insert_admin_users" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "admin_update_admin_users" ON admin_users;
CREATE POLICY "admin_update_admin_users" ON admin_users FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "admin_delete_admin_users" ON admin_users;
CREATE POLICY "admin_delete_admin_users" ON admin_users FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
    AND email != auth.jwt() ->> 'email'
  );

-- ============================================================
-- Seed your admin user (CHANGE THIS EMAIL to yours)
-- ============================================================
INSERT INTO admin_users (email) VALUES ('admin@quiz.app')
  ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Enable UUID extension (should already be enabled, just in case)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
