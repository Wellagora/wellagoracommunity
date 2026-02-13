# WELLAGORA — MASTER FEJLESZTÉSI TERV v2.0

**Frissítve:** 2026-02-13 (kódbázis verifikáció után)
**Előzmény:** Phase 3A KÉSZ (commit c0e82b4)
**Felülvizsgálat oka:** Az v1.0 terv több helyen pontatlan volt — a kódbázis valós állapota kedvezőbb.

---

## WINDSURF VÉGREHAJTÁSI UTASÍTÁS

**Ez a dokumentum önmagában elegendő az összes fejlesztési feladat végrehajtásához.**

Olvasd el a teljes tervet, majd hajtsd végre az összes fázist sorrendben:
**Phase 3B → Phase 3C → Phase 3D → Phase 3E**

Szabályok:
1. **Commitolj minden fázis végén** külön commit-tal (pl. `fix: Phase 3B — Biztonság + Infrastruktúra`)
2. **A Stripe end-to-end tesztet NE csináld** — az az utolsó lépés, azt együtt végezzük
3. Ha egy feladathoz a leírásban KÉSZ van jelölve, **ellenőrizd hogy valóban működik**, de ne írd újra
4. Ha egy feladat részleges, **csak a hiányzó részt pótold**
5. Minden fájlmódosítás előtt **olvasd el az aktuális fájlt** — a sor-hivatkozások közelítőek
6. Ne hozz létre felesleges UI-t — csak meglévő handler-ekhez köss be új logikát
7. `npm run build` legyen sikeres minden fázis végén

---

## 1. VALÓS ÁLLAPOT ÖSSZEFOGLALÓ (verifikált 2026-02-13)

| Metrika | Régi terv (v1.0) | Valós állapot (v2.0) |
|---------|-------------------|----------------------|
| Gamifikáció triggerek | 1/13 bekötve | **12/14 bekötve** |
| Email (Resend) | "nincs bekötve" | **Resend API integrálva** |
| Event RSVP | "nincs perzisztencia" | **event_rsvps tábla + RLS kész** |
| Sitemap | "HIÁNYZIK" | **Kliens-oldali generálás kész** |
| JSON-LD | "HIÁNYZIK" | **Program + Partner schema kész** |
| Meta tagek | "HIÁNYZIK" | **react-helmet-async + SEOHead kész** |
| Impact Dashboard | "nincs dashboard" | **3 komponens + service kész** |
| Unit tesztek | "0 unit teszt" | **4 vitest fájl létezik** |

**Következmény:** A tényleges munka ~40%-kal kevesebb mint az v1.0-ban becsült.

| Fázis | Leírás | Becsült idő |
|-------|--------|-------------|
| **Phase 3A** | ✅ KÉSZ (c0e82b4) | KÉSZ |
| **Phase 3B** | Biztonság + Cleanup | ~1 nap |
| **Phase 3C** | UX kiegészítés | ~3 nap |
| **Phase 3D** | Üzleti logika befejezés | ~3 nap |
| **Phase 3E** | Minőségbiztosítás (SEO + teszt kiegészítés) | ~2 nap |
| **UTOLSÓ** | Stripe end-to-end teszt (NE CSINÁLD) | ~1 nap |

**Összes becsült idő: ~10 munkanap (2 hét)** (régi becslés: 18 nap)

---

## 2. TELJES PLATFORM LELTÁR (frissített státuszok)

