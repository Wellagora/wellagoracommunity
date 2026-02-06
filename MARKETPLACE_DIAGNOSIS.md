# Marketplace Data Readiness + Sponsor Support E2E Dev

## 🎯 Quick Start (One Command)

```sql
-- Copy/paste this entire file into Supabase SQL Editor and click "Run"
-- File: supabase/seed_dev.sql
```

This creates:
- ✅ 2 published programs (1 HUF, 1 EUR)
- ✅ Approved localizations in HU/DE/EN for both
- ✅ 1 active sponsor support rule (5,000 Ft for HUF program)
- ✅ Test expert and sponsor users

**Result:** Marketplace will show 2 programs, HUF program has "Támogatott" badge.

---

## 🔍 Root Cause Analysis

### Why Marketplace Shows "Nem találtunk programot" (0 Results)

**Primary Issue:** Programs require **approved translations** in the current language to appear in the marketplace.

**BUSINESS POLICY:** Only approved localizations are shown. NO FALLBACK to other languages or base content. This ensures quality and consistency.

**Query Flow in `ProgramsListingPage.tsx`:**

1. **Line 247:** Fetch all published programs from `expert_contents`
   ```sql
   WHERE is_published = true
   ORDER BY is_featured DESC, created_at DESC
   ```

2. **Lines 274-279:** Fetch approved localizations for current language
   ```sql
   SELECT * FROM content_localizations
   WHERE content_id IN (...)
     AND locale = 'hu' -- or 'de', 'en'
     AND is_approved = true
   ```

3. **Line 286:** ⚠️ **CRITICAL FILTER** - Only show programs with approved translations
   ```typescript
   const localizedContents = (contentsData || []).filter(c => !!locMap[c.id]);
   ```

**Result:** Even if programs exist with `is_published=true`, they won't appear unless they have an approved translation in the current language (HU/DE/EN).

---

## 📊 Diagnostics Added

**File:** `ProgramsListingPage.tsx` (lines 288-300)

Added dev-only console logging:
```typescript
if (import.meta.env.DEV) {
  console.log('🔍 MARKETPLACE DIAGNOSTICS:');
  console.log(`  Total programs fetched: ${contentsData?.length || 0}`);
  console.log(`  Programs with approved ${language} translations: ${localizedContents.length}`);
  console.log(`  Active filters: category="${selectedCategory}", search="${searchQuery}"`);
  console.log(`  ⚠️ Programs missing approved ${language} translation:`, missingLocs);
}
```

**How to Use:**
1. Open browser DevTools (F12)
2. Navigate to `/piacer` (marketplace)
3. Check console for diagnostic output
4. You'll see exactly how many programs were fetched vs. how many passed the translation filter

---

## 🛠️ Fix: One-Command Seed Pipeline

**File:** `supabase/seed_dev.sql`

**What it does:**
- Creates 2 published programs (1 HUF, 1 EUR)
- Creates approved localizations in HU/DE/EN for both
- Creates active sponsor support rule for HUF program (5,000 Ft)
- Creates test expert and sponsor users if needed
- All in ONE execution

**Execute:**
1. Open Supabase SQL Editor
2. Copy/paste entire `supabase/seed_dev.sql` file
3. Click "Run"

**Expected Output:**
```
NOTICE: ✅ Created test expert: <uuid>
NOTICE: ✅ Created test sponsor: <uuid>
NOTICE: ✅ Created HUF program: <uuid>
NOTICE: ✅ Created EUR program: <uuid>
NOTICE: ✅ Created 6 approved localizations (HU/DE/EN for both programs)
NOTICE: ✅ Created sponsor support rule: <uuid>
NOTICE:    Support: 5,000 Ft per participant
NOTICE:    Budget: 50,000 Ft total (10 participants max)
NOTICE: 
NOTICE: ========================================
NOTICE: ✅ DEV SEED COMPLETE
NOTICE: ========================================
```

**Verification Query (included in seed file):**
```sql
SELECT 
  ec.id,
  ec.title,
  ec.currency,
  COUNT(DISTINCT cl.id) as approved_translations,
  CASE WHEN ssr.id IS NOT NULL THEN '✅ Sponsored' ELSE '❌ Not sponsored' END
FROM expert_contents ec
LEFT JOIN content_localizations cl ON ec.id = cl.content_id AND cl.is_approved = true
LEFT JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id AND ssr.status = 'active'
WHERE ec.is_published = true
GROUP BY ec.id, ec.title, ec.currency, ssr.id;
```

