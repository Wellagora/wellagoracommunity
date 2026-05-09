# Community Insights for Creators — feature spec

**Belső kódnév:** "WellBot 2. réteg" / Insights
**Spec dátum:** 2026-05-08
**Hatókör:** új feature a meglévő WellBot köré, NEM teljes átírás
**Becsült build:** MVP 1-2 sprint (8-12 fejlesztői nap)

---

## 1. Probléma — amit Attila felismert

> *"A WellBot a fő funkció, amit fontosnak tartok, mert tudom ebből, mi foglalkoztatja a közösséget, mit kérdeznek. Szerintem ebben még több lehetőség, mint eddig gondoltuk."*

A WellBot-ba érkező kérdések jelenleg egy **passzív log**: az `ai_messages` táblában landolnak, ott ülnek. Senki nem aggregálja, senki nem tanul belőlük. Pedig ez a Wellagora egyik **legértékesebb saját adatforrása** — közvetlen jelek arról, hogy a közösség mit szeretne tudni, mire keres megoldást, milyen témák körül van energia.

Három szereplőnek lenne ebből konkrét értéke:

- **Creator (expert/publisher)**: *"Mit kérdeznek tőlem indirekt? Milyen témák körül van keresés, ahol én tudnék programot építeni?"*
- **Admin / platform-operátor**: *"Hol van content-gap? Mit kérdez a közösség, amire jelenleg nincs program?"*
- **B2B vásárló (CSR-vezető)**: *"Releváns-e a Wellagora a mi célközösségünknek? Tényleg kérdezik a fenntarthatósági témákat, vagy ez csak a marketing?"*

**A jelenlegi rendszer egyiknek sem szolgál ki adatot.** Ezt változtatja meg a feature.

---

## 2. Személyek (perszóna), amelyek jelennek meg a flow-ban

### 2.1 Creator (Anna, 38, 'Kézműves szappanok' expert)
Heti 2-3 órát tud foglalkozni a Wellagora-val. Szeretné tudni, hogy mire van valós kereslet, mielőtt új programot épít. Most a "mit posztoljak?" kérdést Instagram-trendből és érzésből dönti el. **Adat-vezérelt témajavaslat dramatikusan nagyobb hatékonyságot ad neki.**

### 2.2 Admin (Béla, platform-operátor)
Heti 1-2 órát ad a platformnak. Szeretne látni egy *"emerging topics"* listát: mit kérdez a közösség, amire jelenleg nincs vagy alig van program. **Ezt használja outreach-hez creator-okhoz.**

### 2.3 B2B vásárló (Csilla, CSR-vezető egy 200 fős AT-cégnél)
Egyszer évente nézi meg a Wellagorát, döntést hoz a CSR-támogatásról. Skeptikus, számokat akar. *"Hány felhasználó kérdez ténylegesen fenntarthatóságról a platformon? Miről kérdez?"* — **bizalmat épít, ha látja az aggregált adatokat.**

---

## 3. User stories (priorizálva)

### MVP-be (P0)

**US-1 (Creator)**: *Mint creator, szeretném látni egy heti email-ben vagy a dashboard-omon, hogy a saját szakterületem (= kategória, amelyben programjaim vannak) mely témáit kérdezte a közösség az elmúlt 7 napban — hogy témajavaslatot kapjak az új programjaimhoz.*

**US-2 (Admin)**: *Mint admin, szeretnék az admin dashboardon egy "Emerging topics" panelt látni, amely mutatja, hogy mely témák voltak a leggyakoribb kérdezettek az elmúlt 30 napban, és melyikre nincs jelenleg program — hogy creator-okat tudjak meghívni.*

### Post-MVP (P1)

**US-3 (Creator detail)**: *Mint creator, szeretném látni egy konkrét témához (pl. "téli komposztálás") tartozó kérdés-pattern-eket — anonimizálva, hogy ne legyen visszafejthető —, hogy értsem milyen szögből nyúlnak hozzá a felhasználók.*

**US-4 (B2B sponsor view)**: *Mint sponsor, szeretnék egy negyedéves riportot a támogatott projektem alatti közösség-aktivitásról: mit kérdeznek, mely program-ajánlások mentek végbe — hogy a saját CSR-jelentésemben dokumentálni tudjam.*

**US-5 (WellBot self-improvement)**: *Mint platform, szeretném tudni mely kérdésekre nem volt jó válasz (=user nem nyitott program-link-et, gyors elhagyta a chat-et), hogy javítsam a WellBot ajánlási minőségét.*

### Nincs scope-ban (out)

