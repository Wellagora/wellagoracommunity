# Sponsor Support Mechanism - Manual Test Checklist

## Test Environment Setup

### Prerequisites
1. Database migration applied: `20250129130200_sponsor_support_mechanism.sql`
2. At least 2 test programs created:
   - Program A: HUF currency (e.g., 10,000 Ft)
   - Program B: EUR currency (e.g., €50)
3. Test sponsor user with role: `business`, `government`, `ngo`, or `sponsor`

---

## A) Program Detail Page Integration Tests

### Test 1: HUF Program WITH Sponsor Support (Hungarian)
**Setup:**
1. Create sponsor support rule via `/sponsor-dashboard/support`:
   - Scope: Program A (HUF program)
   - Amount: 5,000 Ft per participant
   - Budget: 50,000 Ft
   - Status: Active

**Test Steps:**
1. Switch language to Hungarian (HU)
2. Navigate to Program A detail page
3. Verify pricing breakdown displays:
   - ✅ "Alapár: 10,000 Ft"
   - ✅ "Támogatás: +5,000 Ft (Sponsor Name)" ← **Must be positive with +**
   - ✅ "Te fizetsz: 5,000 Ft"
4. Verify currency is HUF throughout
5. Verify no old sponsor UI elements visible (no strikethrough, no "INGYENES" badge)
6. Check mobile view: breakdown stacks nicely, no overflow

**Expected Result:** ✅ Support shown as positive amount, user pays correctly calculated

---

### Test 2: EUR Program WITH Sponsor Support (German)
**Setup:**
1. Create sponsor support rule:
   - Scope: Program B (EUR program)
   - Amount: €20 per participant
   - Budget: €200
   - Status: Active

**Test Steps:**
1. Switch language to German (DE)
2. Navigate to Program B detail page
3. Verify pricing breakdown displays:
   - ✅ "Grundpreis: €50.00"
   - ✅ "Unterstützung: +€20.00 (Sponsor Name)" ← **Must be positive with +**
   - ✅ "Mitglied zahlt: €30.00"
4. Verify currency is EUR throughout
5. Verify German i18n keys work (no raw keys visible)

**Expected Result:** ✅ Support shown in EUR, all text in German

---

### Test 3: HUF Program WITHOUT Sponsor Support (English)
**Setup:**
1. Ensure no active support rule for Program A
2. Or create a rule but set status to "paused" or "ended"

**Test Steps:**
1. Switch language to English (EN)
2. Navigate to Program A detail page
3. Verify pricing display shows:
   - ✅ Only base price: "10,000 Ft" (or equivalent in EUR if converted)
   - ✅ NO support breakdown card visible
   - ✅ NO empty sponsor section
4. Verify page does not crash
5. Verify CTA button still works

**Expected Result:** ✅ Clean price display, no sponsor UI, page functional

---

### Test 4: Currency Mismatch Protection
**Setup:**
1. Create support rule for Program A (HUF) with EUR currency (intentionally wrong)

**Test Steps:**
1. Navigate to Program A detail page
2. Verify:
   - ✅ Support breakdown does NOT appear (currency mismatch)
   - ✅ Only base price shown
   - ✅ No error messages visible to user
   - ✅ Page does not crash

**Expected Result:** ✅ System gracefully ignores mismatched currency support

---

### Test 5: RLS / Query Failure Resilience
**Setup:**
1. Temporarily break RLS or support query (e.g., invalid sponsor_id)

**Test Steps:**
1. Navigate to any program detail page
2. Verify:
   - ✅ Page loads successfully
   - ✅ No crash or white screen
   - ✅ Base price shown
   - ✅ No support breakdown (graceful degradation)
   - ✅ Console may show error but user sees working page

**Expected Result:** ✅ Crash-proof, shows base price only

---

### Test 6: Full Support (User Pays Zero)
**Setup:**
1. Create support rule:
   - Scope: Program A (10,000 Ft)
   - Amount: 10,000 Ft (100% support)

**Test Steps:**
1. Navigate to Program A detail page
2. Verify pricing breakdown:
   - ✅ "Alapár: 10,000 Ft"
   - ✅ "Támogatás: +10,000 Ft (Sponsor)"
   - ✅ "Te fizetsz: 0 Ft" ← **Must be 0, never negative**

