-- Add project_id to challenge_definitions table
ALTER TABLE public.challenge_definitions
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_challenge_definitions_project_id ON public.challenge_definitions(project_id);

-- Update RLS policies for challenge_definitions
DROP POLICY IF EXISTS "Challenge definitions are viewable by everyone" ON public.challenge_definitions;

-- Allow users to view challenges in their projects
CREATE POLICY "Users can view challenges in their projects"
ON public.challenge_definitions
FOR SELECT
USING (
  is_active = true 
  AND (
    project_id IS NULL 
    OR is_project_member(auth.uid(), project_id)
  )
);

-- Allow project admins to insert challenges
CREATE POLICY "Project admins can create challenges"
ON public.challenge_definitions
FOR INSERT
WITH CHECK (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin')
);

-- Allow project admins to update challenges
CREATE POLICY "Project admins can update challenges"
ON public.challenge_definitions
FOR UPDATE
USING (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin')
);

-- Allow project admins to delete challenges
CREATE POLICY "Project admins can delete challenges"
ON public.challenge_definitions
FOR DELETE
USING (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin')
);