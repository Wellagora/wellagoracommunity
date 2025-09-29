-- Fix email exposure in profiles table by restricting public access to specific columns only

-- First, drop all existing public access policies that might expose email
DROP POLICY IF EXISTS "Public profiles view is accessible to everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable without sensitive data" ON public.profiles;

-- Create a secure view that explicitly excludes sensitive data
CREATE OR REPLACE VIEW public.safe_public_profiles AS
SELECT 
  id,
  public_display_name,
  first_name,
  last_name,
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
  is_public_profile
FROM public.profiles
WHERE is_public_profile = true;

-- Enable RLS on the view with security barrier
ALTER VIEW public.safe_public_profiles SET (security_barrier = true);

-- Grant access to the safe view
GRANT SELECT ON public.safe_public_profiles TO authenticated, anon;

-- Create a restricted policy ONLY for the secure function access
CREATE POLICY "Secure function access only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow access through the secure get_public_profile function
  -- This prevents direct table access while allowing the function to work
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR 
  -- Allow users to see their own profile (all columns including email)
  auth.uid() = id
  OR
  -- Allow organization members to see each other (all columns including email) 
  (organization_id IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()))
);

-- Update the get_public_profile function to be more explicit about security
CREATE OR REPLACE FUNCTION public.get_public_profile(_profile_id uuid)
RETURNS TABLE (
  id uuid,
  public_display_name text,
  first_name text,
  last_name text,
  user_role public.user_role,
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
  -- This function explicitly excludes email and other sensitive fields
  -- and only returns data for public profiles
  SELECT 
    p.id,
    p.public_display_name,
    p.first_name,
    p.last_name,
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
  WHERE p.id = _profile_id 
    AND p.is_public_profile = true;
$$;

-- Ensure proper permissions on the function
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;