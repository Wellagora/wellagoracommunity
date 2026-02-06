# DEV Setup Guide - Wellagora Marketplace

## 🎯 Overview

This guide helps you set up a complete development environment for testing the Wellagora marketplace with real database data. No mocks, no shortcuts - just production-like data for reliable testing.

**What you'll get:**
- ✅ 2 test programs (HUF + EUR) with approved HU/DE/EN localizations
- ✅ 1 active sponsor support rule (for testing "Sponsored" badge)
- ✅ 4 test user profiles (member/expert/sponsor/admin) for role-based testing

**Time required:** ~10 minutes

---

## 📋 Prerequisites

- Supabase project set up and running
- Access to Supabase Dashboard
- Local dev environment running (`npm run dev`)

---

## 🚀 Setup Steps

### **Step 1: Create Test Auth Users**

You need to create 4 test users in Supabase Auth Dashboard. These users will be used for role-based testing.

**Go to:** Supabase Dashboard → Authentication → Users → "Add user" → "Create new user"

Create these 4 users:

| Email | Password | Role | Auto Confirm |
|-------|----------|------|--------------|
| user1@wellagora.dev | wellagora123 | Member | ✅ YES |
| user2@wellagora.dev | wellagora123 | Expert | ✅ YES |
| user3@wellagora.dev | wellagora123 | Sponsor | ✅ YES |
| user4@wellagora.dev | wellagora123 | Admin | ✅ YES |

**Important:**
- ✅ Check "Auto Confirm User" for all users (skip email verification)
- ✅ Use the exact emails above (scripts depend on these)
- ✅ Password can be anything, but `wellagora123` is recommended for consistency

**Screenshot guide:**
1. Click "Add user"
2. Select "Create new user"
3. Enter email (e.g., `user1@wellagora.dev`)
4. Enter password (e.g., `wellagora123`)
5. Check "Auto Confirm User"
6. Click "Create user"
7. Repeat for all 4 users

---

### **Step 2: Seed Marketplace Data**

This creates test programs, localizations, and sponsor support rules.

**File:** `supabase/seed_marketplace_dev.sql`

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Open `supabase/seed_marketplace_dev.sql` in your code editor
3. Copy the **entire file** (Cmd+A → Cmd+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)

**Expected output:**
```
🧹 CLEANUP: Removing existing marketplace seed data
✅ Cleanup complete

🔍 LOOKUP: Finding auth users for profiles
✅ Found expert auth user: <uuid> (user2@wellagora.dev)
✅ Found sponsor auth user: <uuid> (user3@wellagora.dev)

🌱 SEED: Creating marketplace data
✅ Expert profile: <uuid>
✅ Sponsor profile: <uuid>
✅ HUF program: cccccccc-cccc-cccc-cccc-cccccccccccc
✅ EUR program: dddddddd-dddd-dddd-dddd-dddddddddddd
✅ 6 approved localizations (HU/DE/EN)
✅ Sponsor support rule: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
   Support: 5,000 Ft/participant
   Budget: 50,000 Ft (10 max)

========================================
✅ MARKETPLACE SEED COMPLETE
========================================
```

**If you see an error:**
- ❌ "Auth user not found: user2@wellagora.dev" → Go back to Step 1 and create the missing user
- ❌ "Auth user not found: user3@wellagora.dev" → Go back to Step 1 and create the missing user

**Verification:**

Run the verification queries at the bottom of the seed file:

```sql
-- Quick counts
SELECT 
  'Published Programs' as check_type,
  COUNT(*) as count,
  CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END as status
FROM expert_contents 
WHERE is_published = true
UNION ALL
SELECT 'Approved Localizations (HU)', COUNT(*), CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations WHERE locale = 'hu' AND is_approved = true
UNION ALL
SELECT 'Approved Localizations (DE)', COUNT(*), CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations WHERE locale = 'de' AND is_approved = true
UNION ALL
SELECT 'Approved Localizations (EN)', COUNT(*), CASE WHEN COUNT(*) >= 2 THEN '✅' ELSE '❌' END
FROM content_localizations WHERE locale = 'en' AND is_approved = true
UNION ALL
SELECT 'Active Support Rules', COUNT(*), CASE WHEN COUNT(*) >= 1 THEN '✅' ELSE '❌' END
FROM sponsor_support_rules WHERE status = 'active';
```

**Expected result:**
| check_type | count | status |
|------------|-------|--------|
| Published Programs | 2 | ✅ |
| Approved Localizations (HU) | 2 | ✅ |
| Approved Localizations (DE) | 2 | ✅ |
| Approved Localizations (EN) | 2 | ✅ |
| Active Support Rules | 1 | ✅ |

---

### **Step 3: Seed User Profiles**

This creates profiles for the 4 test users with correct roles.

**File:** `supabase/seed_test_users_and_profiles.sql`

**Steps:**
1. Open Supabase Dashboard → SQL Editor (same as Step 2)
2. Open `supabase/seed_test_users_and_profiles.sql` in your code editor
3. Copy the **entire file**
4. Paste into Supabase SQL Editor
5. Click **"Run"** or press Cmd+Enter

**Expected output:**
```
🔍 LOOKUP: Finding auth users by email
✅ Found member: <uuid> (user1@wellagora.dev)
✅ Found expert: <uuid> (user2@wellagora.dev)
✅ Found sponsor: <uuid> (user3@wellagora.dev)
✅ Found admin: <uuid> (user4@wellagora.dev)

🌱 SEED: Creating/updating profiles
✅ Member profile: <uuid>
✅ Expert profile: <uuid>
✅ Sponsor profile: <uuid>
✅ Admin profile: <uuid>

========================================
✅ PROFILES SEED COMPLETE
========================================
Profiles created: 4 / 4
```

**If you see warnings:**
- ⚠️ "NOT FOUND: user1@wellagora.dev" → Go back to Step 1 and create the missing user
- The script will continue with partial seed (only found users)

**Verification:**

Run the verification query at the bottom of the seed file:

```sql
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
```

**Expected result:**
| email | first_name | last_name | user_role | is_verified_expert | is_super_admin | auth_status |
|-------|------------|-----------|-----------|-------------------|----------------|-------------|
| user1@wellagora.dev | Test | Member | member | false | false | ✅ Auth user exists |
| user2@wellagora.dev | Test | Expert | expert | true | false | ✅ Auth user exists |
| user3@wellagora.dev | Test | Sponsor | business | false | false | ✅ Auth user exists |
| user4@wellagora.dev | Test | Admin | member | false | true | ✅ Auth user exists |

---

## ✅ Verification & Testing

### **1. Marketplace Testing**

**Navigate to:** http://localhost:5173/programs (or your dev URL)

**Test checklist:**

- [ ] **Initial load (HU):**
  - 2 programs visible
  - HUF program: "Fenntartható Kertészkedés Workshopja"
  - EUR program: "Közösségi Hatás Mérése Workshop"
  - HUF program has pink "Támogatott" badge with heart icon

- [ ] **Language switch to DE:**
  - Click language selector → Deutsch
  - 2 programs still visible
  - HUF program: "Nachhaltige Gartenarbeit Workshop"
  - Badge text: "Gesponsert"

- [ ] **Language switch to EN:**
  - Click language selector → English
  - 2 programs still visible
  - HUF program: "Sustainable Gardening Workshop"
  - Badge text: "Sponsored"

- [ ] **Program detail (HUF):**
  - Click on HUF program card
  - Right sidebar shows pricing card
  - Verify breakdown:
    ```
    Base price: 10,000 Ft
    Support: +5,000 Ft (Dev Sponsor)  ← Must be POSITIVE
    User pays: 5,000 Ft
    ```

