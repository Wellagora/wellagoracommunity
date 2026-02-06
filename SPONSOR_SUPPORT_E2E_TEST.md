# Sponsor Support End-to-End Test Guide

## Prerequisites

1. **Database Setup**
   ```bash
   # Run the migration to create tables
   psql -h <supabase-host> -U postgres -d postgres -f supabase/migrations/20250129130200_sponsor_support_mechanism.sql
   
   # Seed DEV programs with support rule
   psql -h <supabase-host> -U postgres -d postgres -f supabase/2_seed_dev_programs.sql
   ```

2. **Test Users** (create in Supabase Dashboard → Authentication → Users)
   - `user1@wellagora.dev` - Member (regular user)
   - `user2@wellagora.dev` - Expert (creator)
   - `user3@wellagora.dev` - Sponsor

3. **Expected Data After Seed**
   - Program A: "[DEV] Támogatott Workshop" - 10,000 Ft (supported)
   - Program B: "[DEV] Közösségi Hatásmérés" - 20,000 Ft (not supported)
   - Program C: "[DEV] Ingyenes Beszélgetés" - 0 Ft (free)
   - 1 active sponsor support rule: 5,000 Ft per participant for Program A

---

## Test Scenario 1: MEMBER Flow

**Login as:** `user1@wellagora.dev`

### Step 1: View Marketplace
1. Navigate to `/programs` (Marketplace)
2. **Verify:**
   - ✅ 3 programs visible with distinct images
   - ✅ Program A shows:
     - Title: "Támogatott Workshop" (no [DEV] prefix)
     - Badge: "NÉPSZERŰ" (featured)
     - Badge: "TÁMOGATOTT" (green, no heart icon)
     - Price breakdown:
       - **Fizetendő: 5,000 Ft** (large, green)
       - Alapár: 10,000 Ft (small)
       - Támogatás: −5,000 Ft (Sponsor name)
   - ✅ Program B shows:
     - Title: "Közösségi Hatásmérés"
     - Price: **Fizetendő: 20,000 Ft**
   - ✅ Program C shows:
     - Title: "Ingyenes Beszélgetés"
     - Badge: "INGYENES" (green)
     - Price: **Ingyenes**

### Step 2: Open Supported Program
1. Click on Program A card
2. **Verify on detail page:**
   - ✅ Title: "Támogatott Workshop" (clean, no [DEV])
   - ✅ Price breakdown visible:
     - Fizetendő: 5,000 Ft
     - Alapár: 10,000 Ft
     - Támogatás: −5,000 Ft
   - ✅ Sponsor info displayed with logo/name

### Step 3: Join/Enroll in Program
1. Click "Join" or "Enroll" button
2. **Expected behavior:**
   - Allocation is **reserved** (status: 'reserved')
   - User proceeds to checkout/confirmation
3. Complete enrollment (payment/confirmation)
4. **Expected behavior:**
   - Allocation is **captured** (status: 'captured')
   - Budget spent incremented by 5,000 Ft

### Step 4: View My Agora
1. Navigate to `/my-agora` or Member Dashboard
2. **Verify "Sponsored Access" section shows:**
   - ✅ Program: "Támogatott Workshop"
   - ✅ Sponsor name/logo
   - ✅ Support amount: 5,000 Ft
   - ✅ Fizetendő: 5,000 Ft
   - ✅ Status: "Captured" or "Active"

---

## Test Scenario 2: SPONSOR Flow

**Login as:** `user3@wellagora.dev`

### Step 1: View Sponsor Dashboard
1. Navigate to `/sponsor-hub` or Sponsor Dashboard
2. **Verify "Active Support Rules" section shows:**
   - ✅ Rule for Program A
   - ✅ Budget: 50,000 Ft total
   - ✅ Budget spent: 5,000 Ft (after member joined)
   - ✅ Budget remaining: 45,000 Ft
   - ✅ Participants: 1

