-- ============================================================================
-- 2) SEED: Create 3 DEV programs with embedded language fields + sponsor rule
-- ============================================================================

BEGIN;

DO $$
DECLARE
  expert_id UUID;
  sponsor_id UUID;
  prog_a UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  prog_b UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  prog_c UUID := 'cccccccc-3333-3333-3333-cccccccccccc';
  rule_id UUID := 'dddddddd-4444-4444-4444-dddddddddddd';
BEGIN
  
  -- Lookup auth users
  SELECT id INTO expert_id FROM auth.users WHERE email = 'user2@wellagora.dev';
  SELECT id INTO sponsor_id FROM auth.users WHERE email = 'user3@wellagora.dev';
  
  IF expert_id IS NULL THEN
    RAISE EXCEPTION 'Create user2@wellagora.dev in Supabase Dashboard → Authentication → Users';
  END IF;
  IF sponsor_id IS NULL THEN
    RAISE EXCEPTION 'Create user3@wellagora.dev in Supabase Dashboard → Authentication → Users';
  END IF;
  
  -- Delete existing DEV programs
  DELETE FROM public.expert_contents WHERE title LIKE '[DEV]%';
  
  -- Program A: Supported (10,000 Ft) with sponsor
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    is_sponsored, sponsor_name, fixed_sponsor_amount,
    thumbnail_url, image_url,
    is_published, is_featured
  ) VALUES (
    prog_a, expert_id,
    'Fenntartható Életmód Alapjai',
    'Gyakorlati workshop a fenntartható életmód alapjairól. Szponzori támogatással kedvezményesen.',
    'Sustainable Living Fundamentals',
    'Practical workshop on sustainable living fundamentals. Discounted with sponsor support.',
    'Nachhaltige Lebensgrundlagen',
    'Praktischer Workshop über nachhaltige Lebensgrundlagen. Mit Sponsorenunterstützung ermäßigt.',
    'sustainability', 'in_person', 'one_time_purchase', 10000,
    true, 'GreenTech Kft.', 5000,
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
    true, false
  );
  
  -- Program B: Not supported (20,000 Ft)
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    thumbnail_url, image_url,
    is_published, is_featured
  ) VALUES (
    prog_b, expert_id,
    'Közösségi Hatásmérés Workshop',
    'Tanuld meg mérni és maximalizálni a közösségi hatásodat. Gyakorlati eszközök és módszerek.',
    'Community Impact Workshop',
    'Learn to measure and maximize your community impact. Practical tools and methods.',
    'Community Impact Workshop',
    'Lerne, deine Community-Wirkung zu messen und zu maximieren. Praktische Werkzeuge und Methoden.',
    'community', 'online_live', 'one_time_purchase', 20000,
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop',
    true, false
  );
  
  -- Program C: Free (0 Ft)
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    thumbnail_url, image_url,
    is_published, is_featured
  ) VALUES (
    prog_c, expert_id,
    'Fenntarthatósági Beszélgetés',
    'Nyílt közösségi beszélgetés fenntarthatóságról és zöld életmódról. Ingyenes részvétel.',
    'Sustainability Conversation',
    'Open community conversation about sustainability and green living. Free participation.',
    'Nachhaltigkeitsgespräch',
    'Offenes Community-Gespräch über Nachhaltigkeit und grünes Leben. Kostenlose Teilnahme.',
    'community', 'online_live', 'free', 0,
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
    true, false
  );
  
  -- Sponsor support rule for Program A
  INSERT INTO public.sponsor_support_rules (
    id, sponsor_id, scope_type, scope_id,
    amount_per_participant, currency,
    budget_total, budget_spent, max_participants,
    status, start_at, end_at
  ) VALUES (
    rule_id, sponsor_id, 'program', prog_a,
    5000, 'HUF',
    50000, 0, 10,
    'active', NOW(), NOW() + INTERVAL '30 days'
  );
  
END $$;

COMMIT;

-- Verification
SELECT COUNT(*) as published_total FROM public.expert_contents WHERE is_published = true;
SELECT COUNT(*) as dev_count FROM public.expert_contents WHERE title LIKE '[DEV]%' AND is_published = true;
SELECT id, title, price_huf, access_level FROM public.expert_contents WHERE title LIKE '[DEV]%' ORDER BY price_huf DESC;
SELECT COUNT(*) as active_rules FROM public.sponsor_support_rules WHERE status = 'active';
