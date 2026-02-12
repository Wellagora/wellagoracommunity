# WellAgora — Multi-Agent Workflow (Projekt-specifikus)

> Az általános keretrendszer (`GENERIC_MULTI_AGENT_WORKFLOW.md`) WellAgora-ra szabott változata.

---

## Agent Kiosztás — WellAgora

| Kategória | Agent | Konkrét szerep |
|-----------|-------|---------------|
| **CODE** | Windsurf Cascade | Kód, build, test, git, deploy |
| **THINK** | Claude Cowork | Stratégia, UX review, copy, Expert outreach, Playbook |
| **BUILD** | Lovable | UI prototípus, design iteráció |
| **INFRA** | Supabase Dashboard | DB, Auth, SQL migration, user admin |
| **INFRA** | GitHub Actions | CI/CD (automatikus: TS→build→test→DB migration) |

---

## Napi Workflow — Fejlesztés

```
Reggel:
  1. Windsurf: /test-platform (TS, build, tests — 2 perc)
  2. GitHub: Actions tab — utolsó push sikeres?
  3. Supabase: Logs — van-e hiba?

Fejlesztés:
  4. Windsurf: Feature/bugfix implementáció
  5. Windsurf: git push → GitHub CI automatikusan fut

Review:
  6. Claude Cowork: Screenshot-ok küldése → UX feedback
  7. Windsurf: Claude javaslatok implementálása

Este:
  8. Windsurf: /test-platform (végső ellenőrzés)
  9. Git commit + push
```

---

## Feladat → Agent Mapping (WellAgora specifikus)

### Technikai feladatok

| Feladat | Agent | Parancs/Prompt |
|---------|-------|---------------|
| Bug fix | Windsurf | "[leírás] — fix this bug" |
| Új feature | Windsurf | "[user story] — implement this" |
| DB migration | Windsurf (generál) → Supabase (futtat) | SQL fájl copy-paste |
| Build + test | Windsurf | `/test-platform` |
| UX audit | Windsurf | `/audit-ux` |
| Deploy | Git push → GitHub Actions | Automatikus |
| User létrehozás | Supabase Auth | Dashboard → Users |
| Founding Expert grant | Supabase SQL Editor | `SELECT grant_founding_expert('uuid')` |
| Seed content | Supabase SQL Editor | `20260209_pilot_seed_content.sql` futtatás |

### Üzleti feladatok

| Feladat | Agent | Prompt sablon |
|---------|-------|--------------|
| Expert megkeresési email | Claude Cowork | §5.3 Content Generation |
| Szponzor pitch deck szöveg | Claude Cowork | §5.3 Content Generation |
| Pricing stratégia | Claude Cowork | §5.2 Strategy Review |
| Competitor elemzés | Claude Cowork | §5.2 Strategy Review |
| Playbook finomítás | Claude Cowork | "Review and improve this Playbook: [paste]" |
| Program leírás Expert-nek | Claude Cowork | §5.3 Content Generation |

### Design feladatok

| Feladat | Agent | Prompt sablon |
|---------|-------|--------------|
| Új oldal layout | Lovable | §5.6 UI Prototype |
| Landing page variáció | Lovable | §5.6 UI Prototype |
| Email template design | Lovable | §5.6 UI Prototype |
| Implementáció | Lovable output → Windsurf | Copy-paste + adaptáció |

---

## User Journey Teszt — Agent Kiosztás

### Fázis A: Technikai (Windsurf)

```
Windsurf: /test-platform
  → tsc --noEmit         ✅/❌
  → npm run build        ✅/❌
  → vitest run           ✅/❌
```

### Fázis B: Manuális Journey (Te + Supabase)

```
Supabase: Test user-ök létrehozása
  → test.expert1@wellagora.org (Expert)
  → test.tag1@wellagora.org (Member)
  → test.sponsor1@wellagora.org (Sponsor)

Supabase SQL: 
  → SELECT grant_founding_expert('expert-uuid');
  → Seed content futtatás

Te a böngészőben:
  → Journey 1: Expert flow (13 lépés)
  → Journey 2: Tag flow (13 lépés)
  → Journey 3: Szponzor flow (6 lépés)
  → Journey 4: Admin flow (6 lépés)
  → Journey 5: Vendég flow (6 lépés)
  → Közben: screenshot-ok készítése
```

### Fázis C: UX Review (Claude Cowork)

