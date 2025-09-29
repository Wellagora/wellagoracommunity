-- Remove the insecure organization_member_profiles view
-- This view bypassed RLS policies and created a security vulnerability
DROP VIEW IF EXISTS public.organization_member_profiles;

-- The functionality should be handled directly through the profiles table
-- where RLS policies are properly enforced. Applications should query
-- the profiles table directly with appropriate filters like:
-- SELECT * FROM profiles WHERE organization_id = user_org_id AND organization_id IS NOT NULL;

-- This ensures that:
-- 1. RLS policies are properly enforced
-- 2. Users can only access data they're authorized to see
-- 3. No privilege escalation occurs through SECURITY DEFINER views