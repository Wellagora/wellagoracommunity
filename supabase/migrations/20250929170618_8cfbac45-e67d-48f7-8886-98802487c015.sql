-- Fix service role bypass vulnerability by restricting profiles access to own data only
-- Remove duplicate and insecure policies

-- Drop all existing problematic SELECT policies on profiles
DROP POLICY IF EXISTS "Organization members secure access only" ON public.profiles;
DROP POLICY IF EXISTS "Secure access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;

-- Create a single, secure policy that only allows users to view their own profiles
-- No service role bypass that could expose all user data
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Update the get_organization_member_profiles function to be more explicit about security
-- This function will work with SECURITY DEFINER to access the data securely
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
  -- This function explicitly excludes sensitive fields like email from organization member access
  -- SECURITY DEFINER allows it to bypass RLS while still limiting the data returned
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
    AND p.organization_id IS NOT NULL
    -- Additional security: verify the calling user is part of the same organization
    AND EXISTS (
      SELECT 1 FROM public.profiles caller 
      WHERE caller.id = auth.uid() 
      AND caller.organization_id = _organization_id
    );
$$;