### SZAKÉRTŐI ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 1 | Expert regisztráció | ✅ KÉSZ | - | Működik, szerepkör választással |
| 2 | Expert profil kitöltés | ⚠️ RÉSZLEGES | 3C | Mezők vannak, nincs onboarding varázsló |
| 3 | Program létrehozás varázsló | ✅ KÉSZ | - | Step1-4, media upload javítva (c0e82b4) |
| 4 | Program publikálás (3 nyelv) | ✅ KÉSZ | - | HU/EN/DE |
| 5 | Stripe Connect onboarding | ✅ KÉSZ | - | Express fiók |
| 6 | Alapító Szakértő 0% díj | ✅ KÉSZ | - | c0e82b4 |
| 7 | Szakértői naptár | ⚠️ RÉSZLEGES | 3D | Hónap nézet van, nincs időpont-kezelés |
| 8 | Szakértői üzenetküldés | ⚠️ RÉSZLEGES | 4+ | Inbox betölt, nincs szálkezelés (post-launch) |
| 9 | Jelenlét-követés | ❌ HIÁNYZIK | 3D | Nincs check-in |
| 10 | Szakértői analitika | ⚠️ RÉSZLEGES | 3D | Bevétel van, engagement hiányzik |

### TAG ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 11 | Tag regisztráció | ✅ KÉSZ | - | Email/jelszó + szerepkör |
| 12 | Piactér + szűrők | ⚠️ RÉSZLEGES | 3C | Cím keresés van, full-text nincs |
| 13 | Stripe fizetés | ✅ KÉSZ | - | Edge fn → Stripe session → webhook |
| 14 | Hozzáférés vásárlás után | ⚠️ RÉSZLEGES | 3D | content_access tábla, nincs lejárat |
| 15 | Esemény RSVP | ✅ KÉSZ | - | **event_rsvps tábla + RLS + mutation** |
| 16 | Kedvencek | ✅ KÉSZ | - | Szív ikon, toggle |
| 17 | Profil szerkesztés | ✅ KÉSZ | - | Név, bio, helyszín |
| 18 | Közösségi posztok | ⚠️ RÉSZLEGES | 3C | Post/like/comment kész; edit hiányzik |
| 19 | Gamifikáció triggerek | ✅ KÉSZ (12/14) | 3B | Csak `program_completed` + `lesson_completed` hiányzik |
| 20 | Streak rendszer | ✅ KÉSZ | - | daily_login + streak_bonus bekötve |

### SZPONZOR ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 21 | Szponzor regisztráció | ✅ KÉSZ | - | 4 lépéses onboarding |
| 22 | Kredit vásárlás | ⚠️ RÉSZLEGES | 3D | Edge fn kész, UI form hiányos |
| 23 | Program szponzorálás | ⚠️ RÉSZLEGES | 3D | Modal + DB, nincs kampány UI |
| 24 | Hatás-követés | ✅ KÉSZ | - | **3 dashboard + SponsorImpactService** |

### PLATFORM-SZINTŰ

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 25 | WellBot AI | ✅ KÉSZ | - | Route kontextus hozzáadva (c0e82b4) |
| 26 | i18n (HU/EN/DE) | ⚠️ RÉSZLEGES | 3C | 6 fájl (3 fő + 3 admin), hiányosságok |
| 27 | In-app értesítések | ⚠️ RÉSZLEGES | 3D | Tábla + UI kész, email triggerek hiányoznak |
| 28 | Email küldés (Resend) | ✅ KÉSZ | - | **send-welcome-email Resend API-val működik** |
| 29 | Globális keresés | ❌ HIÁNYZIK | 3C | Csak RegionalHub-ban van searchQuery |
| 30 | Mobil navigáció | ✅ KÉSZ | - | Sheet menü + MobileBottomNav |

### BIZTONSÁG + INFRASTRUKTÚRA

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 31 | RLS policy-k | ✅ KÉSZ | - | 190 migráció |
| 32 | Rate limiting | ❌ HIÁNYZIK | 3B | **Kritikus biztonsági rés** |
| 33 | GDPR adat-törlés | ❌ HIÁNYZIK | 3D | Cookie consent van, törlés nincs |
| 34 | DummyPaymentModal | ⚠️ HALOTT KÓD | 3B | Létezik, sehol nincs importálva, törölni kell |
| 35 | Sentry | ✅ KÉSZ | - | Konfigurálva |
| 36 | CI/CD | ✅ KÉSZ | - | GitHub Actions |

