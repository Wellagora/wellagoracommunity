# WELLAGORA — Claude Cowork Agent Briefing

**Készült:** 2026-02-14
**Cél:** Részletes projekt-összefoglaló egy új AI coding agent (Claude) számára, hogy kontextus nélkül is azonnal produktív legyen.

---

## 1. PROJEKT ÁTTEKINTÉS

### Mi a WellAgora?

A **WellAgora** egy háromnyelvű (HU/EN/DE) fenntarthatósági közösségi piactér, ahol:

- **Szakértők (Experts)** workshopokat, tanfolyamokat és programokat hoznak létre és értékesítenek
- **Tagok (Members)** böngésznek, vásárolnak, közösségi posztokat írnak és pontokat gyűjtenek
- **Szponzorok (Sponsors)** krediteket vásárolnak és programokat szponzorálnak a közösség számára
- **Adminisztrátorok** kezelik a platform tartalmait, felhasználóit és pénzügyeit

### Üzleti modell

- Stripe fizetés: **Founding Expert = 0% platform díj** (100% az expertnek), normál Expert = 80/20 split
- Gamifikáció: **WellPoints** rendszer (14 action type, streakek, kedvezmények)
- Szponzor kreditek: szponzorok előre fizetnek, majd kreditből szponzorálnak programokat

---

## 2. TECH STACK

| Réteg | Technológia |
|-------|-------------|
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **Styling** | TailwindCSS + shadcn/ui (Radix primitívek) |
| **Routing** | React Router DOM v6 |
| **State** | React Query (TanStack) v5 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| **Edge Functions** | Deno runtime (26 db function) |
| **Fizetés** | Stripe (Connect + Checkout + Webhooks) |
| **AI** | Google Gemini (WellBot AI asszisztens) |
| **Email** | Resend API |
| **i18n** | Saját LanguageContext + JSON locale fájlok (HU/EN/DE) |
| **SEO** | react-helmet-async + JSON-LD + sitemap |
| **Monitoring** | Sentry |
| **Animációk** | Framer Motion |
| **Ikonok** | Lucide React |
| **Tesztelés** | Vitest (unit) + Playwright (E2E) |
| **CI/CD** | GitHub Actions |

---

## 3. PROJEKT STRUKTÚRA

