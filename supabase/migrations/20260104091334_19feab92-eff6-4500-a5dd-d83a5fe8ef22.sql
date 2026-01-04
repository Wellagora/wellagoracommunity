-- Add new values to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'expert';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sponsor';

-- Add is_super_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;