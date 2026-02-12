# WellAgora — Multi-Agent Workflow & Platform Test Plan

## Agent Roles & Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│                    ATTILA (Orchestrator)                     │
│         Döntéshozó, minden agent-et Te irányítasz           │
└──────────┬──────────┬──────────┬──────────┬─────────────────┘
           │          │          │          │
     ┌─────▼────┐ ┌──▼───┐ ┌───▼──┐ ┌────▼─────┐ ┌─────────┐
     │ WINDSURF │ │CLAUDE│ │GITHUB│ │ SUPABASE │ │ LOVABLE │
     │ CASCADE  │ │COWORK│ │      │ │          │ │         │
     └──────────┘ └──────┘ └──────┘ └──────────┘ └─────────┘
```

### 1. Windsurf Cascade (Én)

| Képesség | Példa |
|----------|-------|
| ✅ Kód olvasás, szerkesztés, létrehozás | Bug fix, feature, refactor |
| ✅ Terminal parancsok | Build, test, git, npm |
| ✅ Fájlrendszer | Keresés, struktúra elemzés |
| ✅ Web keresés | Best practice kutatás |
| ✅ Memory rendszer | Kontextus mentés session-ök között |
| ✅ Workflow-k | Ismételhető folyamatok |
| ❌ Nem tud böngészőt kezelni | Nem tud kattintani, formot kitölteni |
| ❌ Nem lát screenshotot valós időben | Csak ha beküldöd |

**Mikor használd:** Kód változtatás, DB migration, build, deploy, technikai audit

### 2. Claude Cowork

| Képesség | Példa |
|----------|-------|
| ✅ Hosszú szövegek elemzése | Audit report, üzleti terv |
| ✅ Stratégiai tanácsadás | Go-to-market, pricing, competitor |
| ✅ Content generálás | Email, pitch, program leírás |
| ✅ Dokumentum review | Playbook, ÁSZF, onboarding guide |
| ✅ UX review (screenshot-ból) | Ha képet adsz neki |
| ❌ Nem tud kódot futtatni | Csak javasolni |
| ❌ Nem lát fájlrendszert | Csak amit beadsz neki |

**Mikor használd:** Stratégia, copy, long-form dokumentumok, UX/UI review képekből

### 3. GitHub

| Képesség | Példa |
|----------|-------|
| ✅ CI/CD (automatikus) | Minden push: TS→build→test→DB migration |
| ✅ Issue tracking | Bug reports, feature requests |
| ✅ Pull Request review | Kód review, change tracking |
| ✅ Actions logs | Build hibák debuggolása |

**Mikor használd:** Verziókezelés, automatikus tesztelés, issue tracking

### 4. Supabase Dashboard

| Képesség | Példa |
|----------|-------|
| ✅ SQL Editor | Migration futtatás, adatok lekérdezés |
| ✅ Auth kezelés | User-ök, regisztrációk |
| ✅ Table Editor | Adatok manuális szerkesztése |
| ✅ Edge Functions | Serverless functions deploy |
| ✅ Logs | Error tracking, function logs |
| ✅ Storage | Feltöltött képek kezelése |

**Mikor használd:** DB kezelés, user admin, SQL futtatás, debug

### 5. Lovable

| Képesség | Példa |
|----------|-------|
| ✅ UI prototípus | Gyors design iteráció |
| ✅ Komponens generálás | Új page layout, form design |
| ✅ Visual preview | Azonnali előnézet |
| ❌ Nem integrált a repo-val | Copy-paste szükséges |

**Mikor használd:** Gyors UI prototípus, design variációk, új oldal layout tervezés

---

## Handoff Protocol — Hogyan Kommunikálnak az Agent-ek

### Windsurf → Claude Cowork

```
Te csinálod: Cascade-ben kódolsz → commitolsz → push
Átadás:      Copy-paste a releváns kód/eredmény Claude-ba
Claude:      Elemzi, javasol stratégiát/szöveget
Visszahozod: Claude output-ját Cascade-be implementálod
```

**Példa:** Cascade megcsinálja a Founding Expert badge-et → Te screenshot-ot küldesz Claude-nak → Claude javasol jobb UX szöveget → Te megkéred Cascade-t hogy frissítse

### Claude Cowork → Windsurf

```
Claude:      Generál egy Expert outreach emailt
Te:          Copy-paste a szöveget Cascade-be
Cascade:     Elmenti docs/ mappába vagy implementálja
```

### Windsurf → GitHub (automatikus)

```
Cascade:     git push origin main
GitHub:      CI/CD indul → TS check → build → test → DB migration
Eredmény:    GitHub Actions tab-on látod
```

### Windsurf → Supabase

```
Cascade:     Generál SQL migration fájlt
Te:          Copy-paste a Supabase SQL Editor-ba
Supabase:    Futtatja, eredmény azonnal látható
```

---

## Platform Test Plan — Minden User Journey

### Test User-ök (akiket TE hozol létre)

| # | Email | Szerep | Neve | Cél |
|---|-------|--------|------|-----|
| 1 | `test.expert1@wellagora.org` | Expert | Teszt Szakértő | Expert teljes journey |
| 2 | `test.tag1@wellagora.org` | Member | Teszt Tag | Tag teljes journey |
| 3 | `test.sponsor1@wellagora.org` | Sponsor | Teszt Szponzor | Sponsor teljes journey |
| 4 | `attila.kelemen@proself.org` | Admin | Te | Admin + God Mode |

### Journey 1: EXPERT — Teljes Flow

```
REGISZTRÁCIÓ → PROFIL → TARTALOM → KÖZÖSSÉG → BEVÉTEL
```

| # | Lépés | Oldal | Ellenőrizd |
|---|-------|-------|------------|
| 1.1 | Regisztráció "Szakértő" szereppel | `/auth` | ✅ Sikeres, email megerősítés |
| 1.2 | Profil kitöltése (fotó, bio, szakterület) | `/profil` | ✅ Avatar megjelenik, adatok mentve |
| 1.3 | `grant_founding_expert()` futtatás | Supabase SQL | ✅ Badge megjelenik |
| 1.4 | Expert Stúdió megnyitása | `/expert-studio` | ✅ Navigáció működik |
| 1.5 | Új program létrehozása (ingyenes) | `/expert-studio` | ✅ 4 lépéses wizard végigmegy |
| 1.6 | Program megjelenik a piactéren | `/piacter` | ✅ Kártya látható, szűrhető |
| 1.7 | Poszt írása a közösségi falon | `/kozosseg` | ✅ Poszt megjelenik, badge látható |
| 1.8 | Komment írása másik posztra | `/kozosseg` | ✅ Komment megjelenik |
| 1.9 | WellPoints növekedés | Nav badge | ✅ Pontszám nő minden akcióval |
| 1.10 | Expert↔Tag toggle (dual-role) | Nav toggle | ✅ Nézet vált, menü változik |
| 1.11 | Tag nézetben: program keresés | `/piacter` | ✅ Saját program is látható |
| 1.12 | WellBot megkérdezése | WellBot chat | ✅ Expert-specifikus válasz |
| 1.13 | Értesítések ellenőrzése | `/ertesitesek` | ✅ Enrollment notification |

### Journey 2: TAG — Teljes Flow

```
REGISZTRÁCIÓ → FELFEDEZÉS → ENROLLMENT → KÖZÖSSÉG → VISSZATÉRÉS
```

| # | Lépés | Oldal | Ellenőrizd |
|---|-------|-------|------------|
| 2.1 | Regisztráció "Tag" szereppel | `/auth` | ✅ Sikeres |
| 2.2 | Profil kitöltése | `/profil` | ✅ Adatok mentve |
| 2.3 | Piactér böngészése | `/piacter` | ✅ Programok láthatók, szűrés működik |
| 2.4 | Program részletek megnyitása | `/program/:id` | ✅ Leírás, Expert profil, ár |
| 2.5 | Ingyenes programra feliratkozás | `/program/:id` | ✅ Enrollment sikeres |
| 2.6 | My Agora: feliratkozott programok | `/my-agora` | ✅ Program listában |
| 2.7 | Közösségi fal olvasás + poszt | `/kozosseg` | ✅ Feed betölt, poszt működik |
| 2.8 | Like + komment | `/kozosseg` | ✅ Számláló nő |
| 2.9 | Események böngészése | `/esemenyek` | ✅ Lista betölt |
| 2.10 | Eseményre RSVP | `/esemenyek/:id` | ✅ "Részt veszek" működik |
| 2.11 | WellPoints ellenőrzése | Nav / profil | ✅ Pontok gyűlnek |
| 2.12 | WellBot megkérdezése | WellBot | ✅ Tag-specifikus válasz |
| 2.13 | 7 napos visszatérés | — | ✅ Streak bónusz |

### Journey 3: SZPONZOR — Teljes Flow

```
REGISZTRÁCIÓ → DASHBOARD → KREDIT VÁSÁRLÁS → PROGRAM TÁMOGATÁS
```

| # | Lépés | Oldal | Ellenőrizd |
|---|-------|-------|------------|
| 3.1 | Regisztráció "Támogató" szereppel | `/auth` | ✅ Sikeres |
| 3.2 | Szponzor Dashboard | `/szponzor` | ✅ Kredit egyenleg, statisztikák |
| 3.3 | Kredit csomag vásárlás | `/szponzor` | ✅ Csomag kiválasztás |
| 3.4 | Szponzorált program megtekintése | `/piacter` | ✅ "SZPONZORÁLT" badge |
| 3.5 | Tranzakció történet | `/penzugyeim` | ✅ Lista betölt |
| 3.6 | WellBot tanácsadás | WellBot | ✅ Szponzor-specifikus válasz |

### Journey 4: ADMIN — Teljes Flow

```
GOD MODE → FELHASZNÁLÓK → PROGRAMOK → PÉNZÜGYEK → ANALYTICS
```

| # | Lépés | Oldal | Ellenőrizd |
|---|-------|-------|------------|
| 4.1 | God Mode toggle (minden szerep) | Nav RoleSwitcher | ✅ 4 szerep elérhető |
| 4.2 | Admin Dashboard | `/admin` | ✅ KPI-k betöltenek |
| 4.3 | Felhasználók kezelése | `/admin/users` | ✅ Lista, szűrés |
| 4.4 | Programok moderálása | `/admin/programs` | ✅ Jóváhagyás/elutasítás |
| 4.5 | Pénzügyi összesítő | `/admin/financials` | ✅ Revenue, fees, payouts |
| 4.6 | Események kezelése | `/admin/events` | ✅ RSVP-k láthatók |

### Journey 5: VENDÉG (nem regisztrált)

| # | Lépés | Oldal | Ellenőrizd |
|---|-------|-------|------------|
| 5.1 | Főoldal betöltés | `/` | ✅ Hero, CTA, Expert galéria |
| 5.2 | Piactér böngészése | `/piacter` | ✅ Programok láthatók |
| 5.3 | Program részletek | `/program/:id` | ✅ "Regisztrálj" CTA |
| 5.4 | Események | `/esemenyek` | ✅ Lista betölt |
| 5.5 | Közösség (teaser) | `/kozosseg` | ✅ CommunityTeaser jelenik meg |
| 5.6 | Auth redirect | Bármi védett | ✅ `/auth`-ra irányít |

---

## Cross-Cutting Tesztek

### UI/UX Checklist

| # | Terület | Ellenőrizd |
|---|---------|------------|
| C1 | **Responsive** | Mobile (375px), Tablet (768px), Desktop (1280px) |
| C2 | **Navigation** | Sticky header top-16, nem takarja a tartalmat |
| C3 | **i18n** | HU/EN/DE váltás minden oldalon, nincs hiányzó kulcs |
| C4 | **Dark/Light** | Ha van: konzisztens |
| C5 | **Loading states** | Skeleton-ök megjelennek, nincs üres villanás |
| C6 | **Empty states** | Minden lista üres állapota informatív |
| C7 | **Error states** | Hálózati hiba, 404, jogosultsági hiba |
| C8 | **Mobile Bottom Nav** | Minden szerep menüpontja működik |
| C9 | **Footer** | Megjelenik minden oldalon (kivéve mobile) |
| C10 | **PWA Install** | Banner megjelenik mobile-on |

### Technikai Checklist

| # | Terület | Parancs / Ellenőrzés |
|---|---------|---------------------|
| T1 | TypeScript | `npx tsc --noEmit` — 0 hiba |
| T2 | Build | `npm run build` — 0 hiba |
| T3 | Unit Tests | `npx vitest run` — mind zöld |
| T4 | Bundle size | `dist/` < 2MB |
| T5 | Console errors | DevTools → Console → 0 piros |
| T6 | Network errors | DevTools → Network → 0 piros (4xx/5xx) |
| T7 | Supabase RLS | Más user adatait nem lehet módosítani |
| T8 | Auth token | Lejárat után refresh működik |

---

## Recommended Test Execution Order

```
FÁZIS A: Technikai alap (Windsurf Cascade)
══════════════════════════════════════════
  1. tsc --noEmit
  2. npm run build
  3. vitest run
  4. Console error scan (dev server)
  
