-- Allow public read access to expert/creator profiles for the gallery
CREATE POLICY "Public can view experts and creators" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  user_role IN ('expert', 'creator') 
  OR is_verified_expert = true 
  OR is_public_profile = true
);