-- Add RLS policy for organizations to create events
CREATE POLICY "Organizations can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND 
  (
    -- User has an organization
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND p.organization_id IS NOT NULL
    )
    OR
    -- Or user is admin/super_admin
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
  )
);

-- Allow users to update their own events
CREATE POLICY "Users can update own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own events
CREATE POLICY "Users can delete own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = created_by);