```
wellagoracommunity/
├── public/                        # Statikus fájlok (képek, favicon)
├── src/
│   ├── __tests__/                 # 6 Vitest unit teszt fájl (82 teszt)
│   ├── _archive/                  # Archivált/régi kód
│   ├── assets/                    # Statikus assetek
│   ├── components/
│   │   ├── admin/                 # Admin dashboard komponensek
│   │   ├── ai/                    # WellBot AI chat
│   │   ├── analytics/             # Analytics tracker
│   │   ├── auth/                  # ProtectedRoute, auth form
│   │   ├── community/             # CommunityFeed, poszt CRUD
│   │   ├── creator/               # Program létrehozás
│   │   ├── engagement/            # StreakCelebration, gamifikáció UI
│   │   ├── events/                # Esemény lista és részletek
│   │   ├── expert-studio/         # Expert dashboard: wizard, naptár, jelenlét
│   │   ├── gamification/          # WellPoints megjelenítés
│   │   ├── growth/                # Növekedési komponensek
│   │   ├── home/                  # Homepage szekciók
│   │   ├── layout/                # AppLayout, footer, fejléc
│   │   ├── marketplace/           # Piactér kártyák, szűrők
│   │   ├── navigation/            # Navbar, MobileBottomNav
│   │   ├── notifications/         # In-app értesítések
│   │   ├── onboarding/            # WelcomeModal, ExpertOnboardingChecklist
│   │   ├── profile/               # Profil szerkesztés
│   │   ├── search/                # GlobalSearch (Command Palette)
│   │   ├── seo/                   # JSON-LD: Program, Partner, Expert, Event
│   │   ├── sponsor/               # Szponzor specifikus UI
│   │   ├── ui/                    # shadcn/ui primitívek
│   │   ├── voucher/               # Kupon kezelés
│   │   └── wallet/                # WellPoints wallet
│   ├── constants/                 # Konstansok
│   ├── contexts/
│   │   ├── AuthContext.tsx         # Auth + role + daily_login trigger
│   │   ├── LanguageContext.tsx     # i18n (hu/en/de)
│   │   ├── ProjectContext.tsx      # Projekt kontextus
│   │   ├── RegionContext.tsx       # Régió kontextus
│   │   ├── SubscriptionContext.tsx # Előfizetés kontextus
│   │   └── ViewModeContext.tsx     # Nézet mód
│   ├── hooks/                     # 40+ custom hook
│   ├── integrations/supabase/     # Supabase client + types + untyped helpers
│   ├── layouts/                   # AdminLayout
│   ├── lib/
│   │   ├── wellpoints.ts          # POINT_VALUES + awardPoints() — FONTOS
│   │   ├── notificationService.ts # Értesítés logika
│   │   ├── pricing.ts             # Árazási logika
│   │   ├── seo/                   # jsonLdSchemas, canonicalUrl, ogTags
│   │   └── ...                    # currency, imageUtils, logger, sentry, stb.
│   ├── locales/
│   │   ├── hu.json                # Magyar (elsődleges, ~5900 sor)
│   │   ├── en.json                # Angol (~5700 sor)
│   │   ├── de.json                # Német (~5800 sor)
│   │   └── admin változatok       # Admin specifikus i18n
│   ├── pages/                     # ~90 oldal komponens (lazy loaded)
│   │   ├── admin/                 # Admin aloldalak (12 db)
│   │   ├── Index.tsx              # Homepage
│   │   ├── AuthPage.tsx           # Bejelentkezés / Regisztráció
│   │   ├── ExpertStudio.tsx       # Szakértői dashboard (üzlet, naptár, analitika)
│   │   ├── BrowseProgramsPage.tsx # Piactér
│   │   ├── ProgramDetailPage.tsx  # Program részletek
│   │   ├── ProfilePage.tsx        # Profil + GDPR törlés
│   │   ├── Forbidden.tsx          # 403 oldal
│   │   ├── ServerError.tsx        # 500 oldal
│   │   ├── NotFound.tsx           # 404 oldal
│   │   └── ...
│   ├── services/                  # Üzleti logika szolgáltatások
│   ├── types/                     # TypeScript típusok
│   ├── App.tsx                    # Fő routing (~561 sor, 100+ route)
│   └── main.tsx                   # Entry point
├── supabase/
│   ├── functions/                 # 26 Edge Function (Deno)
│   │   ├── _shared/rateLimit.ts   # Közös rate limiter
│   │   ├── ai-chat/               # WellBot AI (Gemini)
│   │   ├── create-checkout-session/ # Stripe checkout
│   │   ├── stripe-webhook/        # Stripe webhook handler
│   │   ├── delete-user-account/   # GDPR törlés
│   │   ├── send-welcome-email/    # Resend email
│   │   └── ...
│   └── migrations/                # 191 SQL migráció
├── e2e/                           # 8 Playwright E2E teszt
├── vitest.config.ts               # Vitest konfiguráció
├── MASTER_FEJLESZTESI_TERV.md     # Master fejlesztési terv (ez a fő referencia)
└── package.json                   # Dependencies + scripts
```

---

## 4. KULCS FÁJLOK ÉS MINTÁZATOK

### Routing (`src/App.tsx`)
- Minden oldal **lazy loaded** (`React.lazy`)
- `<ProtectedRoute>` wrapper az autentikált oldalakhoz
- `<AppLayout>` wrapper a fejléccel és footerrel
- `<TermsCheckWrapper>` biztosítja a felhasználási feltételek elfogadását
- `<ErrorBoundary>` a gyökérelemben

### Autentikáció (`src/contexts/AuthContext.tsx`)
- Supabase Auth (email/jelszó)
- 4 szerepkör: `member`, `expert`, `sponsor`, `admin`
- `daily_login` WellPoints trigger bekötve
- `useAuth()` hook: `user`, `profile`, `isLoading`, `isExpert`, `isSponsor`, stb.

