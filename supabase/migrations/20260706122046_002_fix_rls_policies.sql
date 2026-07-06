/*
# Fix RLS Policies for Admin-Only Operations

1. New Tables
- `admin_users`: Stores email addresses of users who can manage quizzes/questions
  - `id` (uuid, primary key)
  - `email` (text, unique, not null)
  - `created_at` (timestamptz)

2. Security Updates
- Add policies that check if authenticated user's email exists in admin_users table
- Replace unrestricted `USING (true)` and `WITH CHECK (true)` with proper admin checks
- Keep leaderboard INSERT as public (students submit scores without auth)
- Keep SELECT policies public (students can view quizzes/questions/leaderboard)

3. Important Notes
- After applying, insert the admin email into admin_users table
- Example: INSERT INTO admin_users (email) VALUES ('admin@quiz.app');
- The frontend checks VITE_ADMIN_EMAIL; this must match a row in admin_users
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users are readable by authenticated users (needed for policy checks)
DROP POLICY IF EXISTS "auth_select_admin_users" ON admin_users;
CREATE POLICY "auth_select_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (true);

-- Only admins can insert new admins
DROP POLICY IF EXISTS "admin_insert_admin_users" ON admin_users;
CREATE POLICY "admin_insert_admin_users" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- Only admins can update admin list
DROP POLICY IF EXISTS "admin_update_admin_users" ON admin_users;
CREATE POLICY "admin_update_admin_users" ON admin_users FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );

-- Only admins can delete admins (but not themselves)
DROP POLICY IF EXISTS "admin_delete_admin_users" ON admin_users;
CREATE POLICY "admin_delete_admin_users" ON admin_users FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
    AND email != auth.jwt() ->> 'email'
  );

-- Update quizzes policies - admin only for write operations
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

-- Update questions policies - admin only for write operations
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

-- Note: leaderboard INSERT remains public (WITH CHECK (true)) by design
-- Students submit scores without authentication