FÁZIS B: Journey teszt — Te manuálisan
══════════════════════════════════════════
  5. Journey 5 (Vendég) — legegyszerűbb
  6. Journey 1 (Expert) — legkritikusabb
  7. Journey 2 (Tag) — második legfontosabb
  8. Journey 3 (Szponzor) — ha van idő
  9. Journey 4 (Admin) — God Mode

FÁZIS C: UX Review (Claude Cowork)
══════════════════════════════════════════
  10. Screenshot-ok küldése Claude-nak:
      - Főoldal (vendég nézet)
      - Piactér (programokkal)
      - Expert Stúdió (wizard)
      - Közösségi fal (posztokkal)
      - Mobile nézet (3-4 screenshot)
  11. Claude elemzi: layout, copy, CTA, flow

FÁZIS D: Üzleti validáció (Claude Cowork)
══════════════════════════════════════════
  12. Expert Value Proposition review
  13. Onboarding flow friction analysis
  14. Pricing strategy review
  15. Founding Expert Playbook final review
```

---

## Agent Collaboration Quick Reference

```
┌──────────────┬─────────────────────────────────────────┐
│ Feladat      │ Agent                                   │
├──────────────┼─────────────────────────────────────────┤
│ Bug fix      │ Windsurf Cascade                        │
│ Feature      │ Windsurf Cascade                        │
│ DB migration │ Windsurf (generál) → Supabase (futtat)  │
│ Deploy       │ Windsurf → GitHub Actions (auto)        │
│ UX review    │ Screenshot → Claude Cowork              │
│ Copy/szöveg  │ Claude Cowork → Windsurf (implementál)  │
│ Stratégia    │ Claude Cowork                           │
│ UI prototípus│ Lovable → Windsurf (implementál)        │
│ User admin   │ Supabase Dashboard                      │
│ Monitoring   │ Supabase Logs + GitHub Actions          │
└──────────────┴─────────────────────────────────────────┘
```