- Public leaderboard ("ki a legnépszerűbb creator") — kerülendő, mivel a Care+DNA tanulság szerint **versenyt nem kelti** a platformon (anti-pattern).
- Egyéni felhasználó-profil más felhasználók számára (privacy-veszélyes).
- Real-time értesítések ("éppen most kérdezett valaki") — túl invazív, post-MVP.

---

## 4. Adat-architektúra

### 4.1 Meglévő adatforrás
Már létezik: `ai_conversations` + `ai_messages` táblák. A `ai-chat` Supabase function ide ír minden kérdést és választ. **Tehát a nyers anyag rendelkezésre áll, csak strukturálni kell.**

### 4.2 Új táblák / view-k

```sql
-- Téma-extrakciós eredmény: minden user-kérdéshez 1-3 témacímke
CREATE TABLE wellbot_message_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES ai_messages(id) ON DELETE CASCADE,
  topic_slug TEXT NOT NULL,            -- pl. 'composting-winter', 'no-dig-gardening'
  topic_label TEXT NOT NULL,           -- pl. 'Téli komposztálás'
  category_slug TEXT,                  -- a Wellagora kategória-rendszeréből (pl. 'gasztronomia')
  confidence NUMERIC(3,2),             -- 0.00 - 1.00
  language TEXT,                       -- 'hu', 'en', 'de'
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_message_topics_topic ON wellbot_message_topics(topic_slug);
CREATE INDEX idx_message_topics_category ON wellbot_message_topics(category_slug);
CREATE INDEX idx_message_topics_created ON wellbot_message_topics(created_at);

-- Heti aggregáció — ez az, ami a creator-ok elé kerül (k≥X küszöb!)
CREATE TABLE wellbot_topic_weekly_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  topic_slug TEXT NOT NULL,
  topic_label TEXT NOT NULL,
  category_slug TEXT,
  question_count INT NOT NULL,         -- HÁNY kérdés érintette
  unique_user_count INT NOT NULL,      -- HÁNY KÜLÖNBÖZŐ user kérdezett — k≥X védelem
  has_existing_program BOOLEAN,        -- van-e már program ehhez a témához
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (week_start, topic_slug)
);
CREATE INDEX idx_topic_aggregate_week ON wellbot_topic_weekly_aggregate(week_start);
CREATE INDEX idx_topic_aggregate_category ON wellbot_topic_weekly_aggregate(category_slug);

-- Creator-személyre szabott view: csak a saját kategóriáit látja, csak ha k≥X
CREATE OR REPLACE FUNCTION get_creator_insights(_creator_id UUID, _weeks_back INT DEFAULT 4)
RETURNS TABLE (
  week_start DATE,
  topic_label TEXT,
  category_slug TEXT,
  question_count INT,
  unique_user_count INT,
  has_existing_program BOOLEAN
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT week_start, topic_label, category_slug, question_count, unique_user_count, has_existing_program
  FROM wellbot_topic_weekly_aggregate
  WHERE category_slug IN (
    SELECT DISTINCT category FROM expert_contents WHERE creator_id = _creator_id
  )
  AND unique_user_count >= 3                       -- k≥3 anonimitás-küszöb
  AND week_start >= CURRENT_DATE - (_weeks_back * 7);
$$;
```

**Privacy-jegyzet (Care+DNA tanulság közvetlen alkalmazása):** a `unique_user_count >= 3` küszöb **strukturálisan** garantálja, hogy egy creator soha nem tudja "kit kérdezte ezt" — csak az aggregált jelet látja. Ez nem szabályzati ígéret, hanem a SECURITY DEFINER függvényben lefixált kapu. Care-ben ez `k≥5` volt, itt `k≥3` is elég, mert a Wellagora közösség kisebb és az adatok kevésbé érzékenyek (nem mentális egészség).

### 4.3 Topic-extrakciós pipeline

A `ai_messages` tábla `INSERT` trigger-jén egy nightly cron-job (Supabase scheduled function vagy egy GitHub Action) végigfut:
1. Csak az **újonnan beérkezett user-üzeneteken** dolgozik (delta-feldolgozás, idempotens).
2. Egy AI-modell (Gemini vagy Claude Haiku) **kategória-meghatározást és témacímkézést** végez. Strukturált output (JSON):
   ```json
   { "topics": [{ "slug": "composting-winter", "label": "Téli komposztálás", "confidence": 0.85, "category": "gasztronomia" }] }
   ```
3. Beír a `wellbot_message_topics` táblába.
4. Hetente egyszer (pl. vasárnap éjjel) a `wellbot_topic_weekly_aggregate`-be aggregál.

