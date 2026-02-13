# WELLAGORA — MASTER FEJLESZTÉSI TERV

**44 feladat | 5 fázis | Teljes platform lefedettséggel**

Kiindulás: Stratégiai Audit 2026Q1 + Gap Analízis
Phase 3A KÉSZ: commit c0e82b4 (2026-02-13)
Dátum: 2026. február 14.

---

## 1. ÖSSZEFOGLALÓ

A WellAgora platform **44 azonosított feladat** közé esik, melyből **11 már KÉSZ** (Phase 3A + korábbi fejlesztés), **20 RÉSZLEGES** (elkezdve de nem befejezve), és **13 HIÁNYZIK** (még nem kezdett).

| Fázis | Leírás | Becsült idő |
|-------|--------|-------------|
| **Phase 3A** | ✅ KÉSZ (c0e82b4): Bucket fix + 0% díj + Gamifikáció trigger + WellBot kontextus | KÉSZ |
| **Phase 3B** | Biztonság + Infrastruktúra (rate limit, email, DummyPayment, gamif. triggerek) | ~3 nap |
| **Phase 3C** | Felhasználói Út Kiegészítés (keresés, RSVP, közösség, szponzor hatás, i18n) | ~5 nap |
| **Phase 3D** | Üzleti Logika Kiegészítés (naptár, jelenlét, értesítés, kredit UI, GDPR) | ~5 nap |
| **Phase 3E** | Minőségbiztosítás (SEO, tesztek, sitemap, meta tagek, strukturált adatok) | ~4 nap |
| **UTOLSÓ** | Stripe end-to-end teszt | ~1 nap |

**Összes becsült idő: ~18 munkanap (3.5 hét)**

---

## 2. TELJES PLATFORM LELTÁR (44 feladat)

### SZAKÉRTŐI ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 1 | Expert regisztráció (email/jelszó) | ✅ KÉSZ | 3A KÉSZ | Működik, szerepkör választással |
| 2 | Expert profil kitöltés | ⚠️ RÉSZLEGES | 3C | Mezők vannak, nincs onboarding varázsló |
| 3 | Program létrehozás varázsló (4 lépés) | ✅ KÉSZ | 3A KÉSZ | Step1-4 működik, media upload javítva |
| 4 | Program publikálás (3 nyelv) | ✅ KÉSZ | - | HU/EN/DE jóváhagyás után publikus |
| 5 | Stripe Connect onboarding | ✅ KÉSZ | - | Express fiók, refresh flow |
| 6 | Alapító Szakértő 0% díj | ✅ KÉSZ | 3A KÉSZ | create-checkout-session javítva |
| 7 | Szakértői naptár | ⚠️ RÉSZLEGES | 3D | Hónap nézet van, nincs időpont-kezelés |
| 8 | Szakértői üzenetküldés/Inbox | ⚠️ RÉSZLEGES | 4 | Inbox betölt, nincs szálkezelés |
| 9 | Jelenlét-követés (check-in) | ❌ HIÁNYZIK | 3D | Nincs QR-kód, check-in, statisztika |
| 10 | Szakértői analitika | ⚠️ RÉSZLEGES | 3D | Bevétel + résztvevők, hiányzik engagement |