### Step 2: View Allocations List
1. In Sponsor Dashboard, find "Allocations" or "Participants" section
2. **Verify allocations table shows:**
   - ✅ Member: user1@wellagora.dev (or name if available)
   - ✅ Program: "Támogatott Workshop"
   - ✅ Amount: 5,000 Ft
   - ✅ Status: "Captured"
   - ✅ Date: enrollment timestamp

### Step 3: Filter Allocations
1. Select rule filter: Program A rule
2. Select status filter: "Captured"
3. **Verify:**
   - ✅ Only captured allocations for Program A shown
   - ✅ Count matches expected (1)

---

## Test Scenario 3: EXPERT Flow

**Login as:** `user2@wellagora.dev`

### Step 1: View Expert Studio
1. Navigate to `/expert-studio` or Expert Dashboard
2. Find "My Programs" section
3. **Verify Program A shows:**
   - ✅ Title: "Támogatott Workshop"
   - ✅ Sponsor indicator: "Sponsored by [Sponsor Name]"
   - ✅ Participants count: 1

### Step 2: View Program Participants
1. Click on Program A to view details/participants
2. **Verify participants list shows:**
   - ✅ Member: user1@wellagora.dev (or name)
   - ✅ Tag: "Sponsored" or "Sponsored by [Sponsor Name]"
   - ✅ Amount: 5,000 Ft support

### Step 3: Verify Non-Supported Program
1. View Program B (not supported)
2. **Verify:**
   - ✅ No sponsor indicator
   - ✅ Participants (if any) show no "Sponsored" tag

---

## Test Scenario 4: Cancellation Flow

**Login as:** `user1@wellagora.dev` (new session or different program)

### Step 1: Reserve and Cancel
1. Navigate to a supported program
2. Click "Join" → allocation **reserved**
3. Cancel before completing enrollment
4. **Expected behavior:**
   - Allocation status → **released**
   - Budget freed up (budget_spent decremented)

### Step 2: Verify Budget Released
**Login as:** `user3@wellagora.dev`
1. Check Sponsor Dashboard
2. **Verify:**
   - ✅ Budget spent reflects the release (decreased)
   - ✅ Allocation shows status: "Released"

---

## Acceptance Checklist

### Database
- [ ] `sponsor_support_rules` table exists
- [ ] `sponsorship_allocations` table exists
- [ ] Seed creates 3 programs + 1 support rule
- [ ] Foreign keys reference `expert_contents` (not `programs`)

### Member View
- [ ] Marketplace shows clean titles (no [DEV])
- [ ] Supported programs show price breakdown
- [ ] Join button reserves allocation
- [ ] Completion captures allocation
- [ ] My Agora shows sponsored participations

### Sponsor View
- [ ] Dashboard shows active rules + budgets
- [ ] Allocations list shows all participants
- [ ] Budget spent updates correctly
- [ ] Filters work (rule, status)

### Expert View
- [ ] Program list shows sponsor indicator
- [ ] Participants list shows "Sponsored" tag
- [ ] Sponsor name/logo visible

### Technical
- [ ] No console errors
- [ ] No React hooks errors
- [ ] No "language not available" placeholders
- [ ] Idempotent: same user+program can't create duplicate allocations
- [ ] Budget trigger updates correctly on allocation status changes

---

## Troubleshooting

### Issue: Allocation not created
- Check browser console for errors
- Verify user is authenticated
- Check if support rule is active and has budget
- Verify RLS policies allow user to insert

### Issue: Budget not updating
- Check database trigger: `trigger_update_support_rule_budget`
- Verify allocation status is 'reserved' or 'captured'
- Check `sponsor_support_rules.budget_spent` directly in DB

### Issue: "Language not available"
- Verify seed script populated `title`, `title_en`, `title_de` fields
- Check `expert_contents` table has localized content
- Ensure no references to old `content_localizations` table

### Issue: RLS blocking queries
- Verify user roles in `profiles` table
- Check RLS policies on both tables
- Test with `auth.uid()` matching user_id/sponsor_id