**Költség-becslés:** ~500-1000 user-üzenet/nap pre-launch szakaszban × ~200 token/üzenet × $0.15/M token (Haiku) = **napi $0.05-0.10**. Nem szignifikáns.

### 4.4 Topic taxonómia kérdés

Két opció:
- **(a) Szabad-szöveg slug**: az AI generálja a topic_slug-okat, amelyek később összeolvadnak / tisztulnak.
- **(b) Előre definiált taxonómia**: 50-100 fix topic, az AI csak választ közülük.

**Javaslat: (a) MVP-ben, a 4-6. hét után elemzés, és (b)-re átállás** ha a slug-ok kaotikusak. Ez tipikus pre-emergent design pattern.

---

## 5. UI / UX

### 5.1 Creator dashboard — új panel

**Hely:** `Expert Studio → Analytics oldal` egy új tab: *"Közösségi jelek"* / *"Community Signals"*.

**Tartalom (mockup-szövegben):**

```
─────────────────────────────────────────────────────────────────
KÖZÖSSÉGI JELEK   |   az utolsó 4 hét                  [ ⓘ Mi ez? ]
─────────────────────────────────────────────────────────────────

A te szakterületeden — Gasztronómia és Életmód — ezek a témák
kerültek elő a közösségi kérdésekben:

╔═══════════════════════════════════════════════════════════════╗
║ Téma                    Kérdezte    Saját programod?          ║
║───────────────────────────────────────────────────────────────║
║ Téli komposztálás            12         ✗ — nincs még          ║
║ Vegán reggelik gyerekeknek    8         ✓ "Kis kukták" prog.   ║
║ Kovászos kenyér tárolása      6         ✗                      ║
║ Hulladék-mentes konyha        5         ✓ "Zero-waste" prog.   ║
╚═══════════════════════════════════════════════════════════════╝

Mit jelent ez?
A WellBot a közösségi kérdésekből aggregálja a témákat. Csak
azok jelennek meg itt, amelyekre legalább 3 különböző felhasználó
kérdezett — egyéni felhasználói adatot soha nem látsz.

Új program ötlet?       [ Új program létrehozása ]
─────────────────────────────────────────────────────────────────
```

**Empty state**: ha az adott creator kategóriájában nem volt elég kérdés:

> *Ezen a héten még nem jött össze elég kérdés a szakterületeden ahhoz, hogy mintát mutassunk. Ez normál a platform indulási szakaszában. Nézz vissza a következő héten.*

### 5.2 Admin dashboard — Emerging topics panel

**Hely:** `Admin → Settings vagy új Admin → Insights oldal`.

**Tartalom:** ugyanaz a struktúra, de **kategória-szűrő nélkül** (admin lát mindent), és külön kiemelve azok a témák, amelyekre **nincs program** (`has_existing_program = false`). Ez a content-gap lista.

### 5.3 B2B sponsor view (post-MVP, P1)

Sponsor dashboardján egy negyedéves PDF letöltés-gomb: *"Q1 közösségi aktivitás riport"*. A PDF tartalma az aggregált adatokat formálja közérthető szöveggé (szintén AI-generálva, brand-voice-szal).

---

## 6. WellBot integráció — új function calling tools

A meglévő `ai-chat` Supabase function `tools` listájához hozzá kell adni:

```ts
{
  name: "getEmergingTopics",
  description: "Get topics that have been frequently asked in the community recently. Use when a creator asks 'what should I create' or 'what is the community asking about'.",
  parameters: {
    type: "object",
    properties: {
      category: { type: "string", description: "Optional category filter" },
      weeksBack: { type: "number", description: "How many weeks back (default: 4)" },
    },
  },
},
```

Ez azt jelenti, hogy a creator a **WellBot-ban közvetlenül is megkérdezheti**: *"Mire kérdez a közösség mostanában?"* — és az AI a `getEmergingTopics` tool-t hívja, megkapja az aggregált adatokat, és narratívan visszaadja.

**Ez a feature két felületet egyesít** (dashboard vizuális + WellBot természetes nyelvű) — a Care-tanulság: *"automatikus AI-üzenet azonnal indul el"* itt is alkalmazható, ha a creator-onboarding végén a WellBot proaktívan kínálja: *"Szeretnéd, hogy mutassak közösségi jeleket a szakterületedről?"*

---

## 7. AI prompt-stratégia (téma-extrakcióhoz)

### 7.1 System prompt kerete (Claude Haiku-ra hangolva, de Gemini Flash is működik)

