-- Create function to get organization members with email for invitations
-- This is specifically for team mobilization and requires same-org membership
CREATE OR REPLACE FUNCTION public.get_organization_members_for_invitations(_organization_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  public_display_name text,
  user_role user_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- This function includes email addresses for sending team invitations
  -- Security: Only returns emails for members of the same organization
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.public_display_name,
    p.user_role
  FROM public.profiles p
  WHERE p.organization_id = _organization_id
    AND p.organization_id IS NOT NULL
    -- Additional security: verify the calling user is part of the same organization
    AND EXISTS (
      SELECT 1 FROM public.profiles caller 
      WHERE caller.id = auth.uid() 
      AND caller.organization_id = _organization_id
    );
$$;