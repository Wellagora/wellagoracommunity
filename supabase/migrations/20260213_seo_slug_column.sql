-- Phase 2: SEO & Discovery - Add slug column to profiles
-- This enables human-readable URLs for expert profiles (e.g., /expert/john-doe)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN slug TEXT;
  END IF;
END $$;

-- Add unique index for slug lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug) WHERE slug IS NOT NULL;