### i18n (`src/contexts/LanguageContext.tsx`)
- `useLanguage()` hook → `{ t, language, setLanguage }`
- `t('kulcs.alkulcs')` szintaxis
- Nyelvek: `hu`, `en`, `de`
- **Fontos:** `hu.json` az elsődleges — a többi nyelv kulcsai ebből származnak

### Supabase kliens (`src/integrations/supabase/client.ts`)
- `supabase` singleton export
- Típusos lekérdezések: `supabase.from('table').select('...')`
- Nem típusos táblákhoz: `src/integrations/supabase/untyped.ts` helper-ek

### Gamifikáció (`src/lib/wellpoints.ts`)
```typescript
POINT_VALUES = {
  daily_login: 5, profile_completed: 20, first_post: 30,
  post_created: 10, like_given: 2, like_received: 3,
  comment_added: 5, review_submitted: 15, event_attended: 25,
  voucher_redeemed: 50, streak_bonus: 10, program_completed: 50,
  lesson_completed: 10, referral_signup: 100
}
awardPoints(userId, actionType, points, description)
```

### Stílus konvenciók
- **shadcn/ui** komponensek: `<Button>`, `<Card>`, `<Dialog>`, `<Input>`, stb.
- **TailwindCSS** utility classes
- **Framer Motion** animációk (`motion.div`, `initial`, `animate`, `transition`)
- **Lucide React** ikonok (`<ShieldAlert>`, `<Star>`, `<Calendar>`, stb.)
- Színpaletta: emerald (expert), amber (engagement), indigo (community), cyan (stats)

---

## 5. ADATBÁZIS FONTOSABB TÁBLÁK

| Tábla | Leírás |
|-------|--------|
| `profiles` | Felhasználói profilok (user_role, display_name, bio, stb.) |
| `programs` | Programok/workshopok (title, description, price, category, stb.) |
| `expert_contents` | Szakértői tartalmak (access_type, total_licenses, creator_id) |
| `content_access` | Ki mihez fér hozzá (user_id, content_id, expires_at) |
| `community_posts` | Közösségi posztok (author_id, content, likes) |
| `events` | Események (title, date, location_name, organizer_id) |
| `event_rsvps` | Esemény RSVP-k (event_id, user_id) |
| `wellpoints_ledger` | WellPoints tranzakciók (user_id, action, points) |
| `reviews` | Értékelések (content_id, user_id, rating, comment) |
| `favorites` | Kedvencek (user_id, program_id) |
| `notifications` | In-app értesítések |
| `sponsor_credits` | Szponzor kredit egyenleg |
| `expert_availability` | Szakértő időpont-slotok (expert_id, date, start_time, end_time) |
| `attendance` | Jelenlét-követés (program_id, user_id, checked_in_at) |

**191 SQL migráció** — a séma nagyrészt stabil, RLS policy-k beállítva.

---

## 6. MEGVALÓSÍTOTT FEJLESZTÉSI FÁZISOK

### Phase 3A — Kritikus Javítások (commit `c0e82b4`)
- Media upload javítás a program létrehozás varázslóban
- WellBot AI route kontextus hozzáadása
- Founding Expert 0% díj implementáció

### Phase 3B — Biztonság + Infrastruktúra (commit `9a33d09`)
- **Rate limiting** edge function-ökben (sliding window, `_shared/rateLimit.ts`)
  - `create-checkout-session`: 5 req/min
  - `ai-chat`: 10 req/min
- **DummyPaymentModal** halott kód eltávolítása
- **Gamifikáció triggerek** pótlása (program_completed, lesson_completed — handler nem létezett, kihagyva)

### Phase 3C — Felhasználói Út Kiegészítés (commit `5ee9beb`)
- **Expert Onboarding Checklist** (Profil → Program → Stripe 3-lépéses)
- **Globális Keresés** (`GlobalSearch.tsx` — Command Palette a fejlécben)
  - ⚠️ Csak `title ilike`, nem full-text search (pg_trgm kellene)
