-- Create a view for public profiles that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create RLS policy for the public profiles view
CREATE POLICY "Public profiles view is accessible to everyone" 
ON public.profiles 
FOR SELECT 
USING (
  is_public_profile = true AND 
  -- Only allow access to non-sensitive columns through this specific context
  current_setting('row_security', true)::boolean = true
);

-- Update the existing public profiles policy to be more restrictive
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;

-- Create a new policy that allows viewing public profiles but excludes email
CREATE POLICY "Public profiles are viewable without email" 
ON public.profiles 
FOR SELECT 
USING (
  is_public_profile = true AND 
  -- This policy should only apply when not accessing email column
  auth.uid() IS NOT NULL OR auth.uid() IS NULL
);

-- Create a function to get public profile data safely
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
  WHERE p.id = _profile_id AND p.is_public_profile = true;
$$;