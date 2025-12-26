-- Fix generate_referral_code function search_path
CREATE OR REPLACE FUNCTION public.generate_referral_code() 
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.referral_code := LOWER(
    COALESCE(SUBSTRING(NEW.first_name, 1, 4), 'user') || '-' || 
    SUBSTRING(NEW.id::text, 1, 6)
  );
  RETURN NEW;
END;
$$;