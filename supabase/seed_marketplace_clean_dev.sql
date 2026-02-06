-- ============================================================================
-- CLEAN DEV STATE + CANONICAL MARKETPLACE SEED
-- ============================================================================
-- Creates 3 test programs with embedded language fields (HU/EN/DE)
-- and 1 active sponsor support rule for real business logic testing.
--
-- USAGE:
--   1. Open Supabase SQL Editor
--   2. Copy ENTIRE file contents
--   3. Paste and Run (Cmd+Enter)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: CLEAN SLATE - Delete old DEV/marketplace data
-- ============================================================================

DO $$
DECLARE
  deleted_programs INT;
  deleted_rules INT;
  deleted_allocations INT;
BEGIN
  RAISE NOTICE '🧹 CLEANING OLD DEV DATA...';
  
  -- Delete old DEV programs and related data
  -- This cascades to sponsorship_allocations via sponsor_support_rules
  DELETE FROM public.sponsor_support_rules 
  WHERE scope_type = 'program' 
  AND scope_id IN (
    SELECT id FROM public.expert_contents 
    WHERE title LIKE '[DEV]%' OR category = 'dev'
  );
  GET DIAGNOSTICS deleted_rules = ROW_COUNT;
  
  DELETE FROM public.expert_contents 
  WHERE title LIKE '[DEV]%' OR category = 'dev';
  GET DIAGNOSTICS deleted_programs = ROW_COUNT;
  
  RAISE NOTICE '  Deleted % DEV programs', deleted_programs;
  RAISE NOTICE '  Deleted % sponsor support rules', deleted_rules;
  RAISE NOTICE '✅ Clean slate ready';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- STEP 2: LOOKUP AUTH USERS (Required for FK constraints)
-- ============================================================================

DO $$
DECLARE
  expert_auth_id UUID;
  sponsor_auth_id UUID;
  program_a_id UUID := 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa';
  program_b_id UUID := 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb';
  program_c_id UUID := 'cccccccc-3333-3333-3333-cccccccccccc';
  support_rule_id UUID := 'dddddddd-4444-4444-4444-dddddddddddd';
