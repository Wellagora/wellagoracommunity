-- Drop the organization_member_profiles view
-- This view lacks proper RLS enforcement and should not be used
-- Instead, use the get_organization_member_profiles() function which properly validates access

DROP VIEW IF EXISTS public.organization_member_profiles;

-- The get_organization_member_profiles() function provides safe access with:
-- 1. Explicit caller validation (checks user is in same organization)
-- 2. Sensitive field exclusion (no email exposure)
-- 3. SECURITY DEFINER with proper validation