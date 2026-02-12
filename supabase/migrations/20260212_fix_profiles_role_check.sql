-- ============================================
-- P0 FIX: Registration broken — two issues:
-- 1. profiles_role_check constraint blocked new enum values
-- 2. handle_new_user trigger crashed silently on missing tables
-- ============================================

-- FIX 1: Drop the broken constraint and re-add with all valid values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (user_role::text IN ('citizen', 'business', 'government', 'ngo', 'member', 'expert', 'sponsor', 'creator'));

-- FIX 2: Robust handle_new_user trigger that won't crash
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  default_project_id uuid;
BEGIN
  -- Insert profile (core operation — must succeed)
  INSERT INTO public.profiles (id, first_name, last_name, email, user_role, organization)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'member'::public.user_role),
    NEW.raw_user_meta_data->>'organization'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Optional: assign to default project (non-critical — wrapped in exception handler)
  BEGIN
    SELECT (value->>'project_id')::uuid 
    INTO default_project_id
    FROM public.system_settings 
    WHERE key = 'default_project';

    IF default_project_id IS NOT NULL THEN
      INSERT INTO public.project_members (project_id, user_id, role)
      VALUES (default_project_id, NEW.id, 'member')
      ON CONFLICT DO NOTHING;

      UPDATE public.profiles
      SET project_id = default_project_id
      WHERE id = NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Don't let project assignment crash the whole signup
    RAISE WARNING 'handle_new_user: project assignment failed for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