- [ ] **Program detail (EUR):**
  - Click on EUR program card
  - No sponsor support breakdown (no badge on card)
  - Regular pricing only

---

### **2. Role-Based Navigation Testing**

Test each user role to verify navigation works correctly.

#### **A) Member (user1@wellagora.dev)**

1. Log in with `user1@wellagora.dev` / `wellagora123`
2. Verify navigation shows:
   - ✅ Marketplace
   - ✅ Events
   - ✅ Partners
   - ✅ Community
   - ✅ **My Agora** (member-specific)
   - ❌ Expert Studio (should NOT appear)
   - ❌ Sponsor Dashboard (should NOT appear)

3. Navigate to `/my-agora`
4. Verify page loads without errors

---

#### **B) Expert (user2@wellagora.dev)**

1. Log in with `user2@wellagora.dev` / `wellagora123`
2. Verify navigation shows:
   - ✅ Marketplace
   - ✅ Events
   - ✅ Partners
   - ✅ Community
   - ✅ My Agora
   - ✅ **Expert Studio** (expert-specific)
   - ❌ Sponsor Dashboard (should NOT appear)

3. Navigate to `/expert-studio`
4. Verify:
   - Page loads without errors
   - "My Programs" section shows 2 programs (from seed)
   - Programs are editable

---

#### **C) Sponsor (user3@wellagora.dev)**

1. Log in with `user3@wellagora.dev` / `wellagora123`
2. Verify navigation shows:
   - ✅ Marketplace
   - ✅ Events
   - ✅ Partners
   - ✅ Community
   - ✅ My Agora
   - ❌ Expert Studio (should NOT appear)
   - ✅ **Sponsor Dashboard** (sponsor-specific)

3. Navigate to `/sponsor-dashboard/support`
4. Verify:
   - Page loads without errors
   - Active support rules section shows 1 rule (from seed)
   - Rule details: 5,000 Ft/participant, 50,000 Ft budget

---

#### **D) Admin (user4@wellagora.dev)**

1. Log in with `user4@wellagora.dev` / `wellagora123`
2. Verify navigation shows:
   - ✅ Marketplace
   - ✅ Events
   - ✅ Partners
   - ✅ Community
   - ✅ My Agora
   - ✅ **Admin Panel** (admin-specific)

3. Navigate to admin routes
4. Verify admin-only features are accessible

---

### **3. DEV Diagnostics Testing**

**Test the DEV helper UI:**

1. Clear marketplace data (optional):
   ```sql
   DELETE FROM sponsorship_allocations WHERE support_rule_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
   DELETE FROM sponsor_support_rules WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
   DELETE FROM content_localizations WHERE content_id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
   DELETE FROM expert_contents WHERE id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
   ```

2. Navigate to `/programs`
3. Verify DEV helper appears with:
   - ❌ "ROOT CAUSE: No published programs in database"
   - 📊 Detailed counts (all zeros)
   - ✅ Solution section with exact steps
   - 🔍 Additional checks

4. Re-run `seed_marketplace_dev.sql`
5. Hard refresh page (Cmd+Shift+R)
6. Verify DEV helper disappears and programs appear

---

## 🔄 Re-running Seeds (Idempotency)

Both seed scripts are **idempotent** - safe to run multiple times.

**When to re-run:**
- After schema changes
- After accidentally deleting test data
- When you want a fresh start

**How to re-run:**
1. Just copy/paste the seed file again into SQL Editor
2. Click "Run"
3. No need to delete anything first (cleanup is built-in)

**What happens:**
- Existing test data is cleaned up
- Fresh data is inserted with same UUIDs
- No duplicates created

---

## 🐛 Troubleshooting

### **Issue: Marketplace shows 0 programs**

**Check 1: Seed ran successfully?**
```sql
SELECT COUNT(*) FROM expert_contents WHERE is_published = true;
-- Expected: 2
```

