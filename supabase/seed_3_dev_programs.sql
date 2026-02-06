-- ============================================================================
-- SEED: Create 3 DEV programs with embedded language fields
-- ============================================================================

BEGIN;

DO $$
DECLARE
  expert_auth_id UUID;
  sponsor_auth_id UUID;
  program_a_id UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  program_b_id UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  program_c_id UUID := 'cccccccc-3333-3333-3333-cccccccccccc';
  support_rule_id UUID := 'dddddddd-4444-4444-4444-dddddddddddd';
BEGIN
  
  -- Lookup auth users
  SELECT id INTO expert_auth_id FROM auth.users WHERE email = 'user2@wellagora.dev';
  SELECT id INTO sponsor_auth_id FROM auth.users WHERE email = 'user3@wellagora.dev';
  
  IF expert_auth_id IS NULL THEN
    RAISE EXCEPTION 'Auth user missing: user2@wellagora.dev. Create in Supabase Dashboard → Authentication → Users';
  END IF;
  
  IF sponsor_auth_id IS NULL THEN
    RAISE EXCEPTION 'Auth user missing: user3@wellagora.dev. Create in Supabase Dashboard → Authentication → Users';
  END IF;
  
  -- Delete existing DEV programs first
  DELETE FROM public.sponsor_support_rules
  WHERE scope_type = 'program'
  AND scope_id IN (
    SELECT id FROM public.expert_contents WHERE title LIKE '[DEV]%'
  );
  
  DELETE FROM public.expert_contents WHERE title LIKE '[DEV]%';
  
  -- Program A: Supported (10,000 Ft)
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    is_published, is_featured,
    created_at, updated_at
  ) VALUES (
    program_a_id, expert_auth_id,
    '[DEV] Támogatott Fenntarthatósági Workshop',
    'Tanuld meg a fenntartható életmód alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez. Szponzori támogatással kedvezményesen.',
    '[DEV] Supported Sustainability Workshop',
    'Learn the fundamentals of sustainable living! Practical tips for composting, rainwater harvesting, and natural pest control. Available at a discounted rate with sponsor support.',
    '[DEV] Unterstützter Nachhaltigkeits-Workshop',
    'Lernen Sie die Grundlagen des nachhaltigen Lebens! Praktische Tipps für Kompostierung, Regenwassersammlung und natürlichen Pflanzenschutz. Mit Sponsorenunterstützung zu einem ermäßigten Preis.',
    'sustainability', 'in_person', 'one_time_purchase', 10000,
    true, true,
    NOW(), NOW()
  );
  
  -- Program B: Not supported (20,000 Ft)
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    is_published, is_featured,
    created_at, updated_at
  ) VALUES (
    program_b_id, expert_auth_id,
    '[DEV] Közösségi Hatásmérés Workshop',
    'Tanuld meg, hogyan mérd és maximalizáld közösségi hatásodat. Gyakorlati keretrendszerek szociális vállalkozások és civil szervezetek számára. Teljes árú program.',
    '[DEV] Community Impact Measurement Workshop',
    'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs. Full-price program.',
    '[DEV] Community Impact Messungs-Workshop',
    'Erfahren Sie, wie Sie Ihre Community-Wirkung messen und maximieren können. Praktische Frameworks für Sozialunternehmen und NGOs. Vollpreis-Programm.',
    'community', 'online_live', 'one_time_purchase', 20000,
    true, false,
    NOW(), NOW()
  );
  
  -- Program C: Free (0 Ft)
  INSERT INTO public.expert_contents (
    id, creator_id,
    title, description,
    title_en, description_en,
    title_de, description_de,
    category, content_type, access_level, price_huf,
    is_published, is_featured,
    created_at, updated_at
  ) VALUES (
    program_c_id, expert_auth_id,
    '[DEV] Ingyenes Közösségi Beszélgetés',
    'Csatlakozz ingyenes közösségi beszélgetésünkhöz! Ossz meg tapasztalatokat, tanulj másoktól és építs kapcsolatokat a fenntarthatóság iránt elkötelezett közösséggel.',
    '[DEV] Free Community Conversation',
    'Join our free community conversation! Share experiences, learn from others, and build connections with a community committed to sustainability.',
    '[DEV] Kostenlose Community-Gespräch',
    'Nehmen Sie an unserem kostenlosen Community-Gespräch teil! Teilen Sie Erfahrungen, lernen Sie von anderen und bauen Sie Verbindungen auf.',
    'community', 'online_live', 'free', 0,
    true, false,
    NOW(), NOW()
  );
  
  -- Sponsor support rule for Program A
  INSERT INTO public.sponsor_support_rules (
    id, sponsor_id, scope_type, scope_id,
    amount_per_participant, currency,
    budget_total, budget_spent, max_participants,
    status, start_at, end_at,
    created_at, updated_at
  ) VALUES (
    support_rule_id, sponsor_auth_id, 'program', program_a_id,
    5000, 'HUF',
    50000, 0, 10,
    'active', NOW(), NOW() + INTERVAL '30 days',
    NOW(), NOW()
  );
  
  RAISE NOTICE '✅ Created 3 DEV programs + 1 support rule';
  
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count published programs
SELECT 
  COUNT(*) FILTER (WHERE title LIKE '[DEV]%') as dev_published,
  COUNT(*) FILTER (WHERE title NOT LIKE '[DEV]%') as non_dev_published,
  COUNT(*) as total_published
FROM public.expert_contents
WHERE is_published = true;

-- List DEV programs
SELECT 
  id,
  title,
  price_huf,
  access_level,
  CASE WHEN title_en IS NOT NULL AND title_en != '' THEN '✅' ELSE '❌' END as has_en,
  CASE WHEN title_de IS NOT NULL AND title_de != '' THEN '✅' ELSE '❌' END as has_de
FROM public.expert_contents
WHERE title LIKE '[DEV]%'
ORDER BY created_at DESC;

-- Verify support rule
SELECT 
  ssr.id,
  ssr.amount_per_participant,
  ssr.currency,
  ssr.budget_total,
  ssr.status,
  ec.title as program_title
FROM public.sponsor_support_rules ssr
JOIN public.expert_contents ec ON ec.id = ssr.scope_id
WHERE ssr.status = 'active'
AND ec.title LIKE '[DEV]%';