- **Közösségi post szerkesztés** (inline edit mód)
- **i18n hiányosságok pótlása** (HU/EN/DE szinkron)

### Phase 3D — Üzleti Logika Befejezés (commit `c1439ec`)
- **Szakértői naptár időpont-kezelés** (slot hozzáadás/törlés, `expert_availability` tábla)
  - ⚠️ Időpont-ütközés detektálás nincs implementálva
- **Jelenlét-követés** (check-in gomb, attendance tábla, progress bar)
- **Értesítés email trigger bekötés** — meglévő Resend fn-ök ellenőrizve
- **Szponzor kredit vásárlás UI** — meglévő edge fn + form
- **Program hozzáférés lejárat** (`content_access.expires_at` ellenőrzés)
- **GDPR fiók törlés** (ProfilePage + `delete-user-account` edge function)
- **Expert engagement analytics** (értékelések, közösségi aktivitás, visszatérők)

### Phase 3E — Minőségbiztosítás (commit `614bb37`)
- **hreflang tagek** (HU/EN/DE + x-default a `SEOHead.tsx`-ben)
- **Event JSON-LD** (`EventJsonLd.tsx` + `generateEventSchema()`)
- **Vitest konfiguráció** (`vitest.config.ts`, `test:unit` npm scripts)
- **Unit tesztek** (wellpoints + rateLimit — összesen 82 teszt, 6 fájl, mind sikeres)
- **403 Forbidden + 500 ServerError** hiba oldalak

---

## 7. ISMERT PROBLÉMÁK ÉS HIÁNYOSSÁGOK

### Minőségi audit eredmény (2026-02-13)
- **TypeScript:** 0 hiba (`npx tsc --noEmit` clean)
- **Vitest:** 82 teszt — MIND SIKERES
- **Összesen:** 36 fájl módosult, +3842 sor, -332 sor

### Ismert CONCERN-ök (alacsony prioritás)

| # | Probléma | Javaslat |
|---|----------|----------|
| 1 | Globális keresés csak `title ilike` | Supabase `pg_trgm` vagy `ts_vector` full-text search |
| 2 | Vitest env: `node` (nincs `jsdom`) | Komponens tesztek nem futnak — env cserélni jsdom-ra |
| 3 | Naptár időpont-ütközés nincs | Overlap detection hozzáadása slot mentésnél |
| 4 | `hu.json` dupla kulcs warningok | Pre-existing, nem kritikus |
| 5 | `EventDetailPageNew.tsx` PostgrestBuilder lint hiba | Pre-existing, nem funkcionális |

### Bugfix lista (aktív feladat!)

A `WINDSURF_VENDEG_ES_ALTALANOS_BUGFIX_v2.md` fájl tartalmazza a **9 nyitott bugot**:

| Prioritás | # | Bug | Fájl/Hely |
|-----------|---|-----|-----------|
| **P0** | 1 | `/help` oldal 404 | Oldal létezik (`HelpPage.tsx`), de ellenőrizendő |
| **P0** | 2 | "GOD MODE" gomb production-ben | Navbar — `import.meta.env.DEV` feltétel kell |
| **P1** | 3 | "Social login coming soon" angol | AuthPage — i18n kulcs kell |
| **P1** | 4 | 404 oldal alacsony kontraszt | NotFound.tsx — `text-white` kell |
| **P1** | 5 | Footer brand: "Wellagora" → "WellAgora" | Footer + i18n fájlok |
| **P1** | 6 | Admin → Szponzor Hub megjelenik | Navbar role check javítás |
| **P2** | 7 | Tab cím nem lokalizált | `document.title` / react-helmet |
| **P2** | 8 | Cookie consent banner hiányzik | `CookieConsentBanner.tsx` már importálva App.tsx-ben, ellenőrizendő |
| **P2** | 9 | Piactér üres állapot vendégeknek | Empty state szöveg + CTA |