### TAG ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 11 | Tag regisztráció | ✅ KÉSZ | - | Email/jelszó + szerepkör választás |
| 12 | Piactér böngészés + szűrők | ⚠️ RÉSZLEGES | 3C | 12 kategória, cím keresés; nincs full-text |
| 13 | Stripe fizetés (checkout) | ✅ KÉSZ | - | Edge fn → Stripe session → webhook |
| 14 | Hozzáférés vásárlás után | ⚠️ RÉSZLEGES | 3D | content_access tábla, nincs lejárat-kezelés |
| 15 | Esemény RSVP | ⚠️ RÉSZLEGES | 3C | UI kész, nincs perzisztencia + email |
| 16 | Kedvencek/könyvjelzők | ✅ KÉSZ | - | Szív ikon, favorites tábla, toggle |
| 17 | Profil szerkesztés | ✅ KÉSZ | - | Név, bio, helyszín, értesítési beáll. |
| 18 | Közösségi posztok | ⚠️ RÉSZLEGES | 3C | Post/like/comment; nincs edit/delete/mention |
| 19 | Gamifikáció pont-triggerek | ⚠️ RÉSZLEGES | 3B | 1/13 trigger bekötve (voucher_redeemed) |
| 20 | Streak rendszer | ⚠️ RÉSZLEGES | 3B | Struktúra létezik, triggerek hiányoznak |

### SZPONZOR ÚT

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 21 | Szponzor regisztráció + onboarding | ✅ KÉSZ | - | 4 lépéses onboarding (cég, logo, web) |
| 22 | Kredit vásárlás | ⚠️ RÉSZLEGES | 3D | Edge fn kész, UI form hiányos |
| 23 | Program szponzorálás | ⚠️ RÉSZLEGES | 3D | Modal + DB oszlopok, nincs kampány UI |
| 24 | Hatás-követés (impact) | ⚠️ RÉSZLEGES | 3C | Kalkuláció van, nincs dashboard/ROI |

### PLATFORM-SZINTŰ

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 25 | WellBot AI házigazda | ⚠️ RÉSZLEGES | 3A KÉSZ | Route kontextus hozzáadva (c0e82b4) |
| 26 | i18n fordítások (HU/EN/DE) | ⚠️ RÉSZLEGES | 3C | Fájlok vannak, hiányosságok maradtak |
| 27 | In-app értesítések | ⚠️ RÉSZLEGES | 3D | Tábla + UI, email küldés nincs bekötve |
| 28 | Email küldés (Resend) | ⚠️ RÉSZLEGES | 3B | Edge fn-ök léteznek, provider nincs bekötve |
| 29 | Globális keresés | ❌ HIÁNYZIK | 3C | Csak cím keresés a piactéren |
| 30 | Mobil navigáció | ⚠️ RÉSZLEGES | - | Sheet menü, MobileBottomNav komponens létezik |
| 31 | 404/hiba oldalak | ⚠️ RÉSZLEGES | - | 404 van, 403/500 nincs |
| 32 | Betöltési állapotok (skeleton) | ⚠️ RÉSZLEGES | - | Fő komponensek kész, nem konzisztens |

### BIZTONSÁG + INFRASTRUKTÚRA

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 33 | Supabase RLS policy-k | ✅ KÉSZ | - | 190 migráció, RLS audit alkalmazva |
| 34 | Rate limiting (API védelem) | ❌ HIÁNYZIK | 3B | Nincs brute-force védelem |
| 35 | GDPR adat-törlés | ❌ HIÁNYZIK | 3D | Cookie consent van, törlés funkció nincs |
| 36 | DummyPaymentModal eltávolítás | ⚠️ RÉSZLEGES | 3B | Halott kód, el kell távolítani |
| 37 | Sentry hibakezelés | ✅ KÉSZ | - | Konfigurálva (opcionális mód) |
| 38 | CI/CD pipeline | ✅ KÉSZ | - | GitHub Actions: tsc + build + test |

### SEO + TESZTELÉS

| # | Funkció | Státusz | Fázis | Megjegyzés |
|---|---------|---------|-------|------------|
| 39 | sitemap.xml | ❌ HIÁNYZIK | 3E | robots.txt hivatkozik rá, de nem létezik |
| 40 | Dinamikus meta tagek | ❌ HIÁNYZIK | 3E | Cím/leírás nem frissül oldalváltáskor |
| 41 | hreflang tagek | ❌ HIÁNYZIK | 3E | Háromnyelvű oldalhoz kritikus |
| 42 | Strukturált adatok (JSON-LD) | ❌ HIÁNYZIK | 3E | Schema.org nincs |
| 43 | Unit tesztek (Vitest) | ❌ HIÁNYZIK | 3E | 0 unit teszt, 8 E2E Playwright fájl |
| 44 | Stripe end-to-end teszt | ❌ HIÁNYZIK | UTOLSÓ | Kifejezetten az utolsó lépés |

