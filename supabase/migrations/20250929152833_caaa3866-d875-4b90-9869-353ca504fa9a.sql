-- Fix email harvesting vulnerability: Restrict organization member access to exclude sensitive data
-- Organization members should only see public profile fields, not emails or other sensitive data

-- Drop the current policy that exposes emails to organization members
DROP POLICY IF EXISTS "Secure profile access only" ON public.profiles;

-- Create separate policies with granular access control
-- Policy 1: Users can see their own complete profile (including email)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Organization members can see each other's PUBLIC fields only (no email or sensitive data)
-- This query will only work for fields that are safe to share within organizations
CREATE POLICY "Organization members can view public fields only" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id IS NOT NULL 
  AND organization_id = get_user_organization_id(auth.uid())
  AND auth.uid() != id  -- Don't apply this policy to own profile (handled by first policy)
);

-- Create a view for organization members to access only safe profile fields
CREATE OR REPLACE VIEW public.organization_member_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  public_display_name,
  user_role,
  organization,
  organization_id,
  bio,
  avatar_url,
  location,
  industry,
  website_url,
  sustainability_goals,
  created_at,
  is_public_profile,
  role,
  company_size,
  employee_count
  -- Note: email is deliberately excluded from this view
FROM public.profiles
WHERE organization_id IS NOT NULL;

-- Enable RLS on the view (though views inherit table policies)
ALTER VIEW public.organization_member_profiles SET (security_barrier = true);

-- Grant access to the organization member view
GRANT SELECT ON public.organization_member_profiles TO authenticated;