---

## 8. KÖVETKEZŐ TEENDŐK (PRIORITÁS SZERINT)

### 🔴 KRITIKUS — Stripe End-to-End Teszt
**Státusz:** ⏳ NEM ELKEZDVE — a tulajdonossal EGYÜTT kell végezni
**Mit kell tesztelni:**
1. Tag → Program vásárlás (checkout → webhook → content_access)
2. Founding Expert 0% díj verifikáció
3. Normál Expert 80/20 split
4. Szponzor kredit vásárlás
5. Webhook robusztusság (idempotency, signature)

**Előfeltételek:** Stripe test mode API kulcsok, Expert profil Stripe Connect-tel

### 🟡 FONTOS — Bugfix v2 végrehajtása
A 9 nyitott bug javítása a `WINDSURF_VENDEG_ES_ALTALANOS_BUGFIX_v2.md` alapján.

### 🟢 POST-LAUNCH javítások
1. Globális keresés → full-text search (pg_trgm)
2. Vitest environment → jsdom (komponens tesztek)
3. Naptár időpont-ütközés detektálás
4. Expert üzenetküldés szálkezelés (Phase 4+)

---

## 9. FEJLESZTÉSI SZABÁLYOK ÉS KONVENCIÓK

### Általános
- **Mindig olvasd el az aktuális fájlt** mielőtt módosítanád
- **`npm run build` legyen sikeres** minden változtatás után
- **TypeScript strict mode** — ne használj `any`-t feleslegesen
- **Ne hozz létre felesleges fájlokat** — csak ami a feladathoz kell
- **Commitolj fázisonként** külön commit-tal, beszédes üzenettel

### i18n
- `hu.json` az **elsődleges** nyelv — minden új kulcs ide kerüljön először
- Az `en.json` és `de.json` fájlokat is frissítsd
- Kulcs szintaxis: `t('szekció.alszekció.kulcs')`
- Admin fájlok külön: `hu-admin.json`, `en-admin.json`, `de-admin.json`

### Supabase
- Edge function-ök a `supabase/functions/` alatt, Deno runtime-mal
- CORS headers mindig kellenek (lásd `_shared/rateLimit.ts` mintát)
- RLS policy-k a migrációkban — 191 migráció létezik
- Új tábla = új migráció fájl a `supabase/migrations/` alatt

### Tesztelés
- Unit tesztek: `src/__tests__/` → `npx vitest run`
- E2E tesztek: `e2e/` → `npm run test:e2e`
- Vitest config: `vitest.config.ts` (path alias: `@` → `src`)
- **Vitest env jelenleg `node`** — DOM tesztek nem futnak

### Git
- Branch: `main` (egyetlen branch)
- Commit formátum: `feat:` / `fix:` / `chore:` prefix
- 47+ commit ahead of origin (nincs push-olva)

---

## 10. GYORS INDULÁS

```bash
# Projekt mappa
cd /Users/KelemenAttila/Documents/WELLAGORA/R&D/Windsurf/WellAgora/wellagoracommunity

# Dev szerver indítás
npm run dev
# → http://localhost:8080/

# TypeScript ellenőrzés
npx tsc --noEmit

# Unit tesztek
npm run test:unit

# Build
npm run build

# E2E tesztek (Playwright)
npm run test:e2e
```

---

## 11. REFERENCIA DOKUMENTUMOK

| Fájl | Tartalom |
|------|----------|
| `MASTER_FEJLESZTESI_TERV.md` | Teljes fejlesztési terv (Phase 3A-3E) — végrehajtva |
| `WINDSURF_VENDEG_ES_ALTALANOS_BUGFIX_v2.md` | 9 nyitott bug (P0-P2) — KÖVETKEZŐ FELADAT |
| `vitest.config.ts` | Vitest konfiguráció |
| `package.json` | Dependencies és scripts |
| `supabase/config.toml` | Supabase projekt konfiguráció |

---

*Ez az összefoglaló 2026-02-14-én készült, a `614bb37` commit állapotában.*
