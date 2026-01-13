-- Fix analytics policy - use simpler check that doesn't rely on is_admin function
DROP POLICY IF EXISTS "Super admins can read analytics" ON public.analytics_events;

CREATE POLICY "Super admins can read analytics" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_admin = TRUE
    )
  );