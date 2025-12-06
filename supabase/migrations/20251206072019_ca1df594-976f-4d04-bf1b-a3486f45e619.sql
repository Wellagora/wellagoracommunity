-- Add policy to allow anyone (including anonymous users) to view active challenges
-- This is needed for the public /challenges page to show programs

CREATE POLICY "Anyone can view active challenges" 
ON public.challenge_definitions 
FOR SELECT 
USING (is_active = true);