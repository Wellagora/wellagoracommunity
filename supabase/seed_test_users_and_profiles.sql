-- ============================================================================
-- TEST USERS AND PROFILES SEED - Idempotent
-- ============================================================================
-- Creates profiles for 4 test users (member/expert/sponsor/admin) by looking
-- up existing auth.users by email.
--
-- IMPORTANT: This script does NOT create auth.users (SQL Editor may not allow).
-- You must create these users in Supabase Auth Dashboard FIRST.
--
-- Required auth users (create in Auth Dashboard before running):
--   - user1@wellagora.dev (member)
--   - user2@wellagora.dev (expert)
--   - user3@wellagora.dev (sponsor)
--   - user4@wellagora.dev (admin)
--
-- IDEMPOTENT: Safe to run multiple times. Uses ON CONFLICT DO UPDATE.
--
-- USAGE:
--   1. Create 4 test users in Supabase Auth Dashboard (see above emails)
--   2. Open Supabase SQL Editor
--   3. Copy/paste this entire file
--   4. Click "Run" or press Cmd+Enter
--   5. Check output for "✅ PROFILES SEED COMPLETE"
--
-- VERIFICATION:
--   Log in as each user and verify role-based navigation works:
--   - user1@wellagora.dev → member nav (My Agora)
--   - user2@wellagora.dev → expert nav (Expert Studio)
--   - user3@wellagora.dev → sponsor nav (Sponsor Dashboard)
--   - user4@wellagora.dev → admin nav (Admin panel)
-- ============================================================================

DO $$
DECLARE
  -- Auth user IDs (will be looked up)
  member_auth_id UUID;
  expert_auth_id UUID;
  sponsor_auth_id UUID;
  admin_auth_id UUID;
  
  -- Tracking
  missing_users TEXT[] := ARRAY[]::TEXT[];
  found_count INT := 0;