**Expected Result:** ✅ User pays shows 0 Ft, not negative

---

### Test 7: Mobile Responsiveness
**Test Steps:**
1. Open Program detail page with sponsor support on mobile (or resize browser to 375px width)
2. Verify:
   - ✅ Breakdown card stacks vertically
   - ✅ All text readable (no overflow)
   - ✅ Sponsor name doesn't break layout
   - ✅ CTA button accessible

**Expected Result:** ✅ Mobile-friendly layout

---

## B) Sponsor Dashboard Tests

### Test 8: Create Support Rule via Wizard
**Test Steps:**
1. Login as sponsor user
2. Navigate to `/sponsor-dashboard/support`
3. Click "Új támogatás" (New Support)
4. Complete 3-step wizard:
   - Step 1: Select Program A
   - Step 2: Set amount 5,000 Ft
   - Step 3: Set budget 50,000 Ft
5. Submit
6. Verify:
   - ✅ Success toast appears
   - ✅ New rule appears in "Active Supports" list
   - ✅ Rule shows correct amount and budget

**Expected Result:** ✅ Rule created in <60 seconds

---

### Test 9: Pause/Resume Support Rule
**Test Steps:**
1. From sponsor dashboard, find active support rule
2. Click "Pause" button
3. Verify rule moves to "Paused" section
4. Navigate to program detail page
5. Verify support breakdown NO LONGER appears
6. Return to dashboard, click "Resume"
7. Verify rule returns to "Active" section
8. Check program detail page again
9. Verify support breakdown reappears

**Expected Result:** ✅ Pause/resume works, affects user-facing display immediately

---

## C) Multi-Language Tests

### Test 10: Language Switching
**Test Steps:**
1. Open program detail page with support (HU language)
2. Verify Hungarian labels: "Alapár", "Támogatás", "Te fizetsz"
3. Switch to German (DE)
4. Verify German labels: "Grundpreis", "Unterstützung", "Mitglied zahlt"
5. Switch to English (EN)
6. Verify English labels: "Base price", "Support", "User pays"
7. Verify sponsor name remains consistent across languages

**Expected Result:** ✅ All i18n keys work, no raw keys visible

---

## D) Edge Cases

### Test 11: Multiple Eligible Rules (Highest Support Wins)
**Setup:**
1. Create 2 support rules for same program:
   - Rule 1: 3,000 Ft support
   - Rule 2: 7,000 Ft support (higher)

**Test Steps:**
1. Navigate to program detail page
2. Verify breakdown shows:
   - ✅ Support: +7,000 Ft (highest amount)
   - ✅ Only one breakdown card visible

**Expected Result:** ✅ System picks best support for user

---

### Test 12: Budget Exhausted
**Setup:**
1. Create support rule with small budget (e.g., 10,000 Ft total, 5,000 Ft per participant)
2. Manually update `budget_spent` to equal `budget_total` in database

**Test Steps:**
1. Navigate to program detail page
2. Verify:
   - ✅ NO support breakdown appears (budget exhausted)
   - ✅ Only base price shown
   - ✅ Page functional

**Expected Result:** ✅ Exhausted budget = no support shown

---

## Summary Checklist

- [ ] HUF program with support shows positive amount in HU/DE/EN
- [ ] EUR program with support shows positive amount in HU/DE/EN
- [ ] Programs without support show only base price
- [ ] Currency mismatch protection works
- [ ] RLS/query failures don't crash page
- [ ] Full support (100%) shows user pays 0, not negative
- [ ] Mobile responsive
- [ ] Sponsor wizard creates rules in <60 seconds
- [ ] Pause/resume affects user-facing display
- [ ] All i18n keys work (no raw keys)
- [ ] Multiple rules: highest support wins
- [ ] Budget exhausted = no support shown

---

## Known Limitations (Out of Scope)
- Marketplace listing badges (not yet implemented)
- Join/checkout allocation flow (not yet implemented)
- My Agora sponsored participations (not yet implemented)
- Percentage-based support (MVP is fixed amount only)
- FX conversion (support must match program currency)
