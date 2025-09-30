-- Fix search_path security issue for validate_challenge_completion function
CREATE OR REPLACE FUNCTION public.validate_challenge_completion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate completion_type
  IF NEW.completion_type NOT IN ('manual', 'photo', 'api_verified', 'peer_verified') THEN
    RAISE EXCEPTION 'Invalid completion_type. Must be one of: manual, photo, api_verified, peer_verified';
  END IF;

  -- Validate validation_status
  IF NEW.validation_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid validation_status. Must be one of: pending, approved, rejected';
  END IF;

  -- Validate points_earned is not negative
  IF NEW.points_earned < 0 THEN
    RAISE EXCEPTION 'points_earned cannot be negative';
  END IF;

  -- Validate validation_score is between 0 and 1
  IF NEW.validation_score < 0 OR NEW.validation_score > 1 THEN
    RAISE EXCEPTION 'validation_score must be between 0 and 1';
  END IF;

  -- Sanitize notes (limit length)
  IF NEW.notes IS NOT NULL AND LENGTH(NEW.notes) > 5000 THEN
    RAISE EXCEPTION 'notes cannot exceed 5000 characters';
  END IF;

  RETURN NEW;
END;
$function$;