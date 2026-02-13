-- Phase 2: Engagement & Welcome System - Add engagement columns to profiles

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_seen_welcome'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_seen_welcome BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'streak_days'
  ) THEN
    ALTER TABLE profiles ADD COLUMN streak_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'streak_celebration_shown_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN streak_celebration_shown_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_founding_expert'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_founding_expert BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