### SEO + TESZTELÉS

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 37 | sitemap.xml | ✅ KÉSZ | - | **SitemapPage.tsx + siteMapGenerator.ts** |
| 38 | Meta tagek | ✅ KÉSZ | - | **react-helmet-async + SEOHead** |
| 39 | hreflang tagek | ❌ HIÁNYZIK | 3E | Háromnyelvű oldalhoz szükséges |
| 40 | JSON-LD | ⚠️ RÉSZLEGES | 3E | **Program + Partner kész**, Expert + Event hiányzik |
| 41 | Unit tesztek | ⚠️ RÉSZLEGES | 3E | **4 vitest fájl van**, vitest.config hiányzik, bővítés kell |
| 42 | Stripe E2E teszt | ❌ HIÁNYZIK | UTOLSÓ | **NE CSINÁLD — együtt végezzük** |

---

## 3. FÁZIS RÉSZLETEZÉS

---

### Phase 3B — Biztonság + Cleanup (~1 nap)

**Cél:** Biztonsági rések betömése és halott kód eltávolítása.

#### 3B-1: Rate Limiting Edge Function-ökben
**Prioritás:** KRITIKUS
**Probléma:** Nincs brute-force védelem — az auth és fizetési végpontok nyitottak.

**Feladat:**
1. Hozd létre: `supabase/functions/_shared/rateLimit.ts`
   - In-memory Map alapú rate limiter (Deno-kompatibilis)
   - `checkRateLimit(identifier: string, maxRequests: number, windowMs: number)` → `{ allowed: boolean, retryAfter?: number }`

2. Alkalmazd a `supabase/functions/create-checkout-session/index.ts`-ben:
   - A serve handler elején, CORS check után
   - IP kinyerés: `req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown"`
   - Limit: 5 kérés / perc
   - 429 válasz ha túllépte

3. Alkalmazd a `supabase/functions/ai-chat/index.ts`-ben:
   - Limit: 10 kérés / perc

---

#### 3B-2: DummyPaymentModal Eltávolítás
**Prioritás:** KÖZEPES
**Probléma:** `src/components/marketplace/DummyPaymentModal.tsx` halott kód — sehol nincs importálva.

**Feladat:**
1. Töröld: `src/components/marketplace/DummyPaymentModal.tsx`
2. Frissítsd: `src/__tests__/financial.test.ts` — ha hivatkozik DummyPaymentModal-ra, cseréld a nevet "Payment 80/20 split logic"-ra
3. Ellenőrizd: `grep -r "DummyPayment" src/` — sehol ne maradjon hivatkozás

---

#### 3B-3: Hiányzó Gamifikáció Triggerek Pótlása
**Prioritás:** ALACSONY (12/14 már kész)
**Már bekötve:** review_submitted, daily_login, profile_completed, event_attended, post_created, first_post, like_given, like_received, comment_added, voucher_redeemed, streak_bonus
**Hiányzik:** `program_completed` (50 WP), `lesson_completed` (10 WP)

**Feladat:**
- Keresd meg a program befejezés logikáját (content_access vagy hasonló) — ha van sikeres "program completed" állapot, ott hívd meg: `awardPoints(userId, 'program_completed', 50, 'Program befejezve')`
- Keresd meg a lecke/modul befejezés logikáját — ha van, hívd meg: `awardPoints(userId, 'lesson_completed', 10, 'Lecke befejezve')`
- **Ha nincs ilyen handler, hagyd ki** — ne hozz létre új UI-t

---

#### 3B Commit:
```
fix: Phase 3B — Biztonság + Cleanup

- feat(security): rate limiting edge function-ökben (checkout + ai-chat)
- chore: DummyPaymentModal halott kód eltávolítása
- feat(gamification): hiányzó pont-triggerek pótlása (program_completed, lesson_completed)
```

---

### Phase 3C — Felhasználói Út Kiegészítés (~3 nap)

**Cél:** A három szerepkör UX-ének javítása és hiányzó funkciók pótlása.

