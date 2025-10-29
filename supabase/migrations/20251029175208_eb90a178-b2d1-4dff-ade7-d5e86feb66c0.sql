-- Drop unused views that are flagged as SECURITY DEFINER views by the linter
-- These views are not used in the application code

-- Drop my_roles view (not used, users can query user_roles table directly with RLS)
DROP VIEW IF EXISTS public.my_roles;

-- Drop regional_stakeholders view (not used, application queries profiles table directly)
DROP VIEW IF EXISTS public.regional_stakeholders;

-- Note: If these views are needed in the future, they should be recreated as:
-- 1. Regular views without SECURITY DEFINER, or
-- 2. SECURITY DEFINER functions with explicit permission checks