BEGIN
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 LOOKUP: Finding auth users by email';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- STEP 1: Lookup all auth users by email
  -- ========================================================================
  
  -- Member
  SELECT id INTO member_auth_id 
  FROM auth.users 
  WHERE email = 'user1@wellagora.dev';
  
  IF member_auth_id IS NULL THEN
    missing_users := array_append(missing_users, 'user1@wellagora.dev (member)');
    RAISE NOTICE '❌ NOT FOUND: user1@wellagora.dev';
  ELSE
    found_count := found_count + 1;
    RAISE NOTICE '✅ Found member: % (user1@wellagora.dev)', member_auth_id;
  END IF;
  
  -- Expert
  SELECT id INTO expert_auth_id 
  FROM auth.users 
  WHERE email = 'user2@wellagora.dev';
  
  IF expert_auth_id IS NULL THEN
    missing_users := array_append(missing_users, 'user2@wellagora.dev (expert)');
    RAISE NOTICE '❌ NOT FOUND: user2@wellagora.dev';
  ELSE
    found_count := found_count + 1;
    RAISE NOTICE '✅ Found expert: % (user2@wellagora.dev)', expert_auth_id;
  END IF;
  
  -- Sponsor
  SELECT id INTO sponsor_auth_id 
  FROM auth.users 
  WHERE email = 'user3@wellagora.dev';
  
  IF sponsor_auth_id IS NULL THEN
    missing_users := array_append(missing_users, 'user3@wellagora.dev (sponsor)');
    RAISE NOTICE '❌ NOT FOUND: user3@wellagora.dev';
  ELSE
    found_count := found_count + 1;
    RAISE NOTICE '✅ Found sponsor: % (user3@wellagora.dev)', sponsor_auth_id;
  END IF;
  
  -- Admin
  SELECT id INTO admin_auth_id 
  FROM auth.users 
  WHERE email = 'user4@wellagora.dev';
  
  IF admin_auth_id IS NULL THEN
    missing_users := array_append(missing_users, 'user4@wellagora.dev (admin)');
    RAISE NOTICE '❌ NOT FOUND: user4@wellagora.dev';
  ELSE
    found_count := found_count + 1;
    RAISE NOTICE '✅ Found admin: % (user4@wellagora.dev)', admin_auth_id;
  END IF;
  
  -- ========================================================================
  -- ERROR HANDLING: If any users are missing, provide clear instructions
  -- ========================================================================
  
  IF array_length(missing_users, 1) > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '⚠️  MISSING AUTH USERS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Found: % / 4 users', found_count;
    RAISE NOTICE 'Missing: %', array_to_string(missing_users, ', ');
    RAISE NOTICE '';
    RAISE NOTICE '📋 ACTION REQUIRED:';
    RAISE NOTICE '   1. Go to Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '   2. Click "Add user" → "Create new user"';
    RAISE NOTICE '   3. Create each missing user with:';
    RAISE NOTICE '      - Email: (see above)';
    RAISE NOTICE '      - Password: wellagora123 (or your choice)';
    RAISE NOTICE '      - Auto Confirm User: YES';
    RAISE NOTICE '   4. Re-run this script';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    
    -- Continue with partial seed (create profiles for found users only)
    RAISE NOTICE '⚠️  Continuing with partial seed for % found user(s)...', found_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🌱 SEED: Creating/updating profiles';
  RAISE NOTICE '========================================';
  
  -- ========================================================================
  -- STEP 2: Upsert profiles for found users
  -- ========================================================================
  
  -- Member profile
  IF member_auth_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      first_name, 
      last_name, 
      user_role, 
      email,
      created_at, 
      updated_at
    ) VALUES (
      member_auth_id,
      'Test',
      'Member',
      'member',
      'user1@wellagora.dev',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      user_role = EXCLUDED.user_role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Member profile: %', member_auth_id;
  END IF;
  
  -- Expert profile
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
      expert_auth_id,
      'Test',
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
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Expert profile: %', expert_auth_id;
  END IF;
  
  -- Sponsor profile
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
      sponsor_auth_id,
      'Test',
      'Sponsor',
      'business',
      'user3@wellagora.dev',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      user_role = EXCLUDED.user_role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Sponsor profile: %', sponsor_auth_id;
  END IF;
  
  -- Admin profile
  IF admin_auth_id IS NOT NULL THEN
    INSERT INTO profiles (
      id, 
      first_name, 
      last_name, 
      user_role,
      is_super_admin,
      email,
      created_at, 
      updated_at
    ) VALUES (
      admin_auth_id,
      'Test',
      'Admin',
      'member',
      true,
      'user4@wellagora.dev',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      user_role = EXCLUDED.user_role,
      is_super_admin = EXCLUDED.is_super_admin,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Admin profile: %', admin_auth_id;
  END IF;
  
  -- ========================================================================
  -- SUMMARY
  -- ========================================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  IF array_length(missing_users, 1) > 0 THEN
    RAISE NOTICE '⚠️  PROFILES SEED PARTIAL';
  ELSE
    RAISE NOTICE '✅ PROFILES SEED COMPLETE';
  END IF;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Profiles created: % / 4', found_count;
  IF array_length(missing_users, 1) > 0 THEN
    RAISE NOTICE 'Missing auth users: %', array_to_string(missing_users, ', ');
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Create missing users in Auth Dashboard and re-run.';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test Login:';
  IF member_auth_id IS NOT NULL THEN
    RAISE NOTICE '   user1@wellagora.dev → My Agora (member nav)';
  END IF;
  IF expert_auth_id IS NOT NULL THEN
    RAISE NOTICE '   user2@wellagora.dev → Expert Studio (expert nav)';
  END IF;
  IF sponsor_auth_id IS NOT NULL THEN
    RAISE NOTICE '   user3@wellagora.dev → Sponsor Dashboard (sponsor nav)';
  END IF;
  IF admin_auth_id IS NOT NULL THEN
    RAISE NOTICE '   user4@wellagora.dev → Admin Panel (admin nav)';
  END IF;
  RAISE NOTICE '========================================';
  
END $$;

-- ============================================================================
-- VERIFICATION QUERY - Run this to confirm profiles exist
-- ============================================================================

SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.user_role,
  p.is_verified_expert,
  p.is_super_admin,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Auth user exists'
    ELSE '❌ Auth user missing'
  END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email IN (
  'user1@wellagora.dev',
  'user2@wellagora.dev',
  'user3@wellagora.dev',
  'user4@wellagora.dev'
)
ORDER BY p.email;
