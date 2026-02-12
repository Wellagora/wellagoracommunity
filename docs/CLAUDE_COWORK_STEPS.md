# Claude Cowork — Lépésről Lépésre

> Copy-paste sorrendben. Minden lépésnél másold be a megadott szöveget Claude Cowork-ba.

---

## LÉPÉS 1: Kontextus beadás (ELSŐ üzenet)

Másold be ezt szó szerint:

```
I'm Attila, building WellAgora — a three-sided regional community marketplace for sustainability.

The 3 sides:
- Experts (Creators): sustainability professionals who create programs (workshops, courses)
- Members (Tags): community members who discover and enroll in programs  
- Sponsors: businesses that fund programs for ESG branding

Tech stack: React + TypeScript + Supabase + Stripe. Platform is fully built and deployed.

Business model: 80% revenue to Expert, 20% to Platform.

Current status: Platform is COMPLETE technically. Zero real users yet. We are at Marketplace Maturity Level 1 (Supply Side) — technology is far ahead of the business.

Our launch strategy (4 phases, 12 weeks):
1. SEED (Week 1-3): Recruit 5 Founding Experts personally
2. NURTURE (Week 4-6): Content critical mass (10+ programs, 50+ posts)
3. OPEN (Week 7-9): Tag acquisition through Expert networks
4. GROW (Week 10-12): Flywheel validation

We are currently at the START of Phase 1 — no Experts recruited yet.

I will be asking you for help with: strategy, outreach emails, UX review from screenshots, content creation, and business decisions.

Please confirm you understand the context, then I'll give you specific tasks.
```

**Várd meg Claude válaszát, majd folytasd a 2. lépéssel.**

---

## LÉPÉS 2: Szerepdefiníció (MÁSODIK üzenet)

```
Your role: Senior marketplace & go-to-market advisor.

Rules:
- Be specific and actionable, not generic
- We are a pre-launch startup with 1 developer (me) — recommendations must be executable by 1 person
- Language: Answer in the language I write to you (Hungarian or English)
- No new features — the platform is code-complete
- Supply-first: everything focuses on getting Experts first, Tags second
- No mass marketing until we have content critical mass

Frameworks you should use when relevant:
- a16z Marketplace Maturity Model
- Andrew Chen's Cold Start Theory
- Pirate Metrics (AARRR)
- Jobs to Be Done

I have a Windsurf Cascade AI agent handling all code changes. Your job is THINK — strategy, copy, review. You never need to write code.

Ready for the first task?
```

**Várd meg Claude válaszát.**

---

## LÉPÉS 3: Első feladat — Válaszd ki amit akarsz

### Opció A: Expert megkeresési email

```
Task: Write a personal outreach message in Hungarian for recruiting a Founding Expert.

Target expert: [írd be a nevét, szakterületét, hogyan ismered]
Example: "Kiss Anna, kertészeti szakértő, Facebook csoportja van 500 követővel, személyesen ismerem"

What Founding Experts get:
- Permanent golden "Alapító Szakértő" badge on profile
- 0% platform fee forever (normally 20%)
- Featured placement in marketplace
- Direct input on platform development
- Only 5 spots available

The ask:
- Register on the platform
- Fill out profile (photo, bio, expertise)
- Create 1 free program
- Write 2-3 community posts
- 15-minute personal demo included

Tone: Personal, like a friend recommending something exciting. NOT salesy.
Length: 150-200 words
Format: Message that can be sent via Facebook Messenger or email
```

### Opció B: UX Review (screenshot-okkal)

```
Task: Review these screenshots of WellAgora's key pages.

We're about to onboard our first 5 Founding Experts. 
They need to feel the platform is professional and worth their time.

Review for:
1. First impression — would an Expert want to sign up?
2. CTA clarity — is the next action obvious?
3. Trust signals — does it feel legit?
4. Copy quality — is the Hungarian text motivating?
5. Friction points — where might someone get confused?

For each issue: [Page name] | [Problem] | [Severity: P0/P1/P2] | [Fix suggestion]

[IDE CSATOLD A SCREENSHOT-OKAT]
```

### Opció C: Founding Expert Playbook review

```
Task: Review our Founding Expert Playbook and improve it.

This document will be given to the first 5 Experts who join the platform.
It needs to be clear, motivating, and actionable.

[IDE MÁSOLD BE A docs/FOUNDING_EXPERT_PLAYBOOK.md TELJES TARTALMÁT]

Questions:
1. Would YOU sign up based on this? Why / why not?
2. Is the 2-week action plan realistic for a busy professional?
3. What's missing that would make the offer irresistible?
4. Rate the document 1-10 and list the top 3 improvements.
5. Rewrite the weakest section.
```

### Opció D: Pilot régió stratégia

```
Task: Help me choose the optimal pilot region for WellAgora.

Context:
- I'm based in [te hol laksz / melyik régió]
- The platform targets sustainability-focused local communities
- We need a region where:
  - I personally know 3-5 potential Experts
  - There's existing sustainability activity (markets, workshops, events)
  - Population: 50K-200K (big enough for demand, small enough to be "the" platform)
  - Reachable for in-person Expert onboarding

My options:
- [Régió 1: neve, mérete, mit tudsz róla]
- [Régió 2: neve, mérete, mit tudsz róla]
- [Régió 3: neve, mérete, mit tudsz róla]

Evaluate each using:
1. Expert supply potential (do sustainability pros exist there?)
2. Demand density (is there interest in such programs?)
3. Competition (other platforms serving this niche?)
4. Your operational reach (can you do in-person onboarding?)
5. Growth potential (can it expand to neighboring regions?)

Recommend one region and explain why.
```

---

## KÉSŐBBI LÉPÉSEK (ha kell)

### Folyamatos munka — Eredmények visszahozása Windsurf-be

Amikor Claude ad neked szöveget (email, stratégia, javított Playbook):

1. **Másold ki** Claude output-ját
2. **Windsurf Cascade-ben** mondd: "Mentsd el ezt ide: docs/[fájlnév].md" vagy "Frissítsd a Playbook-ot ezzel a szöveggel"
3. Windsurf implementálja

### Ha Claude screenshot-os UX review-t ad:

1. **Másold ki** a javaslatlistát
2. **Windsurf-ben** mondd: "Implementáld ezeket a UX javításokat: [paste Claude javaslatok]"
3. Windsurf megcsinálja a kódváltoztatásokat

---

## Összefoglaló — Mi Megy Hova

```
LÉPÉS 1 (kontextus)     → Claude megérti a projektet
LÉPÉS 2 (szerep)         → Claude tudja mit várunk tőle
LÉPÉS 3 (első feladat)   → Claude dolgozik

Claude output ──→ Te review-zod ──→ Windsurf implementálja (ha kód kell)
                                  → docs/ mappába mentjük (ha dokumentum)
```