---

## 3. FÁZIS RÉSZLETEZÉS

### Phase 3B — Biztonság + Infrastruktúra (~3 nap)

Ezek a feladatok kritikus biztonsági és infrastrukturális hiányosságokat pótolnak.

| # | Feladat | Típus | Becslés | Függőség | Végrehajtó |
|---|---------|-------|---------|----------|------------|
| 1 | Összes gamifikáció pont-trigger bekötés | Kód | 1 nap | Nincs | Windsurf |
| 2 | Streak rendszer triggerek | Kód | 0.5 nap | #1 | Windsurf |
| 3 | Rate limiting edge function-ökben | Biztonság | 0.5 nap | Nincs | Windsurf |
| 4 | DummyPaymentModal eltávolítás | Cleanup | 10 perc | Nincs | Windsurf |
| 5 | Email provider (Resend) bekötés | Infra | 0.5 nap | Nincs | Windsurf |
| 6 | Regisztrációs welcome pont (50 WP) | Kód | 0.5 nap | #1 | Windsurf |

**Részletes utasítások:** Lásd `WINDSURF_PHASE3B_BIZTONSAG.md` (külön fájl)

---

### Phase 3C — Felhasználói Út Kiegészítés (~5 nap)

Azok a funkciók, amelyek a három szerepkör (Expert, Tag, Szponzor) felhasználói élményét teszik teljesebbé.

| # | Feladat | Típus | Becslés | Függőség | Végrehajtó |
|---|---------|-------|---------|----------|------------|
| 1 | Expert onboarding varázsló (profil → program → Stripe) | UI | 1.5 nap | Nincs | Windsurf |
| 2 | Globális keresés (full-text + expert + program) | Backend+UI | 1 nap | Nincs | Windsurf |
| 3 | Esemény RSVP perzisztencia + email | Backend+UI | 0.5 nap | 3B#5 | Windsurf |
| 4 | Közösségi post edit/delete + moderáció | UI | 0.5 nap | Nincs | Windsurf |
| 5 | Szponzor hatás-dashboard (impact query, ROI) | Dashboard | 1 nap | Nincs | Windsurf |
| 6 | i18n fordítási hiányosságok pótlása | i18n | 0.5 nap | Nincs | Windsurf |

**Részletes utasítások:** `WINDSURF_PHASE3C_UX.md` (készül a fázis előtt)

---

### Phase 3D — Üzleti Logika Kiegészítés (~5 nap)

A működő de befejezetlen üzleti funkciók befejezése.

| # | Feladat | Típus | Becslés | Függőség | Végrehajtó |
|---|---------|-------|---------|----------|------------|
| 1 | Szakértői naptár (időpont-kezelés, foglaltság) | UI+Backend | 1.5 nap | Nincs | Windsurf |
| 2 | Jelenlét-követés (check-in rendszer) | Backend+UI | 1 nap | Nincs | Windsurf |
| 3 | Értesítés rendszer bekötés (email triggerek) | Backend | 0.5 nap | 3B#5 | Windsurf |
| 4 | Szponzor kredit vásárlás UI | UI | 0.5 nap | Nincs | Windsurf |
| 5 | Program hozzáférés lejárat-kezelés | Backend | 0.5 nap | Nincs | Windsurf |
| 6 | GDPR adat-törlés funkció | Backend+UI | 0.5 nap | Nincs | Windsurf |
| 7 | Szakértői analitika bővítés (engagement) | Dashboard | 0.5 nap | #1 | Windsurf |