#### 3C-1: Expert Onboarding Varázsló
**Probléma:** A regisztráció után nincs irányított flow (profil → program → Stripe).

**Feladat:**
- Hozz létre egy onboarding checklist komponenst (ExpertOnboardingChecklist)
- Jelenjen meg a szakértői dashboard tetején, ha a profil/program/Stripe bármelyike hiányos
- 3 lépés: (1) Profil kitöltése ✓/✗, (2) Első program létrehozása ✓/✗, (3) Stripe Connect ✓/✗
- Minden lépés linkeljen a megfelelő oldalra
- Ha mind kész, rejtsd el a checklistet

**Fájlok:** Vizsgáld meg `src/pages/ExpertStudio.tsx` vagy hasonló dashboard oldalt.

---

#### 3C-2: Globális Keresés
**Probléma:** Csak a RegionalHub-ban van cím-keresés, nincs platformszintű kereső.

**Feladat:**
- Hozz létre `src/components/search/GlobalSearch.tsx` komponenst
- Supabase full-text search: `programs.title`, `programs.description`, `profiles.display_name`
- Integráld a fejlécbe (Header komponens) egy keresőmező / Command Palette formájában
- Eredmények: programok + szakértők, linkekkel

---

#### 3C-3: Közösségi Post Edit
**Probléma:** Delete már működik (RLS: "Authors can delete own posts"), de edit hiányzik.

**Fájl:** `src/components/community/CommunityFeed.tsx` (753 sor)

**Feladat:**
- A PostCard komponensben (a delete gomb mellé) adj hozzá "Szerkesztés" gombot
- Szerkesztés: inline edit mód — a post szövege szerkeszthetővé válik
- Mentés: `supabase.from('community_posts').update({ content }).eq('id', postId)`
- Csak a saját posztjainál jelenjen meg (auth.uid() === post.author_id)

---

#### 3C-4: i18n Hiányosságok Pótlása
**Fájlok:** `src/locales/hu.json`, `src/locales/en.json`, `src/locales/de.json` + admin változatok

**Feladat:**
- Futtass egy összehasonlítást: a `hu.json` az elsődleges — minden kulcs ami ott van, legyen meg `en.json`-ban és `de.json`-ban is
- Pótold a hiányzó kulcsokat angol és német fordítással
- Admin fájlokra is alkalmazd

---

#### 3C Commit:
```
feat: Phase 3C — Felhasználói Út Kiegészítés

- feat(expert): onboarding checklist (profil → program → Stripe)
- feat(search): globális keresés platformszinten
- feat(community): post szerkesztés funkció
- fix(i18n): hiányzó fordítási kulcsok pótlása (HU/EN/DE)
```

---

### Phase 3D — Üzleti Logika Befejezés (~3 nap)

**Cél:** Befejezetlen üzleti funkciók lezárása.

#### 3D-1: Szakértői Naptár Időpont-Kezelés
**Probléma:** Hónap nézet van, de nincs időpont hozzáadás/foglalás.

**Feladat:**
- A meglévő naptár komponensben adj hozzá időpont-slot kezelést
- Szakértő beállíthatja az elérhető időpontjait (nap + óra)
- Tag láthatja és foglalhatja (egyszerű foglalás, nem komplex booking)
- Supabase tábla ha nincs: `expert_availability (expert_id, date, start_time, end_time, is_booked)`

---

#### 3D-2: Jelenlét-Követés (Check-in)
**Probléma:** Nincs mód a program résztvevőinek jelenlétét rögzíteni.

**Feladat:**
- Szakértői dashboard-on "Résztvevők" szekció a programjaihoz
- Egyszerű check-in gomb a résztvevők listájánál (NINCS QR-kód szükséges ebben a fázisban)
- Supabase tábla ha nincs: `attendance (id, program_id, user_id, checked_in_at, checked_in_by)`
- Statisztika: "X/Y résztvevő jelent meg"

---