```
Te egy téma-osztályozó vagy a Wellagora fenntarthatósági közösségi platformon.
A bemenet egy felhasználói kérdés a WellBot-hoz.
A feladatod: 1-3 fő téma azonosítása, és a Wellagora kategória-rendszerében elhelyezése.

KATEGÓRIÁK: életmód, kézműves, gasztronómia, jól-lét, kert, energia, közösség, oktatás
[a tényleges lista a CATEGORIES konstansból kerül ide a function build-time-ban]

OUTPUT: JSON only, no narrative text:
{
  "topics": [
    { "slug": "kebab-case-id", "label": "Magyar címke", "category": "kategoria-slug", "confidence": 0.0-1.0 }
  ]
}

SZABÁLYOK:
- A slug stabil legyen, az ugyanazt jelentő kérdéseknek ugyanaz a slug-ja
- Ha a kérdés irreleváns vagy túl általános, üres "topics": [] tömb
- Confidence < 0.5 esetén ne is jelenjen meg
- A label brand-voice-ban: ténymegállapító, nem buzdító, nincs felkiáltójel
```

### 7.2 Brand-voice szabály a Claude rendszerprompt-jába (a creator-felé szóló summary-knál)

A creator-dashboard text-summary-jaiban (pl. *"Ezen a héten 12 felhasználó érdeklődött a téli komposztálás iránt — érdemes lehet program-tervezést indítani"*) **ugyanaz a TILTOTT/KÍVÁNATOS szókincs lista alkalmazandó, mint a Care-progress-narrative route-ban** (lásd `PLATFORM-LESSONS-LEARNED-2026-05-08.md`):

- **Tiltott:** *"szuper", "szép munka", "ez nem semmi", "ne add fel"*, felkiáltójel, emoji
- **Kívánatos:** *"érdemes lehet"*, *"megfontolandó"*, *"körvonalazódik"*, *"figyelemre méltó"*

Ezt a `ai-chat` function és az aggregator-prompt is örökölje — egyetlen helyen szerkeszthető (a `_shared/voice-rules.ts` fájlból).

---

## 8. Privacy és etika

### 8.1 Strukturális anonimitás (Care+DNA core)
- `unique_user_count >= 3` kemény küszöb a `get_creator_insights` SECURITY DEFINER függvényben.
- A creator **nem látja** a kérdés szövegét, csak a téma-aggregátumot.
- A timestamp granularitása heti, nem napi (különben kis közösségben azonosítható).

### 8.2 Felhasználói tájékoztatás
- A **WellBot-onboarding első üzenete** mondja el: *"A kérdéseid anonim formában segítenek a creator-oknak abban, hogy releváns programokat tervezzenek. Egyéni adatot soha nem osztunk meg."*
- A platform Privacy oldalán bővítendő szakasz: *"Hogyan használjuk a WellBot-beszélgetéseket aggregált insights céljára"*.
- Opt-out: minden user beállíthatja, hogy a kérdéseit ne számoljuk az aggregátumba (Profile → Privacy beállítás).

### 8.3 Adat-megőrzés
- Nyers `ai_messages` tartalom: 12 hónap után automatikusan anonimizálva (`user_id = NULL`).
- Aggregátum (`wellbot_topic_weekly_aggregate`): határozatlan ideig megmarad — ez már aggregált, nem érzékeny.

---

## 9. MVP scope (1-2 sprint, ~10 nap)

### Sprint X (8 nap)
- [ ] Supabase migration: új táblák + függvények
- [ ] Topic-extraction Supabase function (delta cron, Gemini Flash vagy Claude Haiku)
- [ ] Heti aggregátor cron-job
- [ ] Creator dashboard panel (`Expert Analytics → Community Signals` tab)
- [ ] Admin Insights panel
- [ ] WellBot új function `getEmergingTopics`
- [ ] WellBot tájékoztató szöveg (privacy)
- [ ] Brand-voice rules közös `_shared/voice-rules.ts`

### Sprint X+1 (4 nap, polish)
- [ ] Empty state szövegek (HU + EN/DE i18n)
- [ ] Creator onboarding-flow proaktív WellBot-üzenet (*"szeretnéd a jeleket?"*)
- [ ] Profile → Privacy opt-out toggle
- [ ] Smoke test élesben (Care-tanulság: kötelező mental walkthrough az 1./7./30. napi felhasználóként)
- [ ] Dokumentáció: `docs/wellbot-insights.md` — a creator-oknak hogyan használja

### Post-MVP roadmap
- US-3 (Creator detail kérdés-pattern-ek anonimizálva)
- US-4 (B2B sponsor PDF riport, negyedéves)
- US-5 (WellBot self-improvement: válasz-minőség mérés)
- Topic-taxonómia tisztítás / curation UI admin-nak

---

## 10. Sikermutatók

