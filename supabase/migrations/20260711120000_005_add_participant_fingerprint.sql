-- Add participant fingerprint columns to leaderboard table
-- Stores device/connection info to identify participants

ALTER TABLE leaderboard
  ADD COLUMN IF NOT EXISTS ip_address text,
  ADD COLUMN IF NOT EXISTS browser_info jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS location jsonb DEFAULT NULL;
