-- Founding Expert fields on profiles table
-- is_founding_expert: marks the first 5 experts who founded the community
-- founding_expert_since: timestamp when they were granted founding status
-- expert_slug: URL-friendly slug for public expert profile pages

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_founding_expert BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS founding_expert_since TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expert_slug VARCHAR(100) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_expert_slug ON profiles(expert_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_founding_expert ON profiles(is_founding_expert) WHERE is_founding_expert = true;
