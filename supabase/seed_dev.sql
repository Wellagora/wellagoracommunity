-- ============================================================================
-- DEV SEED PIPELINE - Idempotent Marketplace Setup
-- ============================================================================
-- IDEMPOTENT: Safe to run multiple times. Uses fixed UUIDs and cleanup.
-- Creates 2 test programs (HUF + EUR) with approved HU/DE/EN localizations
-- and 1 active sponsor support rule for testing.
--
-- PRODUCTION POLICY: Marketplace only shows approved localizations. No fallback.
--
-- USAGE (Option A - Supabase SQL Editor):
--   1. Open Supabase Dashboard → SQL Editor
--   2. Copy/paste this ENTIRE file
--   3. Click "Run" (or Cmd+Enter)
--   4. Check output for "✅ DEV SEED COMPLETE"
--
-- USAGE (Option B - Supabase CLI, if configured):
--   supabase db reset
--   # This will run migrations + seed automatically
--
-- VERIFICATION (run after seed):
--   See queries at the end of this file
-- ============================================================================

DO $$
DECLARE
  -- Fixed UUIDs for idempotency
  test_creator_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  test_sponsor_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  program_huf_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  program_eur_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  support_rule_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🧹 CLEANUP: Removing existing DEV seed data';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- CLEANUP: Remove existing dev seed data (idempotent)
  -- ========================================================================
  
  -- Delete allocations first (foreign key dependency)
  DELETE FROM sponsorship_allocations 
  WHERE support_rule_id = support_rule_id;
  
  -- Delete support rules
  DELETE FROM sponsor_support_rules 
  WHERE id = support_rule_id;
  
  -- Delete localizations
  DELETE FROM content_localizations 
  WHERE content_id IN (program_huf_id, program_eur_id);
  
  -- Delete programs
  DELETE FROM expert_contents 
  WHERE id IN (program_huf_id, program_eur_id);
  
  -- Delete test users (only if they exist and have no other data)
  DELETE FROM profiles 
  WHERE id IN (test_creator_id, test_sponsor_id)
    AND NOT EXISTS (
      SELECT 1 FROM expert_contents WHERE creator_id IN (test_creator_id, test_sponsor_id) AND id NOT IN (program_huf_id, program_eur_id)
    );
  
  RAISE NOTICE '✅ Cleanup complete';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🌱 SEED: Creating fresh DEV data';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- STEP 1: Create Test Creator (fixed UUID)
  -- ========================================================================
  INSERT INTO profiles (id, first_name, last_name, user_role, is_verified_expert, email, created_at, updated_at)
  VALUES (
    test_creator_id,
    'Dev',
    'Expert',
    'expert',
    true,
    'dev.expert@wellagora.local',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Test creator: %', test_creator_id;

  -- ========================================================================
  -- STEP 2: Create Test Sponsor (fixed UUID)
  -- ========================================================================
  INSERT INTO profiles (id, first_name, last_name, user_role, email, created_at, updated_at)
  VALUES (
    test_sponsor_id,
    'Dev',
    'Sponsor',
    'business',
    'dev.sponsor@wellagora.local',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Test sponsor: %', test_sponsor_id;

  -- ========================================================================
  -- STEP 3: Create Program 1 - HUF Program (fixed UUID)
  -- ========================================================================
  INSERT INTO expert_contents (
    id,
    creator_id,
    title,
    description,
    category,
    content_type,
    access_type,
    price_huf,
    currency,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_huf_id,
    test_creator_id,
    'Fenntartható Kertészkedés Workshopja',
    'Tanuld meg a fenntartható kertészkedés alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez.',
    'sustainability',
    'in_person',
    'one_time_purchase',
    10000,
    'HUF',
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
  
  RAISE NOTICE '✅ HUF program: %', program_huf_id;

  -- ========================================================================
  -- STEP 4: Create Program 2 - EUR Program (fixed UUID)
  -- ========================================================================
  INSERT INTO expert_contents (
    id,
    creator_id,
    title,
    description,
    category,
    content_type,
    access_type,
    price_huf,
    price_eur,
    currency,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_eur_id,
    test_creator_id,
    'Community Impact Workshop',
    'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs.',
    'community',
    'online_live',
    'one_time_purchase',
    20000,
    50,
    'EUR',
    true,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
  
  RAISE NOTICE '✅ EUR program: %', program_eur_id;

  -- ========================================================================
  -- STEP 5: Create Approved Localizations (HU/DE/EN) - Idempotent
  -- ========================================================================
  
  -- HUF Program - Hungarian
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_huf_id, 'hu',
    'Fenntartható Kertészkedés Workshopja',
    'Tanuld meg a fenntartható kertészkedés alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez. Ideális kezdőknek és haladóknak egyaránt.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  -- HUF Program - German
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_huf_id, 'de',
    'Nachhaltige Gartenarbeit Workshop',
    'Lernen Sie die Grundlagen der nachhaltigen Gartenarbeit! Praktische Tipps für Kompostierung, Regenwassersammlung und natürlichen Pflanzenschutz.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  -- HUF Program - English
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_huf_id, 'en',
    'Sustainable Gardening Workshop',
    'Learn the fundamentals of sustainable gardening! Practical tips for composting, rainwater harvesting, and natural pest control.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  -- EUR Program - Hungarian
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_eur_id, 'hu',
    'Közösségi Hatás Mérése Workshop',
    'Tanuld meg, hogyan mérd és maximalizáld közösségi hatásodat. Gyakorlati keretrendszerek szociális vállalkozások és civil szervezetek számára.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  -- EUR Program - German
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_eur_id, 'de',
    'Community Impact Workshop',
    'Erfahren Sie, wie Sie Ihre Community-Wirkung messen und maximieren können. Praktische Frameworks für Sozialunternehmen und NGOs.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  -- EUR Program - English
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES (
    program_eur_id, 'en',
    'Community Impact Workshop',
    'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs.',
    true, NOW()
  )
  ON CONFLICT (content_id, locale) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_approved = EXCLUDED.is_approved;

  RAISE NOTICE '✅ 6 approved localizations (HU/DE/EN)';

  -- ========================================================================
  -- STEP 6: Create Active Sponsor Support Rule (fixed UUID)
  -- ========================================================================
  INSERT INTO sponsor_support_rules (
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
    test_sponsor_id,
    'program',
    program_huf_id,
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
  
  RAISE NOTICE '✅ Sponsor support rule: %', support_rule_id;
  RAISE NOTICE '   Support: 5,000 Ft/participant';
  RAISE NOTICE '   Budget: 50,000 Ft (10 max)';

  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DEV SEED COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Creator: %', test_creator_id;
  RAISE NOTICE 'Sponsor: %', test_sponsor_id;
  RAISE NOTICE 'HUF Program: %', program_huf_id;
  RAISE NOTICE 'EUR Program: %', program_eur_id;
  RAISE NOTICE 'Support Rule: %', support_rule_id;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next: Navigate to /piacer';
  RAISE NOTICE '   Expected: 2 programs, HUF has "Támogatott" badge';
  RAISE NOTICE '========================================';
  
END $$;

-- ============================================================================
-- VERIFICATION QUERIES - Run these to confirm seed worked
-- ============================================================================

-- Quick counts
SELECT 
  'Published Programs' as check_type,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END as status
FROM expert_contents 
WHERE is_published = true
UNION ALL
SELECT 
  'Approved Localizations (HU)',
  COUNT(*),
  CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations 
WHERE locale = 'hu' AND is_approved = true
UNION ALL
SELECT 
  'Approved Localizations (DE)',
  COUNT(*),
  CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations 
WHERE locale = 'de' AND is_approved = true
UNION ALL
SELECT 
  'Approved Localizations (EN)',
  COUNT(*),
  CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations 
WHERE locale = 'en' AND is_approved = true
UNION ALL
SELECT 
  'Active Support Rules',
  COUNT(*),
  CASE WHEN COUNT(*) >= 1 THEN '✅' ELSE '❌' END
FROM sponsor_support_rules 
WHERE status = 'active';

-- Detailed program view
SELECT 
  ec.id,
  ec.title,
  ec.currency,
  ec.price_huf,
  ec.price_eur,
  COUNT(DISTINCT cl.id) as translations,
  CASE WHEN ssr.id IS NOT NULL THEN '✅ Sponsored' ELSE '❌ Not sponsored' END as sponsor
FROM expert_contents ec
LEFT JOIN content_localizations cl ON ec.id = cl.content_id AND cl.is_approved = true
LEFT JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id AND ssr.status = 'active'
WHERE ec.is_published = true
GROUP BY ec.id, ec.title, ec.currency, ec.price_huf, ec.price_eur, ssr.id
ORDER BY ec.created_at DESC;
