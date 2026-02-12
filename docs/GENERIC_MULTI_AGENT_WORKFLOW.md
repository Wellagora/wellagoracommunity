# Multi-Agent Development Workflow — Generic Template

> Általános keretrendszer AI agent-ek együttműködéséhez szoftverfejlesztési projektekben.
> Adaptálható bármilyen stack-re, bármilyen agent kombinációra.

---

## 1. Agent Taxonómia

Minden AI agent 4 kategóriába sorolható:

### A) CODE Agent — Kódot ír, szerkeszt, futtat

| Képesség | Példák |
|----------|--------|
| Fájl olvasás/írás/szerkesztés | Windsurf Cascade, Cursor, GitHub Copilot, Aider |
| Terminal parancsok futtatása | Windsurf Cascade, Cursor |
| Build, test, deploy | Windsurf Cascade + CI/CD |
| Fájlrendszer navigáció | Windsurf Cascade, Cursor |

**Mikor használd:** Bug fix, feature implementáció, refactor, migration, build, deploy

### B) THINK Agent — Elemez, stratégizál, review-z

| Képesség | Példák |
|----------|--------|
| Hosszú dokumentum elemzés | Claude, ChatGPT, Gemini |
| Stratégiai tanácsadás | Claude Cowork, ChatGPT |
| Kód review (nem futtat) | Claude, ChatGPT |
| UX review screenshot-ból | Claude, ChatGPT, Gemini |
| Content generálás | Claude, ChatGPT |

**Mikor használd:** Stratégia, üzleti döntés, copy, UX review, dokumentáció, brainstorming

### C) BUILD Agent — UI/design generálás

| Képesség | Példák |
|----------|--------|
| UI prototípus | Lovable, v0.dev, Bolt |
| Komponens generálás | Lovable, v0.dev |
| Visual preview | Lovable, v0.dev |

**Mikor használd:** Gyors UI prototípus, design variáció, új oldal layout

### D) INFRA Agent — Háttérrendszer kezelés

| Képesség | Példák |
|----------|--------|
| Adatbázis kezelés | Supabase Dashboard, PlanetScale, Neon |
| CI/CD pipeline | GitHub Actions, Vercel, Netlify |
| Monitoring | Supabase Logs, Sentry, Vercel Analytics |
| Auth/User kezelés | Supabase Auth, Clerk, Auth0 |

**Mikor használd:** DB migration, user admin, deploy, monitoring, log elemzés

---

## 2. Döntési Fa — Melyik Agent-et Használd?

```
Feladat érkezik
│
├── Kódot kell írni/módosítani?
│   ├── Igen → CODE Agent (Windsurf/Cursor)
│   └── Nem ↓
│
├── Gondolkodni/elemezni/szöveget írni kell?
│   ├── Igen → THINK Agent (Claude/ChatGPT)
│   └── Nem ↓
│
├── UI-t kell tervezni/prototipizálni?
│   ├── Igen → BUILD Agent (Lovable/v0)
│   └── Nem ↓
│
├── DB/deploy/infrastruktúra?
│   ├── Igen → INFRA Agent (Supabase/GitHub)
│   └── Nem ↓
│
└── Komplex feladat → Több agent együttműködés (lásd §3)
```

---

## 3. Együttműködési Minták (Collaboration Patterns)

### Pattern 1: SERIAL — Soros végrehajtás

```
Agent A output → Ember review → Agent B input
```

**Példa:** Claude ír egy email sablont → Te jóváhagyod → Windsurf elmenti fájlba

**Mikor:** Egyik agent output-ja a másik input-ja. Minőségellenőrzés kell közben.

### Pattern 2: PARALLEL — Párhuzamos végrehajtás

```
Feladat ──┬── Agent A (rész 1)
           └── Agent B (rész 2)
                     ↓
              Ember összefésüli
```

**Példa:** Windsurf kódot ír + Claude marketing szöveget ír → Te összefésülöd

**Mikor:** Független részfeladatok, időnyerés.

### Pattern 3: REVIEW — Ellenőrzés

```
Agent A (alkot) → Ember → Agent B (review-z) → Ember → Agent A (javít)
```

**Példa:** Windsurf feature-t implementál → Screenshot Claude-nak → Claude UX javaslatokat ad → Windsurf javít

**Mikor:** Minőségbiztosítás, UX/copy finomhangolás.

### Pattern 4: ESCALATION — Eszkaláció

```
Agent A "elakad" → Ember → Agent B (más perspektíva)
```

**Példa:** Windsurf nem tud megoldani egy architektúra kérdést → Claude-tól kérsz stratégiai tanácsot → Visszahozod Windsurf-be

**Mikor:** Komplex döntés, ahol más nézőpont kell.

### Pattern 5: LOOP — Iteratív ciklus

```
Agent A → Ember → Agent B → Ember → Agent A → ...
```

**Példa:** Lovable UI prototípus → Claude UX review → Lovable javít → Claude újra review-z → Windsurf implementálja a végső verziót

**Mikor:** Design iteráció, tartalom finomítás.

---

## 4. Handoff Protocol — Átadás Agent-ek Között

### Az "Átadó Csomag" tartalma

Minden agent váltásnál Te (az Ember) készíted el az átadó csomagot:

