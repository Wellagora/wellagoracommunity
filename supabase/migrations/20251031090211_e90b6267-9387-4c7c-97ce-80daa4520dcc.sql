-- Create team_invitations table for managing team member invitations
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_name text,
  challenge_id text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_team_invitations_email ON public.team_invitations(invitee_email);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_org ON public.team_invitations(organization_id);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Organization members can view invitations for their organization
CREATE POLICY "Organization members can view their org invitations"
ON public.team_invitations
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Organization members can create invitations
CREATE POLICY "Organization members can create invitations"
ON public.team_invitations
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
  AND inviter_user_id = auth.uid()
);

-- Inviter can update their own invitations
CREATE POLICY "Inviters can update their invitations"
ON public.team_invitations
FOR UPDATE
USING (inviter_user_id = auth.uid());

-- Add is_team_challenge flag to challenge_definitions
ALTER TABLE public.challenge_definitions 
ADD COLUMN IF NOT EXISTS is_team_challenge boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_team_size integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_team_size integer;

-- Create validation trigger for team_invitations
CREATE OR REPLACE FUNCTION validate_team_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format
  IF NEW.invitee_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate status
  IF NEW.status NOT IN ('pending', 'accepted', 'rejected', 'expired') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  
  -- Validate message length
  IF NEW.message IS NOT NULL AND LENGTH(NEW.message) > 1000 THEN
    RAISE EXCEPTION 'Message cannot exceed 1000 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_team_invitation_trigger
BEFORE INSERT OR UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION validate_team_invitation();

-- Update trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
BEFORE UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();