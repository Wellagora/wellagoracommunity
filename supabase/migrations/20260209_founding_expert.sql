-- Founding Expert badge support
-- First experts who join during the pilot get permanent privileges

-- Add is_founding_expert flag to profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_founding_expert'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_founding_expert BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add founding_expert_since timestamp
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'founding_expert_since'
  ) THEN
    ALTER TABLE profiles ADD COLUMN founding_expert_since TIMESTAMPTZ DEFAULT NULL;
  END IF;
END $$;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_profiles_founding_expert
  ON profiles (is_founding_expert) WHERE is_founding_expert = TRUE;

-- Helper function: grant founding expert status
CREATE OR REPLACE FUNCTION grant_founding_expert(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET is_founding_expert = TRUE,
      founding_expert_since = NOW()
  WHERE id = p_user_id
    AND user_role IN ('expert', 'creator')
    AND is_founding_expert = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To grant founding expert status to a user:
-- SELECT grant_founding_expert('user-uuid-here');
