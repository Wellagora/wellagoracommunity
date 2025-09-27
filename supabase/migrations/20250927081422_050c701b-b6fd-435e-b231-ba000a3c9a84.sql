-- Fix infinite recursion in profiles RLS policies
-- Step 1: Drop ALL existing policies first

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Step 2: Create security definer functions to avoid recursion
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

-- Step 3: Create new safe policies using security definer functions
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_profile_public(id) = true);

CREATE POLICY "Users can view organization profiles if same org" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id IS NOT NULL AND 
  organization_id = public.get_user_organization_id(auth.uid())
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);