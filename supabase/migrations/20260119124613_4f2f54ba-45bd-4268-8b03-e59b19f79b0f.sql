-- First, drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Super Admin full access" ON public.profiles;

-- Create a security definer function to check super admin status
-- This avoids infinite recursion because SECURITY DEFINER bypasses RLS
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = check_user_id),
    false
  )
$$;

-- Now recreate the Super Admin policy using the function
CREATE POLICY "Super Admin full access profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Also fix the same issue on other tables that might have this problem
DROP POLICY IF EXISTS "Super Admin full access" ON public.sponsors;
CREATE POLICY "Super Admin full access sponsors"
ON public.sponsors
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admin full access" ON public.expert_contents;
CREATE POLICY "Super Admin full access expert_contents"
ON public.expert_contents
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admin full access" ON public.vouchers;
CREATE POLICY "Super Admin full access vouchers"
ON public.vouchers
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admin full access" ON public.content_sponsorships;
CREATE POLICY "Super Admin full access content_sponsorships"
ON public.content_sponsorships
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super Admin full access" ON public.events;
CREATE POLICY "Super Admin full access events"
ON public.events
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));