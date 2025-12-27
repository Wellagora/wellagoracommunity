-- MIGRATION 1 - Profiles table (Creator verification & Audit)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES profiles(id);

-- General index for role-based searches
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- Specialized partial index for Creator Management (High Performance)
CREATE INDEX IF NOT EXISTS idx_profiles_creator_verified 
ON profiles(user_role, is_verified_expert) 
WHERE user_role = 'creator';

-- MIGRATION 2 - Expert contents table Performance index for moderation queue
CREATE INDEX IF NOT EXISTS idx_expert_contents_moderation 
ON expert_contents(is_published, rejected_at);

-- MIGRATION 3 - Enhanced Admin Stats RPC
CREATE OR REPLACE FUNCTION public.get_admin_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', COALESCE((SELECT COUNT(*) FROM profiles), 0),
    'total_creators', COALESCE((SELECT COUNT(*) FROM profiles WHERE user_role = 'creator'), 0),
    'verified_creators', COALESCE((SELECT COUNT(*) FROM profiles WHERE user_role = 'creator' AND is_verified_expert = true), 0),
    'active_creators', COALESCE((SELECT COUNT(DISTINCT creator_id) FROM expert_contents WHERE is_published = true), 0),
    'pending_content', COALESCE((SELECT COUNT(*) FROM expert_contents WHERE is_published = false AND rejected_at IS NULL), 0),
    'published_content', COALESCE((SELECT COUNT(*) FROM expert_contents WHERE is_published = true), 0),
    'stripe_connected', COALESCE((SELECT COUNT(*) FROM profiles WHERE stripe_onboarding_complete = true), 0),
    'total_programs', COALESCE((SELECT COUNT(*) FROM challenge_definitions WHERE is_active = true), 0),
    'total_events', COALESCE((SELECT COUNT(*) FROM events WHERE status = 'published'), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;