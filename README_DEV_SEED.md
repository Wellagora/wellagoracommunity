# DEV Seed - One-Step Marketplace Setup

## 🎯 Cél

**100% DB-alapú marketplace fejlesztés** - Nincs mock fallback, csak valódi adatok.

Seed után:
- ✅ 2 program (1 HUF, 1 EUR)
- ✅ Approved HU/DE/EN lokalizációk mindkettőhöz
- ✅ 1 aktív sponsor support rule (HUF programhoz)
- ✅ Marketplace `/piacer` működik minden nyelven

---

## 🚀 Futtatás (1 Lépés)

### **Opció A: Supabase SQL Editor (Ajánlott)**

```bash
# 1. Nyisd meg: Supabase Dashboard → SQL Editor
# 2. Másold be: supabase/seed_dev.sql (TELJES fájl)
# 3. Klikk: "Run" vagy Cmd+Enter
# 4. Ellenőrizd: "✅ DEV SEED COMPLETE" üzenet
```

**Output:**
```
🧹 CLEANUP: Removing existing DEV seed data
✅ Cleanup complete

🌱 SEED: Creating fresh DEV data
✅ Test creator: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
✅ Test sponsor: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
✅ HUF program: cccccccc-cccc-cccc-cccc-cccccccccccc
✅ EUR program: dddddddd-dddd-dddd-dddd-dddddddddddd
✅ 6 approved localizations (HU/DE/EN)
✅ Sponsor support rule: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
   Support: 5,000 Ft/participant
   Budget: 50,000 Ft (10 max)

========================================
✅ DEV SEED COMPLETE
========================================
🚀 Next: Navigate to /piacer
   Expected: 2 programs, HUF has "Támogatott" badge
========================================
```

---

### **Opció B: Supabase CLI (Ha konfigurálva van)**

```bash
# Ha van supabase CLI és migrations mappád:
supabase db reset

# Ez automatikusan futtatja:
# - migrations (schema)
# - seed (test data)
```

---

## ✅ Ellenőrzés

### **1. Gyors Számok**

Futtasd a Supabase SQL Editor-ban:

```sql
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
```

**Elvárt:**
| check_type | count | status |
|------------|-------|--------|
| Published Programs | 2 | ✅ |
| Approved Localizations (HU) | 2 | ✅ |
| Approved Localizations (DE) | 2 | ✅ |
| Approved Localizations (EN) | 2 | ✅ |
| Active Support Rules | 1 | ✅ |

---

### **2. Marketplace Ellenőrzés**

1. **Navigálj:** `/piacer` (marketplace)
2. **Hard refresh:** Cmd+Shift+R (Mac) vagy Ctrl+Shift+R (Windows)
3. **Ellenőrizd:**
   - ✅ 2 program kártya látszik
   - ✅ HUF program: **"Támogatott"** badge (pink, szív ikon)
   - ✅ EUR program: nincs badge

4. **Nyelvváltás:**
   - HU: "Fenntartható Kertészkedés Workshopja" + "Közösségi Hatás Mérése Workshop"
   - DE: "Nachhaltige Gartenarbeit Workshop" + "Community Impact Workshop"
   - EN: "Sustainable Gardening Workshop" + "Community Impact Workshop"

5. **Program Detail (HUF):**
   - Klikk a HUF program kártyára
   - Ellenőrizd a jobb oldali pricing card-ot:
     ```
     Alapár: 10,000 Ft
     Támogatás: +5,000 Ft (Dev Sponsor)  ← POZITÍV!
     Te fizetsz: 5,000 Ft
     ```

---

## 🔄 Idempotencia

**Biztonságos többszöri futtatás:**
- ✅ Fix UUID-k (nem generál újakat)
- ✅ `ON CONFLICT DO UPDATE` (nem duplikál)
- ✅ Cleanup első lépésben (törli a régi dev adatokat)

