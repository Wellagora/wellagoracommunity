# Seed Dev Data - Pontos Lépések

## 🎯 Cél
2 program megjelenítése a Piactéren + 1 sponsor support rule

## 📋 Lépések

### 1. Nyisd meg a Supabase Dashboard-ot
- URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
- Vagy a helyi Supabase Studio: http://localhost:54323

### 2. Navigálj a SQL Editor-hoz
- Bal oldali menü: **SQL Editor**
- Vagy: **Database** → **SQL Editor**

### 3. Nyisd meg a seed_dev.sql fájlt
- Fájl helye: `supabase/seed_dev.sql`
- Nyisd meg a fájlt VS Code-ban vagy bármilyen szövegszerkesztőben

### 4. Másold ki az EGÉSZ fájl tartalmát
- Cmd+A (Mac) vagy Ctrl+A (Windows) → Cmd+C vagy Ctrl+C
- Vagy: kattints a fájlra az alábbiakban és másold ki

### 5. Illeszd be a Supabase SQL Editor-ba
- Kattints a SQL Editor-ba
- Cmd+V (Mac) vagy Ctrl+V (Windows)
- Ellenőrizd, hogy az egész script benne van (kb. 300 sor)

### 6. Futtasd a script-et
- Kattints a **"Run"** gombra (jobb felső sarok)
- Vagy: Cmd+Enter (Mac) / Ctrl+Enter (Windows)

### 7. Ellenőrizd az output-ot
Látnod kell:
```
NOTICE: ✅ Created test expert: <uuid>
NOTICE: ✅ Created test sponsor: <uuid>
NOTICE: ✅ Created HUF program: <uuid>
NOTICE: ✅ Created EUR program: <uuid>
NOTICE: ✅ Created 6 approved localizations
NOTICE: ✅ Created sponsor support rule: <uuid>
NOTICE: ========================================
NOTICE: ✅ DEV SEED COMPLETE
NOTICE: ========================================
```

### 8. Futtasd a verification query-t
A seed script végén van egy SELECT query. Futtasd le külön:

```sql
SELECT 
  ec.id,
  ec.title,
  ec.currency,
  ec.price_huf,
  ec.price_eur,
  ec.is_published,
  ec.is_featured,
  COUNT(DISTINCT cl.id) as approved_translations,
  CASE WHEN ssr.id IS NOT NULL THEN '✅ Sponsored' ELSE '❌ Not sponsored' END as sponsor_status
FROM expert_contents ec
LEFT JOIN content_localizations cl ON ec.id = cl.content_id AND cl.is_approved = true
LEFT JOIN sponsor_support_rules ssr ON ssr.scope_id = ec.id AND ssr.status = 'active'
WHERE ec.is_published = true
GROUP BY ec.id, ec.title, ec.currency, ec.price_huf, ec.price_eur, ec.is_published, ec.is_featured, ssr.id
ORDER BY ec.created_at DESC
LIMIT 5;
```

**Elvárt eredmény:**
| title | currency | approved_translations | sponsor_status |
|-------|----------|----------------------|----------------|
| Fenntartható Kertészkedés... | HUF | 3 | ✅ Sponsored |
| Community Impact Workshop | EUR | 3 | ❌ Not sponsored |

### 9. Frissítsd a Piactér oldalt
- Menj vissza a böngészőbe
- Hard refresh: **Cmd+Shift+R** (Mac) vagy **Ctrl+Shift+R** (Windows)
- Vagy: F5

### 10. Ellenőrizd az eredményt
- ✅ 2 program látszik
- ✅ HUF program: "Támogatott" badge
- ✅ EUR program: nincs badge
- ✅ DEV helper eltűnt (mert már van program)

---

## ⚠️ Hibaelhárítás

### Ha továbbra is 0 program látszik:

**1. Ellenőrizd a console-t (F12)**
```
🔍 MARKETPLACE DIAGNOSTICS:
  Total programs fetched: 2  ← Ha ez 0, akkor RLS probléma
  Programs with approved en translations: 2  ← Ha ez 0, akkor lokalizáció hiányzik
```

**2. Ellenőrizd az RLS policy-kat**
```sql
-- Futtasd le a Supabase SQL Editor-ban:
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('expert_contents', 'content_localizations')
ORDER BY tablename, policyname;
```

**Elvárt:** Legalább 1 policy `expert_contents`-re és 1 `content_localizations`-re SELECT-tel.

**3. Ellenőrizd, hogy a seed lefutott-e**
```sql
SELECT COUNT(*) FROM expert_contents WHERE is_published = true;
-- Elvárt: 2

SELECT COUNT(*) FROM content_localizations WHERE is_approved = true;
-- Elvárt: 6 (2 program × 3 nyelv)

SELECT COUNT(*) FROM sponsor_support_rules WHERE status = 'active';
-- Elvárt: 1
```

**4. Ha semmi sem működik:**
- Töröld a test adatokat:
```sql
DELETE FROM sponsorship_allocations WHERE sponsor_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@wellagora.local'
);
DELETE FROM sponsor_support_rules WHERE sponsor_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@wellagora.local'
);
DELETE FROM content_localizations WHERE content_id IN (
  SELECT id FROM expert_contents WHERE creator_id IN (
    SELECT id FROM profiles WHERE email LIKE '%@wellagora.local'
  )
);
DELETE FROM expert_contents WHERE creator_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@wellagora.local'
);
DELETE FROM profiles WHERE email LIKE '%@wellagora.local';
```

- Futtasd újra a `seed_dev.sql`-t

---

## ✅ Sikeres Seed Után

**Marketplace:**
- 2 program kártya
- HUF program: pink "Támogatott" badge

**Program Detail (HUF):**
- Alapár: 10,000 Ft
- Támogatás: +5,000 Ft (Test Sponsor)
- Te fizetsz: 5,000 Ft

**Nyelvváltás (HU/DE/EN):**
- Mindhárom nyelven működik
- Badge szövege változik: Támogatott / Gesponsert / Sponsored

---

## 📞 Ha Segítség Kell

1. Screenshot a Supabase SQL Editor output-ról
2. Screenshot a browser console-ról (F12)
3. Futtasd le a verification query-t és küldd el az eredményt