#### 3D-3: Értesítés Rendszer Email Trigger Bekötés
**Probléma:** A notification infrastruktúra kész (notificationService.ts, triggerek), de az email küldés nincs bekötve az in-app eseményekhez.

**Feladat:**
- Keresd meg a `notificationService.ts` vagy hasonló szolgáltatást
- A kulcs-eseményeknél (program vásárlás, RSVP, stb.) add hozzá email küldést a meglévő Resend edge function-ökön keresztül
- Ellenőrizd: `supabase/functions/send-purchase-confirmation/index.ts` és `send-event-reminders/index.ts` — ha léteznek, kösd be őket a megfelelő eseményekhez

---

#### 3D-4: Szponzor Kredit Vásárlás UI Befejezés
**Probléma:** Edge function kész, UI form hiányos.

**Feladat:**
- Keresd meg a szponzor kredit vásárlás oldalt/komponenst
- Egészítsd ki a formot: összeg választás, Stripe checkout indítás
- A meglévő edge function-t használd

---

#### 3D-5: Program Hozzáférés Lejárat-Kezelés
**Probléma:** `content_access` tábla van, de nincs lejárat-ellenőrzés.

**Feladat:**
- Ha a `content_access` táblában van `expires_at` oszlop, adj hozzá ellenőrzést a tartalomhoz való hozzáférésnél
- Ha lejárt, mutass "Hozzáférés lejárt — újra vásárolhatod" üzenetet
- Ha nincs `expires_at` oszlop, adj hozzá opcionális mezőt

---

#### 3D-6: GDPR Adat-Törlés Funkció
**Probléma:** Cookie consent van, de a felhasználó nem tudja törölni az adatait.

**Feladat:**
- Profil beállítások oldalon adj hozzá "Fiók törlése" szekciót
- Megerősítő modal (jelszó vagy "TÖRLÉS" szó beírása)
- Supabase edge function vagy RPC: felhasználó összes adatának törlése (CASCADE a DB-ben már be van állítva)
- Auth user törlés: `supabase.auth.admin.deleteUser(userId)` (edge function-ből)

---

#### 3D-7: Szakértői Analitika Bővítés
**Probléma:** Bevétel + résztvevők van, engagement hiányzik.

**Feladat:**
- A meglévő expert analytics dashboard-hoz adj hozzá: értékelések átlaga, közösségi aktivitás, visszatérő tagok aránya
- Ezeket a meglévő táblákból aggregáld (reviews, community_posts, content_access)

---

#### 3D Commit:
```
feat: Phase 3D — Üzleti Logika Befejezés

- feat(calendar): szakértői időpont-kezelés
- feat(attendance): jelenlét-követés rendszer
- feat(notifications): email trigger bekötés meglévő Resend fn-ökkel
- feat(sponsor): kredit vásárlás UI befejezés
- feat(access): program hozzáférés lejárat-kezelés
- feat(gdpr): fiók törlés funkció
- feat(analytics): szakértői engagement metrikák
```

---

### Phase 3E — Minőségbiztosítás (~2 nap)

**Cél:** SEO kiegészítés, teszt bővítés, produkciós készültség.

#### 3E-1: hreflang Tagek
**Probléma:** Háromnyelvű oldal, de nincs hreflang — SEO szempontból kritikus.

**Feladat:**
- A meglévő `SEOHead.tsx` komponensben adj hozzá hreflang linkeket
- `<link rel="alternate" hreflang="hu" href="..." />`
- `<link rel="alternate" hreflang="en" href="..." />`
- `<link rel="alternate" hreflang="de" href="..." />`
- `<link rel="alternate" hreflang="x-default" href="..." />`

---

#### 3E-2: JSON-LD Bővítés
**Meglévő:** `ProgramJsonLd.tsx`, `PartnerJsonLd.tsx`
**Hiányzik:** Expert (Person schema), Event (Event schema)