**Újrafuttatás:**
Bármikor futtathatod újra a `seed_dev.sql`-t. Mindig ugyanazokat az ID-kat használja:
- Creator: `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`
- Sponsor: `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb`
- HUF Program: `cccccccc-cccc-cccc-cccc-cccccccccccc`
- EUR Program: `dddddddd-dddd-dddd-dddd-dddddddddddd`
- Support Rule: `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee`

---

## 🔧 DEV Helper UI

Ha a marketplace üres (`/piacer` 0 program):

**DEV módban automatikusan megjelenik egy helper:**

### **Ha fetched = 0:**
```
❌ Nincs program a DB-ben (0 published)
A marketplace kizárólag DB-ből dolgozik. Nincs mock fallback.
```

### **Ha fetched > 0, de approved = 0:**
```
⚠️ Van X program, de nincs approved localization a {nyelv} nyelven
BUSINESS POLICY: Csak approved content jelenhet meg. Nincs fallback más nyelvre.
```

**Helper tartalmaz:**
- 📊 Diagnosztika: Fetched / Approved / After filters
- ✅ 5 lépéses megoldás (Supabase SQL Editor → seed_dev.sql → Run)

**Production:** Helper NEM jelenik meg (`import.meta.env.DEV` check)

---

## 📋 Business Policy

**Marketplace listázás:**
- ✅ Csak `is_published = true` programok
- ✅ Csak `is_approved = true` lokalizációk
- ❌ NINCS fallback más nyelvre
- ❌ NINCS mock data fallback

**Program Detail:**
- ✅ Ugyanaz a policy
- ✅ Ha nincs approved lokalizáció → `GracefulPlaceholder`
- ❌ NINCS kevert nyelv

**Sponsor Support:**
- ✅ Támogatás mindig pozitív: "+5,000 Ft (Sponsor)"
- ✅ Currency matching: support currency = program currency
- ✅ Badge csak aktív support esetén

---

## 🐛 Hibaelhárítás

### **Továbbra is 0 program látszik**

**1. Console ellenőrzés (F12):**
```
🔍 MARKETPLACE DIAGNOSTICS:
  Total programs fetched: 0  ← Ha 0, akkor RLS vagy seed probléma
  Programs with approved en translations: 0
```

**2. RLS Policy ellenőrzés:**
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('expert_contents', 'content_localizations')
ORDER BY tablename;
```

**Elvárt:** Legalább 1 SELECT policy mindkét táblán.

**3. Seed újrafuttatás:**
```sql
-- Töröld a dev adatokat manuálisan:
DELETE FROM sponsorship_allocations WHERE support_rule_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DELETE FROM sponsor_support_rules WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
DELETE FROM content_localizations WHERE content_id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
DELETE FROM expert_contents WHERE id IN ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd');
DELETE FROM profiles WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Futtasd újra a seed_dev.sql-t
```

---

## 📚 Kapcsolódó Fájlok

- **Seed script:** `supabase/seed_dev.sql`
- **Marketplace:** `src/pages/ProgramsListingPage.tsx`
- **Program Detail:** `src/pages/ProgramDetailPage.tsx`
- **Support Breakdown:** `src/components/sponsor/SupportBreakdownCard.tsx`
- **E2E Checklist:** `SPONSOR_SUPPORT_E2E_CHECKLIST.md`
- **Diagnosis:** `MARKETPLACE_DIAGNOSIS.md`

---

## ✅ Sikerkritériumok

- [ ] `seed_dev.sql` futtatása után 2 program látszik `/piacer`-en
- [ ] Nyelvváltás HU/DE/EN működik (mindhárom nyelven 2 program)
- [ ] HUF program: "Támogatott" badge látszik
- [ ] HUF program detail: pozitív támogatás breakdown (+5,000 Ft)
- [ ] EUR program: nincs badge (nincs support rule)
- [ ] DEV helper csak DEV módban jelenik meg
- [ ] Production: nincs mock fallback, csak DB adatok

---

**Ha minden ✅ → Marketplace DEV környezet kész! 🎉**