---

## ✅ Verification Steps

### 1. Verify Programs Appear in Marketplace

**Steps:**
1. Navigate to `/piacer` (marketplace)
2. Check browser console for diagnostics:
   ```
   🔍 MARKETPLACE DIAGNOSTICS:
     Total programs fetched: 2
     Programs with approved hu translations: 2
     Active filters: category="all", search="", creator="none"
   ```
3. Verify 2 program cards are visible:
   - "Fenntartható Kertészkedés Workshopja" (HUF)
   - "Közösségi Hatás Mérése Workshop" (EUR)

**Expected Result:** ✅ Marketplace shows 2 programs

---

### 2. Verify Sponsored Badge Appears

**Steps:**
1. Locate the HUF program card ("Fenntartható Kertészkedés")
2. Check top-left corner of card image
3. Verify pink badge with heart icon: "❤️ Támogatott"

**Expected Result:** ✅ Sponsored badge visible on HUF program card

**If badge doesn't appear:**
- Check browser console for support detection:
  ```javascript
  // Should log support data
  supportMap: {
    "<program-id>": {
      hasSupport: true,
      supportAmount: 5000,
      currency: "HUF",
      sponsorName: "Test Sponsor"
    }
  }
  ```
- Verify support rule is active in database:
  ```sql
  SELECT * FROM sponsor_support_rules WHERE status = 'active';
  ```

---

### 3. Verify Program Detail Page

**Steps:**
1. Click on the HUF program card
2. Navigate to program detail page
3. Verify pricing breakdown shows:
   ```
   Alapár: 10,000 Ft
   Támogatás: +5,000 Ft (Test Sponsor)
   Te fizetsz: 5,000 Ft
   ```

**Expected Result:** ✅ Support breakdown card visible with positive support amount

---

### 4. Test Language Switching

**Steps:**
1. Switch language to German (DE)
2. Verify marketplace still shows 2 programs
3. Verify program titles are in German:
   - "Nachhaltige Gartenarbeit Workshop"
   - "Community Impact Workshop"
4. Verify sponsored badge shows "Gesponsert"

**Expected Result:** ✅ All languages work (HU/DE/EN)

---

## 🔒 RLS Policy Check

**Tables Involved:**
- `expert_contents` - Programs table
- `content_localizations` - Translations table
- `sponsor_support_rules` - Support rules table
- `sponsorship_allocations` - Allocations table

**Required Policies:**
```sql
-- Users can SELECT published programs
CREATE POLICY "Anyone can view published programs"
ON expert_contents FOR SELECT
USING (is_published = true);

-- Users can SELECT approved localizations
CREATE POLICY "Anyone can view approved localizations"
ON content_localizations FOR SELECT
USING (is_approved = true);

-- Users can SELECT active support rules (for detection)
CREATE POLICY "Anyone can view active support rules"
ON sponsor_support_rules FOR SELECT
USING (status = 'active');
```

**Verify RLS:**
```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('expert_contents', 'content_localizations', 'sponsor_support_rules')
ORDER BY tablename, policyname;
```

---

## 📝 Summary

**Root Cause:** Programs need approved translations to appear in marketplace

**Constraints Applied:**
1. `is_published = true` (line 247)
2. `is_approved = true` on `content_localizations` (line 279)
3. Translation must exist for current language (line 286)

**Fix:** Seed data with approved localizations in all 3 languages (HU/DE/EN)

**Verification:**
- ✅ 2 programs visible in marketplace
- ✅ Sponsored badge on HUF program
- ✅ Support breakdown on detail page
- ✅ All languages work (HU/DE/EN)

**Files Modified:**
- `ProgramsListingPage.tsx` - Added diagnostics (lines 288-300)

**Files Created:**
- `supabase/seed_test_programs.sql` - Test programs with translations
- `supabase/seed_sponsor_support_rule.sql` - Active support rule
- `MARKETPLACE_DIAGNOSIS.md` - This documentation

---

## 🚀 Quick Start

```bash
# 1. Run seed scripts in Supabase SQL Editor
# Execute: supabase/seed_test_programs.sql
# Execute: supabase/seed_sponsor_support_rule.sql

# 2. Navigate to marketplace
# URL: http://localhost:5173/piacer

# 3. Check browser console for diagnostics
# Should show: "Total programs fetched: 2"

# 4. Verify sponsored badge appears on HUF program card
```

**Done!** Marketplace should now show 2 programs with 1 sponsored badge.