```markdown
## Átadó Csomag Template

### Kontextus
- Projekt: [projekt neve]
- Jelenlegi feladat: [mit csinálunk]
- Előző agent: [ki dolgozott rajta]

### Állapot
- Mit csinált az előző agent: [összefoglaló]
- Mi kész: [lista]
- Mi nincs kész: [lista]

### Kérés az új agent-nek
- Feladat: [konkrét kérés]
- Input: [fájlok, screenshot-ok, szöveg]
- Elvárt output: [mit várunk]

### Korlátok
- Ne csinálj: [amit nem szabad]
- Formátum: [elvárt output formátum]
```

### Átadás Cheat Sheet

| Honnan → Hova | Mit adj át |
|---------------|-----------|
| CODE → THINK | Kód snippet, error log, screenshot, kérdés |
| THINK → CODE | Stratégia összefoglaló, szöveg, döntés, implementálandó lista |
| CODE → INFRA | SQL migration fájl, deploy parancs |
| INFRA → CODE | DB schema változás, error log |
| BUILD → CODE | UI design screenshot/kód, komponens specifikáció |
| THINK → BUILD | UX javaslatok, wireframe leírás |

---

## 5. Prompt Sablon Könyvtár

### 5.1 THINK Agent — UX Review

```
I'm showing you screenshots of [app name]'s key pages.
Please review for:
1. Layout consistency and visual hierarchy
2. CTA clarity and placement
3. Copy quality (clear, actionable, no jargon)
4. Mobile responsiveness concerns (based on layout)
5. User flow friction points

For each issue found, specify:
- Page/area
- Problem
- Severity (critical/medium/low)
- Suggested fix

Screenshots: [paste images]
```

### 5.2 THINK Agent — Strategy Review

```
Context: [project briefing]

Current situation: [where we are]

Question: [specific strategic question]

Please analyze using:
1. Relevant frameworks (e.g., Porter's 5 Forces, Jobs to Be Done, etc.)
2. Comparable marketplace examples
3. Risk assessment (probability × impact)
4. Concrete, actionable recommendations (not generic advice)

Constraint: We are a [stage] startup with [resources]. Recommendations must be executable within [timeframe].
```

### 5.3 THINK Agent — Content Generation

```
Write [content type] for [audience].

Context: [brief project/product description]

Tone: [professional/casual/inspirational]
Language: [language]
Length: [word count or format]

Must include:
- [key point 1]
- [key point 2]
- [CTA]

Must NOT include:
- [what to avoid]

Reference examples: [if any]
```

### 5.4 CODE Agent — Bug Fix

```
Bug: [description]
Expected behavior: [what should happen]
Actual behavior: [what happens]
Steps to reproduce: [1, 2, 3]
Relevant files: [file paths]

Fix approach: Diagnose root cause first, then implement minimal fix.
Do NOT refactor unrelated code.
Add a regression test if applicable.
```

### 5.5 CODE Agent — Feature Implementation

```
Feature: [name]
User story: As a [role], I want [action] so that [benefit].

Requirements:
- [req 1]
- [req 2]

Technical constraints:
- Follow existing patterns in [reference file]
- i18n: [languages]
- Database: [DB-first, no hardcoded data]

Acceptance criteria:
- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] Build passes
- [ ] Tests pass
```

### 5.6 BUILD Agent — UI Prototype

```
Create a [page/component] for [app name].

Purpose: [what the user does here]
User role: [who uses it]

Requirements:
- [layout description]
- [key elements]
- [interactions]

Style: [framework — e.g., TailwindCSS, shadcn/ui]
Theme: [light/dark, color scheme]
Responsive: [mobile-first / desktop-first]

Reference: [screenshot or URL of similar design]
```

---

## 6. Quality Gate — Mielőtt Kész

Minden jelentős változás előtt futtasd végig:

```
□ CODE Agent: Build passes (0 errors)
□ CODE Agent: Tests pass (0 failures)
□ CODE Agent: No console errors in browser
□ THINK Agent: UX review done (screenshot-based)
□ THINK Agent: Copy/content reviewed
□ INFRA Agent: DB migration tested
□ INFRA Agent: Deploy successful
□ EMBER: Manual smoke test (key user journey)
```

---

## 7. Anti-Patterns — Amit NE Csinálj

| Anti-Pattern | Miért rossz | Helyette |
|-------------|-------------|---------|
| **Agent ping-pong** | A→B→A→B→... végtelen loop | Állj meg, döntsd el Te, majd adj egyértelmű instrukciót |
| **Context loss** | Agent nem tudja mit csinált a másik | Mindig adj átadó csomagot |
| **Over-delegation** | Mindent agent-re bízol | Te vagy a döntéshozó, agent = eszköz |
| **Wrong agent** | THINK agent-tel kódolsz | Használd a döntési fát (§2) |
| **No human review** | Agent output → production | Mindig review-zd mielőtt elfogadod |
| **Parallel conflict** | 2 agent ugyanazt a fájlt szerkeszti | Soha ne adj 2 CODE agent-nek ugyanazt a fájlt |

---

*Verzió: 1.0 — 2026. február*
*Szerző: WellAgora fejlesztői csapat*
*Licenc: Szabadon adaptálható bármilyen projektre*
