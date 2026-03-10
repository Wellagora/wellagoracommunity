# WellAgora Platform — Teljes Audit Jelentés
**Dátum:** 2026-03-10
**Verzió:** 1.0

---

## Összefoglaló

A teljes platform audit 6 területet vizsgált: Expert Studio, Szponzor rendszer, Közösség/Események, Gamifikáció/WellPoints, Admin felület, és Lokalizáció/DB séma. Az alábbiakban a talált problémák **prioritás** szerint rendezve.

---

## P0 — KRITIKUS (az alkalmazás összeomlik vagy adatvesztés)

### 1. CommunityFeed — hiányzó DB táblák
- **Fájl:** `src/components/community/CommunityFeed.tsx`
- **Probléma:** A komponens `community_posts`, `community_post_likes`, `community_post_comments` táblákat query-z, de ezek **NEM léteznek** a `types.ts`-ben és valószínűleg a Supabase-ben sem
- **Hatás:** A közösségi feed oldal CRASHEL, ha bárki megnyitja
- **Javítás:** Vagy létre kell hozni a táblákat Supabase-ben, vagy a komponenst ki kell kapcsolni / placeholder-re cserélni

### 2. access_level vs access_type kettős rendszer
- **Fájl:** `ProgramCreatorWizard.tsx`, RPC-k, `ProgramDetailPage.tsx`
- **Probléma:** A wizard `access_type`-ot ír (sponsor_only / purchasable), de az RPC-k `access_level`-t olvasnak (free / paid / premium / sponsored)
- **Hatás:** A programok hozzáférési szintje nem jelenik meg helyesen; vásárlás/szponzorálás nem működik konzisztensen
- **Javítás:** Egységesíteni az egyik mezőre, és mindenhol frissíteni

---

## P1 — MAGAS (funkció nem működik, de nem crash)

### 3. Blob URL-ek a content_url mezőben
- **Probléma:** Amikor a Supabase Storage upload csendben meghiúsul, a böngésző blob: URL kerül a DB-be
- **Hatás:** Videók nem játszhatók le a program detail oldalon
- **Javítás szükséges (SQL):**
  ```sql
  UPDATE expert_contents SET content_url = NULL WHERE content_url LIKE 'blob:%';
  ```

### 4. problem_solution JSON overloading
- **Fájl:** `ProgramCreatorWizard.tsx`
- **Probléma:** Az `event_date`, `event_time`, `location_address` a `problem_solution` JSONB mezőben van tárolva, mert nincs dedikált oszlop
- **Hatás:** Törékeny adattárolás — ha valaki felülírja a problem/solution szöveget, az event metadata elveszik
- **Javítás:** Dedikált oszlopok létrehozása az `expert_contents` táblában, vagy legalább a JSON struktúra validálása

### 5. Locale fájlok — 494+ hiányzó fordítási kulcs
- **Fájlok:** `src/i18n/locales/hu.json`, `en.json`, `de.json`
- **Hiányzó namespace-ek:**
  - `gamification.*` — ~73 kulcs
  - `handprint.*` — ~82 kulcs
  - `terms.*` — ~57 kulcs
  - `admin.*` — ~99 kulcs
  - Egyéb szétszórt kulcsok — ~183
- **Hatás:** Felhasználók nyers kulcsokat látnak fordítás helyett (pl. `"gamification.streak_title"`)
- **Javítás:** Locale fájlok szisztematikus kitöltése (először HU, majd EN/DE AI fordítással)

### 6. Locale struktúra inkonzisztencia
- **Probléma:** A HU fájl flat kulcsokat használ (`"program.join": "..."`) míg az EN/DE nested objektumokat (`program: { join: "..." }`)
- **Hatás:** A `t()` függvény mindkettőt kezeli, de a karbantartás nehéz és hibalehetőség magas
- **Javítás:** Egységesíteni a struktúrát (javasolt: flat keys mindenhol)

### 7. CreativeGamification — hardcoded fake adat
- **Fájl:** `src/components/gamification/CreativeGamification.tsx`
- **Probléma:** `impactTrees`, `seasonalEvents`, `teamChallenges` mind hardcoded mock adat
- **Hatás:** Felhasználók hamis statisztikákat és nem létező eseményeket látnak
- **Javítás:** Vagy valós DB query-kre cserélni, vagy eltávolítani a komponenst amíg az adatok rendelkezésre állnak

### 8. BlogPage — statikus cikkek, nincs DB
- **Fájl:** `src/pages/BlogPage.tsx`
- **Probléma:** A tudásbázis/blog oldal 4 statikus cikket tartalmaz, nincs DB backing
- **Hatás:** Új cikkek nem adhatók hozzá admin felületről
- **Javítás:** Vagy a meglévő `articles` / `knowledge_base` táblákat bekötni, vagy admin CRUD-ot építeni

---

## P2 — KÖZEPES (funkció részlegesen működik)

