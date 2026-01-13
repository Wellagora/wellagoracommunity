-- Add Terms of Service acceptance tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS accepted_terms_version VARCHAR(10);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_terms ON profiles(accepted_terms_at);

-- Add comment for documentation
COMMENT ON COLUMN profiles.accepted_terms_at IS 'Timestamp when user accepted the Terms of Service';
COMMENT ON COLUMN profiles.accepted_terms_version IS 'Version of Terms of Service the user accepted';