- **Creator-engagement**: hány %-a a creator-oknak nyitja meg a Community Signals tab-ot heti egyszer? Cél: >40%.
- **Conversion**: hány új program készült 30 napon belül egy "Emerging topic" szignál hatására? Cél: 1-2 program / hónap pre-launch szakaszban.
- **WellBot retention**: nő-e a WellBot weekly active users (`getEmergingTopics` használata után gyakrabban tér vissza creator)? Cél: +20%.
- **B2B story**: a sponsor pitch deck-be bekerül egy "X téma, Y kérdés / hét" konkrét adat. Erre ne legyen mock — valós adat kell. A Carbon Handprint mellett ez egy második **PROOF point**.

---

## 11. Kockázatok és mitigáció

| Kockázat | Mitigáció |
|---|---|
| **Sparse data** — kevés a kérdés, k≥3 ritkán teljesül | MVP indulásakor a creator-oknak transzparensen kommunikálni: "indulási szakaszban kevesebb jel jön — havi nézés ajánlott". A küszöb 4-6 hét után újra-mérlegelhető. |
| **Téma-slug-kaosz** — az AI különböző címkékkel azonos témákra | Havi admin-curation UI a slug-merge-eléshez |
| **Privacy panic** — egy felhasználó azt érzi, hogy "kihallgatják" | Explicit beleegyezés a WellBot első üzenetében + opt-out + Privacy oldal frissítés |
| **WellBot költség robban** — ha 10× annyi kérdés, mint becsültem | Téma-extrakció batch-elve (napi cron, nem real-time) → előre tervezhető cost |
| **Creator-bizalmatlanság** — "nem hiszem el a számot" | Az aggregátum mellé link a saját kategóriaja kérdéseinek **HÉTI volumenére** is — kontextus a számhoz |
| **Gemini → Claude váltás** | A téma-extrakció model-független — egy ENV-változón keresztül cserélhető. (Pre-launch ne váltsunk; production-ban érdemes Anthropic-ra váltani a prompt cache miatt) |

---

## 12. Döntések — bezárva 2026-05-08

| # | Kérdés | Döntés |
|---|---|---|
| 1 | Topic-taxonómia | **Szabad-szöveg slug az MVP-ben.** 4-6 hét után újra-mérlegelés admin curation UI-val. |
| 2 | Creator-értesítés | **Csak heti email az MVP-ben.** Push notif P1, ha az email-engagement jó. |
| 3 | B2B sponsor view | **Teljesen P1.** MVP-ben nincs sponsor-felület, a B2B-pitch a creator + admin nézetekre épít. |
| 4 | Anyanyelvi extrakció | **Közös normalizált slug** (`composting-winter`), `topic_label` HU/EN/DE-re változik. AT-HU pozíció megőrzése. |
| 5 | AI provider | **Anthropic-váltás MOST.** A `ai-chat` function migrálása Gemini → Anthropic Claude egy menetben a téma-extrakció építésével. Sonnet a fő chathez, Haiku a téma-extrakcióhoz, prompt cache aktívan. |

**A spec mindenhol ezekkel a döntésekkel értendő — MVP scope (9-es szakasz) ezek alapján kerül sprint-tervezésre.**

---

## 13. Connection a Wellagora fő funkciójához

A Care+DNA tanulságok közvetlenül itt aktiválódnak — **anélkül, hogy a Wellagora fő identitását torzítanánk** (közösségépítő fórum + creator marketplace marad):

- **Multi-perszóna gondolkodás**: a feature mindhárom perszónát (creator, admin, B2B sponsor) szolgálja eltérő nézettel — ugyanazon adatból három történet.
- **Strukturális anonimitás (k≥X)**: nem szabályzati ígéret, hanem RLS+SECURITY DEFINER kódba foglalt küszöb.
- **Brand-voice rendszerprompt**: a creator-dashboard summary-ek és a WellBot-válaszok közös `_shared/voice-rules.ts`-ből merítenek.
- **Zero-state érdemi tartalom**: az "indulási szakaszban kevés a jel" üzenet nem üres dashboardot mutat, hanem kontextust ad.
- **1/7/30 napi mental walkthrough** kötelező a smoke-test előtt (Sprint X+1).

---

**Spec célja:** ne kelljen ezt a feature-t később 0-ról spec-elni — Attila vagy a fejlesztő (Cascade/Windsurf/Nexa) ezzel közvetlenül sprint-tervezhet, és minden fontos design-döntés explicit (vagy a "Nyitott kérdések" listáján).

**Következő lépés Attila részéről:** átolvasás → 5 nyitott kérdés döntése → sprint-be lökés.