**Részletes utasítások:** `WINDSURF_PHASE3D_UZLET.md` (készül a fázis előtt)

---

### Phase 3E — Minőségbiztosítás (~4 nap)

SEO, tesztek, és minőségi ellenőrzés a produkciós bevezetéshez.

| # | Feladat | Típus | Becslés | Függőség | Végrehajtó |
|---|---------|-------|---------|----------|------------|
| 1 | sitemap.xml generálás (dinamikus) | SEO | 0.5 nap | Nincs | Windsurf |
| 2 | Dinamikus meta tagek (react-helmet) | SEO | 0.5 nap | Nincs | Windsurf |
| 3 | hreflang tagek (HU/EN/DE) | SEO | 0.5 nap | #2 | Windsurf |
| 4 | Strukturált adatok (JSON-LD schema.org) | SEO | 0.5 nap | #2 | Windsurf |
| 5 | Vitest beállítás + unit tesztek (fizetés, auth, pontok) | Teszt | 1.5 nap | Nincs | Windsurf |
| 6 | E2E tesztek bővítés (vásárlás, szponzor flow) | Teszt | 0.5 nap | #5 | Windsurf |

**Részletes utasítások:** `WINDSURF_PHASE3E_MINOSEG.md` (készül a fázis előtt)

---

### UTOLSÓ LÉPÉS — Stripe End-to-End Teszt (~1 nap)

**KIFEJEZETTEN AZ UTOLSÓ LÉPÉS.** Csak akkor, ha Phase 3B-3E mind kész.

| # | Feladat | Típus | Becslés | Függőség | Végrehajtó |
|---|---------|-------|---------|----------|------------|
| 1 | Stripe test mode teljes vásárlási flow | E2E | 0.5 nap | 3B-3E | Együtt |
| 2 | Webhook feldolgozás ellenőrzés | E2E | 0.25 nap | #1 | Együtt |
| 3 | Founding expert 0% díj verifikáció | E2E | 0.25 nap | #1 | Együtt |

---

## 4. IDŐTERV

- **1. hét:** Phase 3B (biztonság, triggerek, email)
- **2. hét:** Phase 3C (UX: keresés, RSVP, onboarding, szponzor impact)
- **3. hét:** Phase 3D (üzleti: naptár, jelenlét, értesítés, GDPR)
- **4. hét eleje:** Phase 3E (SEO + tesztek)
- **4. hét vége:** Stripe E2E teszt → PRODUKCIÓS BEVEZETÉS

**Minden fázishoz külön Windsurf prompt készül** — a Phase 3A mintájára, részletes fájl-szintű utasításokkal.

---

## 5. STATISZTIKA

| Metrika | Érték |
|---------|-------|
| Összes feladat | 44 |
| KÉSZ (Phase 3A + korábbi) | 11 |
| RÉSZLEGES (elkezdve) | 20 |
| HIÁNYZIK (nem kezdett) | 13 |
| Becsült munkanap | ~18 nap |
| Fázisok száma | 5 (3B-3E + Stripe) |
| Edge function-ök | 25 |
| DB migrációk | 190 |
| Komponensek | 336 |

---

## 6. REFERENCIA DOKUMENTUMOK

- **Stratégiai Audit:** `WellAgora_Strategiai_Audit_2026Q1.docx`
- **Phase 3A prompt (KÉSZ):** `WINDSURF_PHASE3A_KRITIKUS_JAVITASOK.md`
- **Phase 3A commit:** c0e82b4
- **Phase 3B prompt:** `WINDSURF_PHASE3B_BIZTONSAG.md` (következő)
- **Phase 3C prompt:** `WINDSURF_PHASE3C_UX.md` (készül)
- **Phase 3D prompt:** `WINDSURF_PHASE3D_UZLET.md` (készül)
- **Phase 3E prompt:** `WINDSURF_PHASE3E_MINOSEG.md` (készül)
