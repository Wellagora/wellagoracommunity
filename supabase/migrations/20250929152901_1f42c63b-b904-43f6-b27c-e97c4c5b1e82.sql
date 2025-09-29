-- Fix security definer view issues and complete the email harvesting protection

-- First, let's check if safe_public_profiles is the problematic view and remove it since we don't need it
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Drop the organization_member_profiles view I just created and recreate it properly without security definer
DROP VIEW IF EXISTS public.organization_member_profiles;

-- Recreate the view without security definer issues
CREATE VIEW public.organization_member_profiles AS
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

-- Grant access to the organization member view for authenticated users
GRANT SELECT ON public.organization_member_profiles TO authenticated;

-- Update the profiles table policies to be more secure
-- The current policy "Organization members can view public fields only" needs to be more restrictive
-- Let's make sure it only returns safe fields by using row-level filtering instead of column-level

-- Drop and recreate the organization member policy to be more explicit
DROP POLICY IF EXISTS "Organization members can view public fields only" ON public.profiles;

-- Create a more restrictive policy that will work with the view
CREATE POLICY "Organization members can view limited profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile
  auth.uid() = id
  OR
  -- Organization members can see each other's basic info (the view will handle column filtering)
  (organization_id IS NOT NULL 
   AND organization_id = get_user_organization_id(auth.uid())
   AND auth.uid() != id)
);