### 9. WellPoints — nincs beváltási rendszer
- **Probléma:** Pontokat lehet gyűjteni (`awardPoints`), streak működik (`updateStreak`), de nincs mód pontokat beváltani
- **Hiányzik:** Jutalomkatalógus, kupon/voucher rendszer, `wellpoints_ledger` tábla (részletes tranzakció log)
- **Javítás:** Későbbi fejlesztés — a jelenlegi állapot elfogadható MVP-hez

### 10. Stripe integráció — létezik de nincs aktiválva
- **Fájlok:** `src/lib/stripe.ts`, `supabase/functions/create-checkout-session/`, `supabase/functions/stripe-webhook/`
- **Probléma:** A Stripe kód megvan és valódi API-t használ, de a `VITE_STRIPE_ENABLED` env var valószínűleg nincs beállítva production-ben
- **Hatás:** Fizetés gomb jelenik meg de nem működik, vagy el van rejtve
- **Javítás:** Stripe kulcsok beállítása és tesztelés (ld. STRIPE_INTEGRATION_PLAN.md)

### 11. Szponzor kredit rendszer — DB megvan, flow hiányos
- **Táblák:** `sponsor_credits`, `credit_transactions`, `challenge_sponsorships` — LÉTEZNEK és valós query-k futnak rájuk
- **Probléma:** Kredit vásárlás flow nem teljes — nincs bekötött fizetési kapu a szponzor kredit feltöltéséhez
- **Javítás:** Stripe aktiválás után a kredit vásárlási flow-t bekötni

### 12. types.ts — 23+ hiányzó tábla definíció
- **Probléma:** A kódban lekérdezett táblák közül ~23 nincs definiálva a `types.ts`-ben
- **Kritikus hiányzók:** `community_posts`, `community_post_likes`, `community_post_comments`, `wellpoints_ledger`, `invite_codes`, `program_lessons`, `lesson_progress`
- **Hatás:** TypeScript nem ad type safety-t ezeknél a query-knél
- **Javítás:** `supabase gen types typescript` futtatása a friss séma alapján

---

## P3 — ALACSONY (kozmetikai / fejlesztési adósság)

### 13. Legacy admin oldalak — holt kód
- **Fájlok:** `SuperAdminPage.tsx`, `AdminDashboardPage.tsx`
- **Probléma:** Importálva de NEM routolva — az új `/admin` rendszer aktív
- **Javítás:** Törölni a legacy fájlokat

### 14. Nem használt DB táblák
- **~13 tábla** definiálva a `types.ts`-ben de sehol nem lekérdezve a kódban
- **Javítás:** Auditálni, hogy szükségesek-e, és ha nem, archiválni

### 15. content_url mező overloading
- **Probléma:** Egyetlen mező tárolja a videó URL-t (recorded), meeting linket (online_live), és térkép URL-t (in_person)
- **Hatás:** A `content_type` mindig szükséges a helyes értelmezéshez
- **Javítás:** Elfogadható jelenlegi állapotban, de hosszú távon dedikált mezők jobbak lennének

---

## Szükséges SQL parancsok (Attila futtatja)

```sql
-- 1. Blob URL-ek törlése content_url-ból
UPDATE expert_contents SET content_url = NULL WHERE content_url LIKE 'blob:%';

-- 2. Nuxon interjú újrapublikálása (ha még unpublished)
UPDATE expert_contents SET is_published = true
WHERE id = '0a8a7e46-8155-49ec-9a91-629c734e6dd1';

-- 3. Community Post táblák létrehozása (P0 fix)
-- FIGYELEM: Ezt a struktúrát a CommunityFeed.tsx kód alapján hoztam létre
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Auth users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read likes" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can like" ON community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON community_post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read comments" ON community_post_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON community_post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own comments" ON community_post_comments FOR DELETE USING (auth.uid() = author_id);
```

---

## Javítási sorrend (javasolt)

| # | Feladat | Prioritás | Ki? |
|---|---------|-----------|-----|
| 1 | Community Post SQL táblák létrehozása | P0 | Attila (SQL) |
| 2 | Blob URL-ek törlése (SQL) | P1 | Attila (SQL) |
| 3 | access_level/access_type egységesítés | P0 | Claude (kód) |
| 4 | CommunityFeed types.ts frissítés | P0 | Claude (kód) |
| 5 | CreativeGamification mock adat eltávolítás | P1 | Claude (kód) |
| 6 | Hiányzó fordítási kulcsok pótlása (HU) | P1 | Claude (kód) |
| 7 | Stripe aktiválás tesztelés | P2 | Attila + Claude |
| 8 | Legacy admin kód törlése | P3 | Claude (kód) |

---

## Ami JÓL MŰKÖDIK

- Expert Studio create/edit flow (a mai javítások után)
- Események rendszere (valós DB, regisztráció, részletek)
- Regionális Hub-ok (valós DB)
- Admin felület (14 aloldal, RBAC, valós adatok)
- Szponzor dashboard (valós DB query-k)
- UserProgressBar (valós WellPoints + streak)
- Navigáció role-based színezéssel
- YouTube/Vimeo iframe beágyazás
- AI fordítás (Supabase Edge Function)
- Stripe kód infrastruktúra (készen áll aktiválásra)
