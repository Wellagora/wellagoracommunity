# Sponsor Support E2E Verification Checklist

## Prerequisites
✅ Run `supabase/seed_dev.sql` in Supabase SQL Editor  
✅ Verify 2 programs created with approved localizations  
✅ Verify 1 active sponsor support rule created for HUF program  

---

## 6-Step E2E Verification (HU/DE/EN)

### **Step 1: Marketplace - Hungarian (HU)**

**Actions:**
1. Navigate to `/piacer` (marketplace)
2. Ensure language is set to **Hungarian (HU)**
3. Locate the program card: **"Fenntartható Kertészkedés Workshopja"**

**Expected Results:**
- ✅ 2 program cards visible
- ✅ HUF program has **pink "Támogatott" badge** with heart icon in top-left corner
- ✅ EUR program has NO sponsored badge (no support rule)
- ✅ Badge text: "❤️ Támogatott"

**Screenshot Location:** Top-left corner of HUF program card image

---

### **Step 2: Program Detail - Hungarian (HU)**

**Actions:**
1. Click on **"Fenntartható Kertészkedés Workshopja"** card
2. Navigate to program detail page
3. Scroll to pricing section (right sidebar)

**Expected Results:**
- ✅ **SupportBreakdownCard** visible with 3 lines:
  ```
  Alapár: 10,000 Ft
  Támogatás: +5,000 Ft (Test Sponsor)  ← MUST be positive with +
  Te fizetsz: 5,000 Ft
  ```
- ✅ Support amount shown as **positive** (green color)
- ✅ Sponsor name displayed: "Test Sponsor"
- ✅ User pays correctly calculated: 10,000 - 5,000 = 5,000 Ft

**Screenshot Location:** Right sidebar pricing card

---

### **Step 3: Language Switch - German (DE)**

**Actions:**
1. Switch language to **German (DE)** (language selector in header)
2. Return to marketplace `/piacer`
3. Locate the program card (now in German)

**Expected Results:**
- ✅ 2 program cards still visible
- ✅ HUF program title: **"Nachhaltige Gartenarbeit Workshop"**
- ✅ Sponsored badge text: **"Gesponsert"** (German)
- ✅ Badge still visible with heart icon

**Screenshot Location:** Marketplace card with German title + badge

---

### **Step 4: Program Detail - German (DE)**

**Actions:**
1. Click on **"Nachhaltige Gartenarbeit Workshop"** card
2. Navigate to program detail page
3. Check pricing breakdown

**Expected Results:**
- ✅ **SupportBreakdownCard** visible with German labels:
  ```
  Grundpreis: 10,000 Ft
  Unterstützung: +5,000 Ft (Test Sponsor)  ← Positive
  Mitglied zahlt: 5,000 Ft
  ```
- ✅ All text in German
- ✅ Support amount still positive with +
- ✅ Currency remains HUF (no conversion)

**Screenshot Location:** Right sidebar pricing card (German)

---

### **Step 5: Language Switch - English (EN)**

**Actions:**
1. Switch language to **English (EN)**
2. Return to marketplace `/piacer`
3. Locate the program card (now in English)

**Expected Results:**
- ✅ 2 program cards still visible
- ✅ HUF program title: **"Sustainable Gardening Workshop"**
- ✅ Sponsored badge text: **"Sponsored"** (English)
- ✅ Badge still visible with heart icon

**Screenshot Location:** Marketplace card with English title + badge

---

### **Step 6: Program Detail - English (EN)**

**Actions:**
1. Click on **"Sustainable Gardening Workshop"** card
2. Navigate to program detail page
3. Check pricing breakdown

**Expected Results:**
- ✅ **SupportBreakdownCard** visible with English labels:
  ```
  Base price: 10,000 Ft
  Support: +5,000 Ft (Test Sponsor)  ← Positive
  User pays: 5,000 Ft
  ```
- ✅ All text in English
- ✅ Support amount still positive with +
- ✅ Currency remains HUF (no conversion)

**Screenshot Location:** Right sidebar pricing card (English)

---

## Verification Summary

| Step | Component | Language | Expected | Status |
|------|-----------|----------|----------|--------|
| 1 | Marketplace Badge | HU | "Támogatott" visible | ⬜ |
| 2 | Detail Breakdown | HU | "+5,000 Ft" positive | ⬜ |
| 3 | Marketplace Badge | DE | "Gesponsert" visible | ⬜ |
| 4 | Detail Breakdown | DE | "+5,000 Ft" positive | ⬜ |
| 5 | Marketplace Badge | EN | "Sponsored" visible | ⬜ |
| 6 | Detail Breakdown | EN | "+5,000 Ft" positive | ⬜ |

---

## Common Issues & Fixes

### ❌ Badge Not Appearing

**Possible Causes:**
1. Support rule not active
2. Currency mismatch (rule is EUR but program is HUF)
3. Budget exhausted

**Debug:**
```sql
-- Check active support rules
SELECT * FROM sponsor_support_rules WHERE status = 'active';

-- Verify currency matches
SELECT ec.id, ec.currency, ssr.currency 
FROM expert_contents ec
JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id
WHERE ssr.status = 'active';
```

**Fix:**
- Re-run `supabase/seed_dev.sql`
- Verify rule status is 'active'
- Check browser console for support detection errors

---

### ❌ Breakdown Not Showing

**Possible Causes:**
1. `useProgramSupport` hook not detecting support
2. Currency mismatch
3. Query error (check console)

**Debug:**
- Open browser DevTools
- Check console for support detection logs
- Verify `supportBreakdown` is not null

**Fix:**
- Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)
- Check network tab for failed queries
- Verify RLS policies allow SELECT on `sponsor_support_rules`

---

### ❌ Negative Support Amount

**This should NEVER happen.** If you see negative support:
1. Check `SupportBreakdownCard` component
2. Verify `calculateSupportBreakdown` returns positive `support_amount`
3. File a bug - this violates business rules

---

## Console Diagnostics

**Expected Console Output (DEV mode):**

```
🔍 MARKETPLACE DIAGNOSTICS:
  Total programs fetched: 2
  Programs with approved hu translations: 2
  Active filters: category="all", search="", creator="none"
```

**Support Detection:**
```javascript
supportMap: {
  "<huf-program-id>": {
    hasSupport: true,
    supportAmount: 5000,
    currency: "HUF",
    sponsorName: "Test Sponsor"
  },
  "<eur-program-id>": {
    hasSupport: false
  }
}
```

---

## Next Steps (Out of Scope)

After E2E verification passes:
1. ✅ Marketplace badge - DONE
2. ✅ Program detail breakdown - DONE
3. ⏳ Join/checkout allocation flow (reserve/capture/release)
4. ⏳ My Agora sponsored participations list

---

## Success Criteria

✅ All 6 steps pass in HU/DE/EN  
✅ Badge appears consistently on marketplace  
✅ Breakdown shows positive support amount  
✅ No crashes or errors in console  
✅ Currency remains consistent (no conversion)  
✅ Sponsor name displayed correctly  

**If all checks pass:** Sponsor Support Mechanism 1.0 integration is complete for marketplace + detail pages! 🎉
