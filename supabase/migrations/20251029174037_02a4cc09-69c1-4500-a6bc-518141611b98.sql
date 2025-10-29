-- Add RLS policy to allow users to join projects
-- This is needed so authenticated users can insert themselves into project_members table

CREATE POLICY "Users can join projects"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);