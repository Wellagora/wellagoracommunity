-- ============================================================================
-- MARKETPLACE DEV SEED - Idempotent
-- ============================================================================
-- Creates test programs with approved localizations and sponsor support rules
-- for marketplace development and testing.
--
-- BUSINESS RULE: Marketplace shows only programs with approved localizations
-- in the current language. NO FALLBACK to other languages.
--
-- This script creates:
-- - 2 published programs (1 HUF, 1 EUR)
-- - Approved localizations in HU/DE/EN for both programs
-- - 1 active sponsor support rule (for HUF program)
-- - Test expert and sponsor profiles (assumes auth.users exist)
--
-- IDEMPOTENT: Safe to run multiple times. Uses fixed UUIDs and ON CONFLICT.
--
-- USAGE:
--   1. Open Supabase SQL Editor
--   2. Copy the ENTIRE CONTENTS of this file (not the file path!)
--   3. Paste into SQL Editor
--   4. Click "Run" or press Cmd+Enter
--   5. Check output for "✅ MARKETPLACE SEED COMPLETE"
--   6. Verification queries run automatically at the end
--
-- NOTE: Programs are created even if auth users are missing.
--       Profiles are optional - only created if auth users exist.
--
-- VERIFICATION:
--   Navigate to /programs and verify:
--   - 2 programs visible in HU/DE/EN
--   - HUF program has "Támogatott/Sponsored" badge
-- ============================================================================

