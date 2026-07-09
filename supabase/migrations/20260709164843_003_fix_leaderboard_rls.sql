/*
# Fix RLS Policy for Leaderboard INSERT

The previous policy `anon_insert_leaderboard` had WITH CHECK (true) which allowed
unrestricted INSERTs. This updates the policy to add validation while still allowing
anonymous submissions (students submit scores without authentication).

Validation added:
- student_name must not be null or empty
- score must be >= 0
- quiz_id must exist in quizzes table
*/

-- Drop the old unrestricted policy
DROP POLICY IF EXISTS "anon_insert_leaderboard" ON leaderboard;

-- Create new policy with validation
CREATE POLICY "anon_insert_leaderboard" ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    student_name IS NOT NULL
    AND student_name != ''
    AND score >= 0
    AND EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id)
  );