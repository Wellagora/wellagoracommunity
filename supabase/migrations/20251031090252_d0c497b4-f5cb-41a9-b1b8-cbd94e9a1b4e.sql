-- Fix search_path for validate_team_invitation function
DROP FUNCTION IF EXISTS validate_team_invitation() CASCADE;

CREATE OR REPLACE FUNCTION validate_team_invitation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER validate_team_invitation_trigger
BEFORE INSERT OR UPDATE ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION validate_team_invitation();