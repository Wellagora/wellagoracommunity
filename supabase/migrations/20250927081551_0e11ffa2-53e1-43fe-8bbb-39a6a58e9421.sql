-- Create security definer functions to avoid recursion (these won't fail if they exist)
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_profile_public(_profile_id uuid)
RETURNS boolean  
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_public_profile, false) FROM public.profiles WHERE id = _profile_id;
$$;

-- Drop ONLY the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create new safe policies with different names
CREATE POLICY "Public profiles are viewable" 
ON public.profiles 
FOR SELECT 
USING (public.is_profile_public(id) = true);

CREATE POLICY "Organization members can view each other" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id IS NOT NULL AND 
  organization_id = public.get_user_organization_id(auth.uid())
);