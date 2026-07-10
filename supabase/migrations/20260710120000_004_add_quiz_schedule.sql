-- Add schedule columns to quizzes table
-- Quiz will only be visible/active between starts_at and ends_at (if set)

ALTER TABLE quizzes
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz;
