/*
# Create Quiz Application Schema

1. New Tables
- `quizzes`: Stores quiz metadata (id, title, is_active flag, created_at)
- `questions`: Stores individual questions linked to quizzes via quiz_id (id, quiz_id, question_text, options as JSONB, correct_answer, created_at)
- `leaderboard`: Stores student scores linked to quizzes (id, student_name, score, quiz_id, created_at)

2. Relationships
- questions.quiz_id references quizzes.id with CASCADE delete
- leaderboard.quiz_id references quizzes.id with CASCADE delete

3. Security (Row Level Security)
- quizzes: anon/authenticated can SELECT; authenticated can INSERT/UPDATE/DELETE (admin only)
- questions: anon/authenticated can SELECT; authenticated can INSERT/UPDATE/DELETE (admin only)
- leaderboard: anon/authenticated can SELECT (public leaderboard) and INSERT (submit scores); no UPDATE/DELETE for anon
*/

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  score integer NOT NULL,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Quizzes policies
DROP POLICY IF EXISTS "anon_select_quizzes" ON quizzes;
CREATE POLICY "anon_select_quizzes" ON quizzes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_quizzes" ON quizzes;
CREATE POLICY "auth_insert_quizzes" ON quizzes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_quizzes" ON quizzes;
CREATE POLICY "auth_update_quizzes" ON quizzes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_quizzes" ON quizzes;
CREATE POLICY "auth_delete_quizzes" ON quizzes FOR DELETE
  TO authenticated USING (true);

-- Questions policies
DROP POLICY IF EXISTS "anon_select_questions" ON questions;
CREATE POLICY "anon_select_questions" ON questions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_questions" ON questions;
CREATE POLICY "auth_insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_questions" ON questions;
CREATE POLICY "auth_update_questions" ON questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_questions" ON questions;
CREATE POLICY "auth_delete_questions" ON questions FOR DELETE
  TO authenticated USING (true);

-- Leaderboard policies (public read, anyone can submit scores)
DROP POLICY IF EXISTS "anon_select_leaderboard" ON leaderboard;
CREATE POLICY "anon_select_leaderboard" ON leaderboard FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;
CREATE POLICY "anon_insert_leaderboard" ON leaderboard FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- No update or delete for leaderboard (historical records)