DO $$
DECLARE
  -- Fixed UUIDs for idempotency
  expert_profile_id UUID;
  sponsor_profile_id UUID;
  program_huf_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  program_eur_id UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  support_rule_id UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  
  -- Auth user IDs (will be looked up)
  expert_auth_id UUID;
  sponsor_auth_id UUID;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🧹 CLEANUP: Removing existing marketplace seed data';
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
  
  RAISE NOTICE '✅ Cleanup complete';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 LOOKUP: Finding auth users for profiles';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- STEP 1: Lookup auth users by email
  -- ========================================================================
  
  -- Try to find expert auth user (optional)
  SELECT id INTO expert_auth_id 
  FROM auth.users 
  WHERE email = 'user2@wellagora.dev';
  
  IF expert_auth_id IS NULL THEN
    RAISE NOTICE '⚠️  Auth user not found: user2@wellagora.dev';
    RAISE NOTICE '   Programs will be created without creator profile.';
    RAISE NOTICE '   To enable full testing, create this user in Auth Dashboard.';
    -- Use fixed UUID for creator_id even if auth user doesn't exist
    expert_profile_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  ELSE
    RAISE NOTICE '✅ Found expert auth user: % (user2@wellagora.dev)', expert_auth_id;
    expert_profile_id := expert_auth_id;
  END IF;
  
  -- Try to find sponsor auth user (optional)
  SELECT id INTO sponsor_auth_id 
  FROM auth.users 
  WHERE email = 'user3@wellagora.dev';
  
  IF sponsor_auth_id IS NULL THEN
    RAISE NOTICE '⚠️  Auth user not found: user3@wellagora.dev';
    RAISE NOTICE '   Sponsor support rule will be created with placeholder sponsor.';
    RAISE NOTICE '   To test sponsor dashboard, create this user in Auth Dashboard.';
    -- Use fixed UUID for sponsor_id even if auth user doesn't exist
    sponsor_profile_id := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  ELSE
    RAISE NOTICE '✅ Found sponsor auth user: % (user3@wellagora.dev)', sponsor_auth_id;
    sponsor_profile_id := sponsor_auth_id;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🌱 SEED: Creating marketplace data';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- STEP 2: Upsert Expert Profile (OPTIONAL - only if auth user exists)
  -- ========================================================================
  IF expert_auth_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      first_name, 
      last_name, 
      user_role, 
      is_verified_expert, 
      email,
      created_at, 
      updated_at
    ) VALUES (
      expert_profile_id,
      'Dev',
      'Expert',
      'expert',
      true,
      'user2@wellagora.dev',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      user_role = EXCLUDED.user_role,
      is_verified_expert = EXCLUDED.is_verified_expert,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Expert profile: %', expert_profile_id;
  ELSE
    RAISE NOTICE '⏭️  Skipped expert profile (auth user missing)';
  END IF;

  -- ========================================================================
  -- STEP 3: Upsert Sponsor Profile (OPTIONAL - only if auth user exists)
  -- ========================================================================
  IF sponsor_auth_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      first_name, 
      last_name, 
      user_role, 
      email,
      created_at, 
      updated_at
    ) VALUES (
      sponsor_profile_id,
      'Dev',
      'Sponsor',
      'business',
      'user3@wellagora.dev',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      user_role = EXCLUDED.user_role,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Sponsor profile: %', sponsor_profile_id;
  ELSE
    RAISE NOTICE '⏭️  Skipped sponsor profile (auth user missing)';
  END IF;

  -- ========================================================================
  -- STEP 4: Create Program 1 - HUF Program (with sponsor support)
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
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_huf_id,
    expert_profile_id,
    'Fenntartható Kertészkedés Workshopja',
    'Tanuld meg a fenntartható kertészkedés alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez.',
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
  
  RAISE NOTICE '✅ HUF program: % (price: 10,000 Ft)', program_huf_id;

  -- ========================================================================
  -- STEP 5: Create Program 2 - Second HUF Program (no sponsor support)
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
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_eur_id,
    expert_profile_id,
    'Közösségi Hatás Mérése Workshop',
    'Tanuld meg, hogyan mérd és maximalizáld közösségi hatásodat. Gyakorlati keretrendszerek szociális vállalkozások és civil szervezetek számára.',
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
  
  RAISE NOTICE '✅ Second HUF program: % (price: 20,000 Ft)', program_eur_id;

  -- ========================================================================
  -- STEP 6: Create Approved Localizations (HU/DE/EN) - Idempotent
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
  -- STEP 7: Create Active Sponsor Support Rule (fixed UUID)
  -- ========================================================================
  -- NOTE: sponsor_support_rules table uses 'currency' field for the rule
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
    sponsor_profile_id,
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
  RAISE NOTICE '   Target: First HUF program (10,000 Ft)';
  RAISE NOTICE '   Support: 5,000 Ft/participant';
  RAISE NOTICE '   Budget: 50,000 Ft (max 10 participants)';

  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MARKETPLACE SEED COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Expert: % (user2@wellagora.dev)', expert_profile_id;
  RAISE NOTICE 'Sponsor: % (user3@wellagora.dev)', sponsor_profile_id;
  RAISE NOTICE 'Program 1 (HUF, sponsored): %', program_huf_id;
  RAISE NOTICE 'Program 2 (HUF, not sponsored): %', program_eur_id;
  RAISE NOTICE 'Support Rule: %', support_rule_id;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Navigate to /programs';
  RAISE NOTICE '   2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)';
  RAISE NOTICE '   3. Switch language: HU/DE/EN';
  RAISE NOTICE '   4. Verify: 2 programs visible in all languages';
  RAISE NOTICE '   5. HUF program has "Támogatott/Sponsored" badge';
  RAISE NOTICE '   6. Click HUF program → verify SupportBreakdownCard';
  RAISE NOTICE '========================================';
  
END $$;

-- ============================================================================
-- MANDATORY VERIFICATION QUERIES - Run automatically
-- ============================================================================
-- These queries verify the seed worked correctly by checking the exact
-- tables and columns that the /programs page uses.

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '🔍 VERIFICATION: Checking database state';
RAISE NOTICE '========================================';

-- Check 1: Total programs in expert_contents table
DO $$
DECLARE
  total_count INT;
  published_count INT;
BEGIN
  SELECT COUNT(*) INTO total_count FROM expert_contents;
  SELECT COUNT(*) INTO published_count FROM expert_contents WHERE is_published = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLE: expert_contents';
  RAISE NOTICE '   Total programs: %', total_count;
  RAISE NOTICE '   Published (is_published=true): %', published_count;
  
  IF published_count >= 2 THEN
    RAISE NOTICE '   ✅ PASS: At least 2 published programs';
  ELSE
    RAISE NOTICE '   ❌ FAIL: Expected >= 2, got %', published_count;
  END IF;
END $$;

-- Check 2: Approved localizations by language
DO $$
DECLARE
  hu_count INT;
  de_count INT;
  en_count INT;
BEGIN
  SELECT COUNT(*) INTO hu_count 
  FROM content_localizations 
  WHERE locale = 'hu' AND is_approved = true;
  
  SELECT COUNT(*) INTO de_count 
  FROM content_localizations 
  WHERE locale = 'de' AND is_approved = true;
  
  SELECT COUNT(*) INTO en_count 
  FROM content_localizations 
  WHERE locale = 'en' AND is_approved = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLE: content_localizations';
  RAISE NOTICE '   Approved HU: %', hu_count;
  RAISE NOTICE '   Approved DE: %', de_count;
  RAISE NOTICE '   Approved EN: %', en_count;
  
  IF hu_count >= 2 AND de_count >= 2 AND en_count >= 2 THEN
    RAISE NOTICE '   ✅ PASS: All languages have >= 2 approved localizations';
  ELSE
    RAISE NOTICE '   ❌ FAIL: Expected >= 2 for each language';
  END IF;
END $$;

-- Check 3: Active sponsor support rules
DO $$
DECLARE
  active_rules_count INT;
BEGIN
  SELECT COUNT(*) INTO active_rules_count 
  FROM sponsor_support_rules 
  WHERE status = 'active';
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLE: sponsor_support_rules';
  RAISE NOTICE '   Active rules (status=active): %', active_rules_count;
  
  IF active_rules_count >= 1 THEN
    RAISE NOTICE '   ✅ PASS: At least 1 active support rule';
  ELSE
    RAISE NOTICE '   ❌ FAIL: Expected >= 1, got %', active_rules_count;
  END IF;
END $$;

-- Check 4: Detailed program view (what /programs page will see)
RAISE NOTICE '';
RAISE NOTICE '📊 DETAILED VIEW: Programs with localizations';
RAISE NOTICE '   (This is what /programs page queries)';
RAISE NOTICE '';

SELECT 
  ec.id,
  ec.title as base_title,
  ec.currency,
  ec.price_huf,
  ec.is_published,
  COUNT(DISTINCT CASE WHEN cl.locale = 'hu' AND cl.is_approved = true THEN cl.id END) as hu_approved,
  COUNT(DISTINCT CASE WHEN cl.locale = 'de' AND cl.is_approved = true THEN cl.id END) as de_approved,
  COUNT(DISTINCT CASE WHEN cl.locale = 'en' AND cl.is_approved = true THEN cl.id END) as en_approved,
  CASE WHEN ssr.id IS NOT NULL THEN '✅ Sponsored' ELSE '❌ Not sponsored' END as sponsor_status
FROM expert_contents ec
LEFT JOIN content_localizations cl ON ec.id = cl.content_id
LEFT JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id AND ssr.status = 'active'
WHERE ec.is_published = true
GROUP BY ec.id, ec.title, ec.currency, ec.price_huf, ec.is_published, ssr.id
ORDER BY ec.created_at DESC;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ VERIFICATION COMPLETE';
RAISE NOTICE '========================================';
RAISE NOTICE 'If all checks PASS, navigate to /programs';
RAISE NOTICE 'and hard refresh (Cmd+Shift+R).';
RAISE NOTICE '========================================';

-- ============================================================================
-- VERIFICATION QUERIES - Run these to confirm seed worked
-- ============================================================================

-- Quick counts by check type
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

-- Detailed program view with translations and sponsor status
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
