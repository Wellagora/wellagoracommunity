-- Fix email harvesting vulnerability by restricting email access in organization member policies
-- Create a security definer function to get organization member profiles without sensitive data

CREATE OR REPLACE FUNCTION public.get_organization_member_profiles(_organization_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  public_display_name text,
  user_role user_role,
  organization text,
  organization_id uuid,
  bio text,
  avatar_url text,
  location text,
  industry text,
  website_url text,
  sustainability_goals text[],
  created_at timestamp with time zone,
  is_public_profile boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- This function excludes sensitive fields like email from organization member access
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.public_display_name,
    p.user_role,
    p.organization,
    p.organization_id,
    p.bio,
    p.avatar_url,
    p.location,
    p.industry,
    p.website_url,
    p.sustainability_goals,
    p.created_at,
    p.is_public_profile
  FROM public.profiles p
  WHERE p.organization_id = _organization_id
    AND p.organization_id IS NOT NULL;
$$;

-- Drop the problematic organization member policy that exposed emails
DROP POLICY IF EXISTS "Organization members can view limited profile data" ON public.profiles;

-- Create a more restrictive policy that only allows own profile access and secure function access
CREATE POLICY "Organization members secure access only"
ON public.profiles
FOR SELECT
USING (
  -- Users can view their own complete profile
  auth.uid() = id 
  OR 
  -- Service role access for secure functions only
  (current_setting('request.jwt.claims', true)::json ->> 'role') = 'service_role'
);

-- Grant execute permission on the secure function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_organization_member_profiles TO authenticated;