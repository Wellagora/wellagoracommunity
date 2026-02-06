-- Add streak tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Create index for efficient streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_date);

-- Comment for documentation
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days of platform activity';
COMMENT ON COLUMN profiles.longest_streak IS 'Longest streak ever achieved by the user';
COMMENT ON COLUMN profiles.last_activity_date IS 'Last date user had any platform activity';