**Feladat:**
- Hozd létre: `src/components/seo/ExpertJsonLd.tsx` — Person schema a szakértő profil oldalhoz
- Hozd létre: `src/components/seo/EventJsonLd.tsx` — Event schema az esemény oldalhoz
- Integráld a megfelelő oldalakba

---

#### 3E-3: Vitest Konfiguráció + Teszt Bővítés
**Meglévő:** 4 teszt fájl (`security.test.ts`, `financial.test.ts`, `enrollment.test.ts`, `wellbot.test.ts`), de nincs `vitest.config.ts` és nincs npm script.

**Feladat:**
1. Hozd létre `vitest.config.ts`-t (Vite alapú, path alias-ok, setup file)
2. Adj hozzá `package.json`-ba: `"test:unit": "vitest run"`, `"test:unit:watch": "vitest"`
3. Írd meg a kritikus teszteket:
   - `src/__tests__/wellpoints.test.ts` — awardPoints() összes action type
   - `src/__tests__/rateLimit.test.ts` — rate limiter helyes működése
   - `src/__tests__/auth.test.ts` — alapvető auth flow (ha nincs)
4. A meglévő 4 tesztet is futtasd le — javíts ha hibásak

---

#### 3E-4: 403/500 Hiba Oldalak
**Meglévő:** 404 oldal van.
**Hiányzik:** 403 (Forbidden) és 500 (Server Error).

**Feladat:**
- Hozd létre a 403 és 500 hiba oldalakat a 404 mintájára
- Az App.tsx-ben használd ezeket az ErrorBoundary-vel

---

#### 3E Commit:
```
feat: Phase 3E — Minőségbiztosítás

- feat(seo): hreflang tagek (HU/EN/DE)
- feat(seo): Expert + Event JSON-LD schema
- feat(test): vitest konfiguráció + unit tesztek bővítés
- feat(ux): 403/500 hiba oldalak
```

---

### UTOLSÓ LÉPÉS — Stripe End-to-End Teszt

## ⛔ NE HAJTSD VÉGRE — EZT EGYÜTT VÉGEZZÜK ⛔

Ez a lépés kézi tesztelést igényel Stripe test mode-ban:
1. Teljes vásárlási flow (tag → checkout → webhook → hozzáférés)
2. Founding expert 0% díj verifikáció
3. Szponzor kredit vásárlás flow
4. Webhook feldolgozás ellenőrzés

---

## 4. ÖSSZESÍTETT STATISZTIKA

| Metrika | Érték |
|---------|-------|
| Összes funkció | 42 |
| ✅ KÉSZ | **20** (v1.0-ban 11 volt — 9 félreosztályozott) |
| ⚠️ RÉSZLEGES | **13** |
| ❌ HIÁNYZIK | **9** |
| Becsült munkanap | **~10 nap** (v1.0-ban 18 volt) |
| Fázisok | 4 (3B-3E) + Stripe |

---

## 5. REFERENCIA

- **Stratégiai Audit:** `WellAgora_Strategiai_Audit_2026Q1.docx`
- **Phase 3A (KÉSZ):** commit c0e82b4, `WINDSURF_PHASE3A_KRITIKUS_JAVITASOK.md`
- **Tech stack:** React 18 + TypeScript + Vite 5 + TailwindCSS + shadcn/ui + Supabase + Stripe + Google Gemini AI
- **Gamifikáció:** `src/lib/wellpoints.ts` (awardPoints fn + POINT_VALUES objektum)
- **Email:** `supabase/functions/send-welcome-email/index.ts` (Resend API)
- **Edge functions:** 25 db a `supabase/functions/` alatt
- **i18n:** `src/locales/` (hu.json, en.json, de.json + admin változatok)
- **SEO:** `src/components/SEOHead.tsx`, `src/components/seo/ProgramJsonLd.tsx`, `src/components/seo/PartnerJsonLd.tsx`
- **Teszt:** 4 vitest fájl a `src/__tests__/`-ben, 8 Playwright E2E fájl az `e2e/`-ben