BEGIN
  RAISE NOTICE '🔍 LOOKING UP AUTH USERS...';
  
  -- Find expert user
  SELECT id INTO expert_auth_id 
  FROM auth.users 
  WHERE email = 'user2@wellagora.dev';
  
  IF expert_auth_id IS NULL THEN
    RAISE EXCEPTION E'❌ AUTH USER MISSING: user2@wellagora.dev\n\nCREATE THIS USER:\n1. Supabase Dashboard → Authentication → Users\n2. Click "Add user" → "Create new user"\n3. Email: user2@wellagora.dev\n4. Password: (any, e.g., TestPass123!)\n5. Auto Confirm User: YES\n6. Click "Create user"\n\nThen re-run this script.';
  END IF;
  
  RAISE NOTICE '  ✅ Expert: % (user2@wellagora.dev)', expert_auth_id;
  
  -- Find sponsor user
  SELECT id INTO sponsor_auth_id 
  FROM auth.users 
  WHERE email = 'user3@wellagora.dev';
  
  IF sponsor_auth_id IS NULL THEN
    RAISE EXCEPTION E'❌ AUTH USER MISSING: user3@wellagora.dev\n\nCREATE THIS USER:\n1. Supabase Dashboard → Authentication → Users\n2. Click "Add user" → "Create new user"\n3. Email: user3@wellagora.dev\n4. Password: (any, e.g., TestPass123!)\n5. Auto Confirm User: YES\n6. Click "Create user"\n\nThen re-run this script.';
  END IF;
  
  RAISE NOTICE '  ✅ Sponsor: % (user3@wellagora.dev)', sponsor_auth_id;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- STEP 3: CREATE CANONICAL PROGRAMS (3 programs with embedded languages)
  -- ========================================================================
  
  RAISE NOTICE '🌱 CREATING CANONICAL PROGRAMS...';
  
  -- Program A: Supported workshop (HUF, one_time_purchase, 10,000 Ft)
  INSERT INTO public.expert_contents (
    id,
    creator_id,
    title,
    description,
    title_en,
    description_en,
    title_de,
    description_de,
    category,
    content_type,
    access_level,
    price_huf,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_a_id,
    expert_auth_id,
    '[DEV] Támogatott Fenntarthatósági Workshop',
    'Tanuld meg a fenntartható életmód alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez. Ez a workshop szponzori támogatással érhető el kedvezményesen.',
    '[DEV] Supported Sustainability Workshop',
    'Learn the fundamentals of sustainable living! Practical tips for composting, rainwater harvesting, and natural pest control. This workshop is available at a discounted rate with sponsor support.',
    '[DEV] Unterstützter Nachhaltigkeits-Workshop',
    'Lernen Sie die Grundlagen des nachhaltigen Lebens! Praktische Tipps für Kompostierung, Regenwassersammlung und natürlichen Pflanzenschutz. Dieser Workshop ist mit Sponsorenunterstützung zu einem ermäßigten Preis verfügbar.',
    'sustainability',
    'in_person',
    'one_time_purchase',
    10000,
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
  
  RAISE NOTICE '  ✅ Program A: % (Supported, 10,000 Ft)', program_a_id;
  
  -- Program B: Not supported workshop (HUF, one_time_purchase, 20,000 Ft)
  INSERT INTO public.expert_contents (
    id,
    creator_id,
    title,
    description,
    title_en,
    description_en,
    title_de,
    description_de,
    category,
    content_type,
    access_level,
    price_huf,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_b_id,
    expert_auth_id,
    '[DEV] Közösségi Hatásmérés Workshop',
    'Tanuld meg, hogyan mérd és maximalizáld közösségi hatásodat. Gyakorlati keretrendszerek szociális vállalkozások és civil szervezetek számára. Teljes árú program szponzori támogatás nélkül.',
    '[DEV] Community Impact Measurement Workshop',
    'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs. Full-price program without sponsor support.',
    '[DEV] Community Impact Messungs-Workshop',
    'Erfahren Sie, wie Sie Ihre Community-Wirkung messen und maximieren können. Praktische Frameworks für Sozialunternehmen und NGOs. Vollpreis-Programm ohne Sponsorenunterstützung.',
    'community',
    'online_live',
    'one_time_purchase',
    20000,
    true,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
  
  RAISE NOTICE '  ✅ Program B: % (Not supported, 20,000 Ft)', program_b_id;
  
  -- Program C: Free community session (HUF, free, 0 Ft)
  INSERT INTO public.expert_contents (
    id,
    creator_id,
    title,
    description,
    title_en,
    description_en,
    title_de,
    description_de,
    category,
    content_type,
    access_level,
    price_huf,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_c_id,
    expert_auth_id,
    '[DEV] Ingyenes Közösségi Beszélgetés',
    'Csatlakozz ingyenes közösségi beszélgetésünkhöz! Ossz meg tapasztalatokat, tanulj másoktól és építs kapcsolatokat a fenntarthatóság iránt elkötelezett közösséggel. Regisztráció szükséges.',
    '[DEV] Free Community Conversation',
    'Join our free community conversation! Share experiences, learn from others, and build connections with a community committed to sustainability. Registration required.',
    '[DEV] Kostenlose Community-Gespräch',
    'Nehmen Sie an unserem kostenlosen Community-Gespräch teil! Teilen Sie Erfahrungen, lernen Sie von anderen und bauen Sie Verbindungen zu einer Gemeinschaft auf, die sich der Nachhaltigkeit verschrieben hat. Anmeldung erforderlich.',
    'community',
    'online_live',
    'free',
    0,
    true,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
  
  RAISE NOTICE '  ✅ Program C: % (Free, 0 Ft)', program_c_id;
  RAISE NOTICE '';
  
  -- ========================================================================
  -- STEP 4: CREATE SPONSOR SUPPORT RULE (Real business logic)
  -- ========================================================================
  
  RAISE NOTICE '💰 CREATING SPONSOR SUPPORT RULE...';
  
  INSERT INTO public.sponsor_support_rules (
    id,
    sponsor_id,
    scope_type,
    scope_id,
    amount_per_participant,
    currency,
    budget_total,
    budget_spent,
    max_participants,
    status,
    start_at,
    end_at,
    created_at,
    updated_at
  ) VALUES (
    support_rule_id,
    sponsor_auth_id,
    'program',
    program_a_id,
    5000,
    'HUF',
    50000,
    0,
    10,
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    budget_spent = EXCLUDED.budget_spent,
    updated_at = NOW();
  
  RAISE NOTICE '  ✅ Support Rule: %', support_rule_id;
  RAISE NOTICE '     Target: Program A (10,000 Ft workshop)';
  RAISE NOTICE '     Support: 5,000 Ft/participant';
  RAISE NOTICE '     Budget: 50,000 Ft total (max 10 participants)';
  RAISE NOTICE '     Status: active';
  RAISE NOTICE '';
  
  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CANONICAL SEED COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Expert: % (user2@wellagora.dev)', expert_auth_id;
  RAISE NOTICE 'Sponsor: % (user3@wellagora.dev)', sponsor_auth_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Programs:';
  RAISE NOTICE '  A (Supported): %', program_a_id;
  RAISE NOTICE '  B (Not supported): %', program_b_id;
  RAISE NOTICE '  C (Free): %', program_c_id;
  RAISE NOTICE '';
  RAISE NOTICE 'Support Rule: %', support_rule_id;
  RAISE NOTICE '========================================';
  
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '🔍 VERIFICATION:';
RAISE NOTICE '';

-- Count published programs
DO $$
DECLARE
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count 
  FROM public.expert_contents 
  WHERE is_published = true;
  
  RAISE NOTICE '📊 Published programs: %', total_count;
END $$;

-- Show recent programs
RAISE NOTICE '';
RAISE NOTICE '📋 Recent programs:';
SELECT 
  id,
  title,
  price_huf,
  access_level,
  is_published,
  CASE 
    WHEN title_en IS NOT NULL AND title_en != '' THEN '✅' 
    ELSE '❌' 
  END as has_en,
  CASE 
    WHEN title_de IS NOT NULL AND title_de != '' THEN '✅' 
    ELSE '❌' 
  END as has_de
FROM public.expert_contents 
WHERE is_published = true
ORDER BY created_at DESC 
LIMIT 10;

-- Count active support rules
DO $$
DECLARE
  active_rules INT;
BEGIN
  SELECT COUNT(*) INTO active_rules 
  FROM public.sponsor_support_rules 
  WHERE status = 'active';
  
  RAISE NOTICE '';
  RAISE NOTICE '💰 Active support rules: %', active_rules;
END $$;

-- Show support rules
RAISE NOTICE '';
RAISE NOTICE '📋 Active support rules:';
SELECT 
  ssr.id,
  ssr.amount_per_participant,
  ssr.currency,
  ssr.budget_total,
  ssr.budget_spent,
  ssr.max_participants,
  ec.title as program_title
FROM public.sponsor_support_rules ssr
JOIN public.expert_contents ec ON ec.id = ssr.scope_id
WHERE ssr.status = 'active'
ORDER BY ssr.created_at DESC;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ VERIFICATION COMPLETE';
RAISE NOTICE '========================================';
RAISE NOTICE '';
RAISE NOTICE 'EXPECTED RESULT:';
RAISE NOTICE '  1. /programs shows 3 programs in HU/EN/DE';
RAISE NOTICE '  2. Program A has "Támogatott" badge';
RAISE NOTICE '  3. Program A detail shows SupportBreakdownCard:';
RAISE NOTICE '     - Original: 10,000 Ft';
RAISE NOTICE '     - Support: +5,000 Ft (DEV Sponsor)';
RAISE NOTICE '     - Your price: 5,000 Ft';
RAISE NOTICE '========================================';