**Check 2: Localizations exist?**
```sql
SELECT locale, COUNT(*) 
FROM content_localizations 
WHERE is_approved = true 
GROUP BY locale;
-- Expected: hu=2, de=2, en=2
```

**Check 3: RLS policies allow SELECT?**
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('expert_contents', 'content_localizations')
AND cmd = 'SELECT';
-- Should see at least 1 policy per table
```

**Check 4: Browser console errors?**
- Open DevTools (F12)
- Check Console tab for errors
- Look for RLS or query errors

---

### **Issue: "Auth user not found" error**

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Verify the email exists in the list
3. If missing, create the user (see Step 1)
4. Re-run the seed script

---

### **Issue: Role-based nav not working**

**Check 1: Profile exists?**
```sql
SELECT * FROM profiles WHERE email = 'user2@wellagora.dev';
-- Should return 1 row with user_role = 'expert'
```

**Check 2: Auth user linked to profile?**
```sql
SELECT p.email, p.user_role, au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'user2@wellagora.dev';
-- auth_email should match p.email
```

**Check 3: Clear browser cache**
- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
- Or clear localStorage and cookies

---

### **Issue: Sponsored badge not appearing**

**Check 1: Support rule exists?**
```sql
SELECT * FROM sponsor_support_rules WHERE status = 'active';
-- Should return 1 row with id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
```

**Check 2: Currency matches?**
```sql
SELECT ec.currency as program_currency, ssr.currency as rule_currency
FROM expert_contents ec
JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id
WHERE ssr.status = 'active';
-- Both should be 'HUF'
```

**Check 3: Check DEV diagnostics**
- Navigate to `/programs`
- If 0 programs, check "Sponsor Rules" count in DEV helper
- Should show "1 active"

---

## 📚 Additional Resources

**Seed scripts:**
- `supabase/seed_marketplace_dev.sql` - Programs + localizations + sponsor rules
- `supabase/seed_test_users_and_profiles.sql` - User profiles with roles

**Documentation:**
- `SPONSOR_SUPPORT_E2E_CHECKLIST.md` - Detailed E2E testing checklist
- `MARKETPLACE_DIAGNOSIS.md` - Marketplace troubleshooting guide

**Key files:**
- `src/pages/ProgramsListingPage.tsx` - Marketplace listing with DEV diagnostics
- `src/pages/ProgramDetailPage.tsx` - Program detail with sponsor breakdown
- `src/components/sponsor/SupportBreakdownCard.tsx` - Sponsor support UI component
- `src/hooks/useSponsorSupport.ts` - Sponsor support detection hooks

---

## ✅ Success Criteria

After completing this setup, you should have:

- [x] 4 test auth users in Supabase Auth Dashboard
- [x] 4 profiles with correct roles (member/expert/sponsor/admin)
- [x] 2 published programs visible in marketplace
- [x] Approved localizations in HU/DE/EN for both programs
- [x] 1 active sponsor support rule (HUF program)
- [x] "Sponsored" badge visible on HUF program
- [x] SupportBreakdownCard visible on HUF program detail
- [x] Role-based navigation working for all 4 user types
- [x] DEV diagnostics helper working (shows when 0 programs)

**If all checkboxes are ticked: Your DEV environment is ready! 🎉**

---

## 🚀 Next Steps

Now that your DEV environment is set up:

1. **Test marketplace flows:**
   - Browse programs
   - Filter by category
   - Search programs
   - Switch languages

2. **Test sponsor support:**
   - Verify badge appearance
   - Check price breakdown
   - Test with different currencies

3. **Test role-based features:**
   - Member: My Agora
   - Expert: Expert Studio (create/edit programs)
   - Sponsor: Sponsor Dashboard (create support rules)
   - Admin: Admin panel

4. **Start development:**
   - All features now have real data
   - No mocks needed
   - Production-like testing environment

**Happy coding! 🚀**