```
Te → Claude Cowork:

"Here are screenshots of WellAgora's key pages. 
This is a three-sided sustainability marketplace (Experts, Members, Sponsors).
We're preparing for pilot launch with 5 Founding Experts.

Please review for:
1. First impression — would an Expert want to use this?
2. CTA clarity — is the next action obvious on every page?
3. Trust signals — does the platform feel professional?
4. Copy quality — is the Hungarian text clear and motivating?
5. Mobile readiness — any layout concerns?

For each issue: Page, Problem, Severity (P0/P1/P2), Fix suggestion."

[Screenshot-ok csatolása]
```

### Fázis D: Üzleti Validáció (Claude Cowork)

```
Te → Claude Cowork:

"Review our Founding Expert Playbook and outreach strategy.

Context: [paste CLAUDE_COWORK_BRIEFING.md]

Playbook: [paste FOUNDING_EXPERT_PLAYBOOK.md]

Questions:
1. Would YOU sign up as a Founding Expert based on this Playbook?
2. What's missing that would make the offer irresistible?
3. Is the 2-week action plan realistic?
4. Rate the outreach script (1-10) and improve it.
5. What's the #1 risk in our SEED phase?"
```

---

## Konkrét Promptok Claude Cowork-nak

### Expert Megkeresési Email (HU)

```
Write a personal outreach email in Hungarian for recruiting 
Founding Experts to WellAgora.

Context: WellAgora is a regional community marketplace for sustainability.
We're inviting the first 5 experts who get permanent privileges.

Target: [Expert neve], [szakterülete], [hogyan ismered]

Tone: Personal, respectful, not salesy. Like a friend recommending something.
Length: 150-200 words
Language: Hungarian

Must include:
- Why THEM specifically (personalized)
- The Founding Expert privilege (permanent badge, 0% fee)
- It's free to start
- Personal demo offer (15 min screenshare)
- Urgency: only 5 spots

Must NOT include:
- Generic marketing language
- Technical details
- Pressure tactics
```

### Szponzor Pitch (HU)

```
Write a sponsor pitch email in Hungarian for WellAgora.

Context: WellAgora is a regional sustainability marketplace.
We're looking for 1-2 local sponsors who want ESG visibility.

Target: [Cég neve], [iparág], [méret]

Offer:
- Logo on sponsored programs
- "Szponzorált" badge on events
- Local community visibility
- ESG reporting data

Tone: Professional, data-driven
Length: 200-250 words
Language: Hungarian
```

### Program Leírás Segítség Expert-nek

```
Help a sustainability expert write their first program description 
for the WellAgora marketplace.

Expert's topic: [téma, pl. "szezonális főzés helyi alapanyagokból"]
Expert's style: [pl. "praktikus, személyes, tapasztalat-alapú"]
Program type: [élő workshop / online webinar / on-demand]
Duration: [időtartam]
Price: Free (first program)
Language: Hungarian

Write:
1. Catchy title (max 60 chars)
2. Short description (max 150 chars — this appears on the card)
3. Full description (300-500 words — this appears on the detail page)
4. 3-5 bullet points: "Amit tanulni fogsz"
5. Target audience description (1 sentence)

Tone: Warm, approachable, expertise shows through stories not credentials.
```

---

## Hibakezelés — Melyik Agent-et Hívd?

| Hiba típus | Első agent | Ha nem oldja meg |
|-----------|-----------|-----------------|
| Build error | Windsurf | — (mindig megoldja) |
| Console error | Windsurf | Screenshot → Claude (ha logikai) |
| UI csúnya | Screenshot → Claude | Lovable (prototípus) → Windsurf |
| DB hiba | Supabase Logs | Windsurf (migration fix) |
| Deploy fail | GitHub Actions log | Windsurf (config fix) |
| Expert nem érti a platformot | Claude (UX review) | Playbook frissítés (Claude→Windsurf) |
| Nincs elég tartalom | Claude (content strategy) | Te (Expert coaching) |
| Szponzor nem reagál | Claude (pitch javítás) | Te (személyes megkeresés) |

---

## Fájl Struktúra — Dokumentumok

```
docs/
├── GENERIC_MULTI_AGENT_WORKFLOW.md    ← Általános sablon (bármely projektre)
├── WELLAGORA_AGENT_WORKFLOW.md        ← Ez a fájl (WellAgora-specifikus)
├── CLAUDE_COWORK_BRIEFING.md          ← Claude Cowork-nak adandó kontextus
├── FOUNDING_EXPERT_PLAYBOOK.md        ← Expert-eknek adandó útmutató
└── MULTI_AGENT_WORKFLOW.md            ← Korábbi teszt plan (journey-k)
```

---

*Verzió: 1.0 — 2026. február*
