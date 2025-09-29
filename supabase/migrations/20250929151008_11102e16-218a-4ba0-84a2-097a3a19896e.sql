-- Final fix for email exposure - remove all problematic policies and create a single secure policy

-- First, let's clean up all existing SELECT policies on profiles table
DROP POLICY IF EXISTS "Organization members can view each other" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles view is accessible to everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable without sensitive data" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organization profiles if same org" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Restricted profile access" ON public.profiles;
DROP POLICY IF EXISTS "Strict profile access control" ON public.profiles;

-- Create a single, comprehensive SELECT policy that prevents email exposure
CREATE POLICY "Secure profile access only" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see their own complete profile (including email)
  auth.uid() = id
  OR
  -- Organization members can see each other's complete profiles (including email)
  (organization_id IS NOT NULL AND organization_id = get_user_organization_id(auth.uid()))
  -- Public access is completely blocked - use get_public_profile() function instead
);

-- Ensure the secure function has proper permissions
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;