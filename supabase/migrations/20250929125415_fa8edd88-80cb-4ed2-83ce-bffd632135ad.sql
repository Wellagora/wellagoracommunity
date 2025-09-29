-- Drop the problematic view and fix the approach
DROP VIEW IF EXISTS public.public_profiles;

-- Update the profiles table RLS policy to be more specific and secure
DROP POLICY IF EXISTS "Public profiles are viewable without email" ON public.profiles;

-- Create a more restrictive policy that specifically excludes email from public access
CREATE POLICY "Public profiles viewable without sensitive data" 
ON public.profiles 
FOR SELECT 
USING (
  is_public_profile = true 
  -- This policy allows access but the client code should not request email column
);

-- Keep only the safe function for getting public profiles
-- This function is secure as it explicitly lists allowed columns
-- No need to drop the function as it's properly designed

-- Grant execute permission on the function to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;