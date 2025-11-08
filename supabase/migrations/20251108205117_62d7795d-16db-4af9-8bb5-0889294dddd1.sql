-- Add RLS policy to allow anyone to view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (is_public_profile = true);

-- Add index for better performance on public profile queries
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_public_profile) WHERE is_public_profile = true;