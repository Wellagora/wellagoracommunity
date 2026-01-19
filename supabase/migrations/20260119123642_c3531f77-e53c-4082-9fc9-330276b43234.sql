-- 1) Super Admin full access policies based on profiles.is_super_admin
-- Note: use DO blocks to avoid duplicate_object errors.

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.sponsors
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.profiles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.expert_contents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.vouchers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.content_sponsorships
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Super Admin full access" ON public.events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_super_admin = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Seed "real" admin events if none exist
INSERT INTO public.events (
  title,
  description,
  start_date,
  end_date,
  location_name,
  location_address,
  status,
  current_participants,
  max_participants,
  is_public
)
SELECT * FROM (
  VALUES
    ('Wellness Hétvége', 'Kétnapos jóllét és feltöltődés.', '2026-01-25T10:00:00Z'::timestamptz, '2026-01-25T18:00:00Z'::timestamptz, 'Budapest', NULL, 'published', 0, 100, true),
    ('Közösségi Főzés', 'Online közösségi főzőprogram.', '2026-01-26T18:00:00Z'::timestamptz, NULL::timestamptz, 'Online', NULL, 'published', 0, 300, true),
    ('Tavaszi Kertészkedés', 'Gyakorlati kertészkedés a Káli-medencében.', '2026-02-01T10:00:00Z'::timestamptz, '2026-02-01T15:00:00Z'::timestamptz, 'Káli-medence', NULL, 'published', 0, 60, true)
) AS v(title, description, start_date, end_date, location_name, location_address, status, current_participants, max_participants, is_public)
WHERE (SELECT count(*) FROM public.events) = 0
AND NOT EXISTS (SELECT 1 FROM public.events e WHERE e.title = v.title);
