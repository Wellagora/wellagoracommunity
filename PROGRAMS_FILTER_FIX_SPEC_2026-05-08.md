# Programok-szűrő — diagnózis és fix-spec

**Dátum:** 2026-05-08
**Hatókör:** `src/pages/ProgramsListingPage.tsx` (1084 sor) + locale fájlok + adatmodell
**Trigger:** A felhasználó (Attila) a `/programs` oldalon "1 találat"-ot lát, és a 3-rétegű szűrő nem működik az elvárások szerint.

---

## 1. Diagnózis — három különálló probléma egyszerre

### 1.1 A "Piactér + Események összevonva" merge nem volt valódi merge

A `4119625 feat: merge Piactér + Események → Programok, remove market category` commit (április 11) a **navigációs item-et nevezte át** "Piactér"-ről "Programok"-ra, és bevezetett egy 3-tab-os szűrő réteget (`Összes / Programok / Események`). De a kód-szinten a két tartalom-típus továbbra is **két különálló adat-forrásból jön és külön szűrődik**:

| | Programok | Események |
|---|---|---|
| Tábla | `expert_contents` | `events` |
| Lekérdezés | `ProgramsListingPage.tsx:342-414` | `ProgramsListingPage.tsx:534-540` |
| Filter állapot | `filteredPrograms` (sor 248-269) | `filteredEvents` (sor 271-279) |
| Egyesítés | `totalResults = filteredPrograms.length + filteredEvents.length` (sor 281) |

Ha az "Események" tabra kattintasz: `filteredPrograms` mindig üres tömböt ad vissza (sor 249: `if (contentTypeFilter === 'events') return [];`), és fordítva. Tehát ez **UI-szintű összevegyítés**, nem unifikált adatmodell.

**Mi ezzel a baj:** ahogy nőnek a követelmények (sponsorship, kupon, hossz-szűrő, dátum-szűrő), minden szűrőt két helyen kell implementálni — duplázott logika, drift-veszély. A merge szándéka jó volt, a kivitelezése félbemaradt.

### 1.2 "1 találat" — a DB sparse, és nincs mock-fallback

A 728. sortól egy DEV diagnostic panel kifejezetten kimondja a policy-t:

> *Marketplace uses ONLY real DB data. No mock fallback in DEV or production.*

Ez tudatos döntés (és helyes is — Care+DNA tanulság: hardcoded peer-rezonancia szövegek elrontják a hitelességet). DE pre-launch szakaszban ez azt jelenti: ha 1 program van localized HU title-lel a DB-ben, akkor 1 találat lesz. **A felhasználó pedig nem tudja, hogy a problem üres adatbázis vagy elrontott szűrő — egyforma képet kap.**

A 736. sor diagnosztikája:
```tsx
programs.filter(p => p.title).length // mennyi program van localized title-lel
```
Az "approved" jelölés tehát **nyelv-függő**: ha a kiválasztott nyelven (HU/EN/DE) NINCS lefordított title, a program nem jelenik meg. Ez közvetlenül kapcsolódik a 1.3-as ponthoz.

### 1.3 i18n adósság: 301 TODO EN-ben, 480 TODO DE-ben

```
HU: 0 [TODO:] entry
EN: 301 [TODO:] entry
DE: 480 [TODO:] entry
```

A locale fájlokban tömeges `[TODO: <hungarian text>]` placeholder van. Vagyis **ha a user EN vagy DE locale-ra váltja a felületet, a UI felében szögletes zárójeles magyar szöveget lát.** Ez egyszerre UX-katasztrófa és launch-blokkoló az osztrák / EN piacra.

Plusz külön: a tab-felirat inline ternary-ben van, NEM a `t()` rendszeren keresztül:

```tsx
// ProgramsListingPage.tsx:637-639
{ id: 'all', label: language === 'hu' ? 'Összes' : language === 'de' ? 'Alle' : 'All', icon: Grid },
{ id: 'programs', label: language === 'hu' ? 'Programok' : language === 'de' ? 'Programme' : 'Programs', icon: BookOpen },
{ id: 'events', label: language === 'hu' ? 'Események' : language === 'de' ? 'Veranstaltungen' : 'Events', icon: Calendar },
```

Ez **framework drift példa** (Care-tanulság): a hangnem-szabály szerint mindennek a `t()`-n kell áthaladnia, hogy egyetlen helyen legyen szerkeszthető.

### 1.4 UX: 3 réteg szűrő egy sparse listára

A felhasználó ezt látja, ebben a sorrendben:

1. Cím + alcím: *"Fedezd fel a közösség programjait!"*
2. Search box (placeholder: *"Keresés a programok között..."*)
3. **Content type tabs**: `Összes / Programok / Események` (3 gomb)
4. **Category chips**: `Összes / Életmód / Kézműves / Gasztronómia / Jól-lét` (5+ gomb)
5. Eredmény: *"1 találat"* + 1 program kártya

Pre-launch szakaszban (és valószínűleg az első néhány hónapban indulás után is) **több filter-szint van, mint tartalom**. A felhasználó kognitív terhe magas, a payoff nulla. Ezt a Care-doc anti-pattern-listájában *"Felületes user-journey nézés"* néven már fel van listázva — most reális tükör.

### 1.5 Tech debt: párhuzamos régi+új oldalak

```
EventsPage.tsx        EventsPageNew.tsx
EventDetailPage.tsx   EventDetailPageNew.tsx
ProgramLearnPage.tsx  ProgramLearnPageNew.tsx
BrowseProgramsPage.tsx (deprecated, csak redirect)
```

Az `ItemsPage` + `ItemsPageNew` mintázat azt jelzi, hogy elkezdtünk egy refaktort, de nem fejeztük be. **Mindkét fájl jelen van a build-ben, mindkettőre route-ol valami valószínűleg.** Tisztításra szorul, mert:
- megduplázza a karbantartási kötelezettséget
- minden bugfix kétszer kell
- a `App.tsx` route-jaiban összevisszaság marad

---

## 2. Fix-pálya A — gyors UX-egyszerűsítés (1-2 óra, ajánlott MOST)

**Cél:** pre-launch állapotban a felhasználó ne lásson "törött filter-rendszert", és a felület becsületesen kommunikálja, hogy még friss adat-állomány van.

**Beavatkozások:**

### 2.1 Conditional tab-megjelenés
- Ha 0 vagy 1 esemény van a DB-ben, **ne jelenjen meg az "Események" tab**
- Ha 0 vagy 1 program van, **ne jelenjen meg a "Programok" tab** (vagy a teljes 3-tab-sor)
- A logika egyszerű: a tab-rendelkezésre-állást a `programs.length` és `events.length` döntse el

```tsx
// ProgramsListingPage.tsx:636 közelében
const tabs = useMemo(() => {
  const all = [{ id: 'all' as ContentTypeFilter, label: t('marketplace.tab_all'), icon: Grid }];
  if (programs.length > 0) all.push({ id: 'programs', label: t('marketplace.tab_programs'), icon: BookOpen });
  if (events.length > 0) all.push({ id: 'events', label: t('marketplace.tab_events'), icon: Calendar });
  return all.length > 1 ? all : []; // ha csak az "Összes" lenne, ne mutasd a tab-sort
}, [programs.length, events.length, t]);
```

### 2.2 Tab-feliratok i18n-rendszerre kötése
A 637-639 sorban lévő inline ternary helyett:
```tsx
{ id: 'all', label: t('marketplace.tab_all'), icon: Grid },
{ id: 'programs', label: t('marketplace.tab_programs'), icon: BookOpen },
{ id: 'events', label: t('marketplace.tab_events'), icon: Calendar },
```
És hozzáadni a `hu.json`-ba (és placeholder-rel `en.json`/`de.json`-ba):
```json
"marketplace.tab_all": "Összes",
"marketplace.tab_programs": "Programok",
"marketplace.tab_events": "Események"
```

### 2.3 Feltétel-szerinti category-sor
- Ha 5-nél kevesebb különböző kategória van programban+eventben együtt, **a kategória chip-sort ne mutasd**
- Vagy: csak azokat a kategória-chipeket mutasd, amelyikben van legalább 1 tartalom

### 2.4 Becsületes zero-state szöveg
Ha 0 vagy 1 találat van, a "találat-szám" alatt:
- **0 találat**: *"A platform indul. Az első programok hamarosan érkeznek — iratkozz fel az értesítőre, ha szeretnél értesülni."*
- **1 találat**: *"Az első programunk már elérhető. Még épülünk — több jön hamarosan."*
- Ha van keresési kifejezés: *"A keresésre nem találtunk találatot. Próbáld meg üresen, vagy másik kategóriában."*

Ezek `t()`-be mennek, és Care-tanulság szerint **ténymegállapítás → opció**, semmi *"ne add fel"*.

### 2.5 Nyelv-következetesség jelzés
Ha az aktuális locale-ban nincs lokalizált title egy programra, két opció:
- **(a)** Ne jelenjen meg az adott nyelvben (jelenlegi politika — szigorúbb)
- **(b)** Jelenjen meg fallback-ként a HU title, vizuálisan jelölve hogy `🇭🇺 Csak magyarul elérhető`

Pre-launch szakaszra **(b) javasolt**, mert az "1 találat" élmény drámaian javul. B2B sales szakaszra (a) javasolt, mert hiteles. Ezt **explicit feature flag-be** kéne tenni: `VITE_FALLBACK_TO_HU_TITLE`.

**Becsült munka: 1-2 óra. Egy commit. Ki lehet pusholni az élesbe.**

---

## 3. Fix-pálya B — unified data model (1-2 nap, B2B sales előtt)

**Cél:** a "Programok merge" befejezése — egy egységes tartalom-tábla, egy filter-rendszer, egy lekérdezés.

### 3.1 Adatmodell-opció: polymorphic `expert_contents`

A `expert_contents` táblába be lehet vezetni egy `item_type` enum oszlopot:
```sql
ALTER TABLE expert_contents
  ADD COLUMN item_type TEXT NOT NULL DEFAULT 'program'
  CHECK (item_type IN ('program', 'event'));

-- Az events-specifikus mezőket is bele kéne tenni vagy egy oldal-táblába:
ALTER TABLE expert_contents
  ADD COLUMN event_start_date TIMESTAMPTZ,
  ADD COLUMN event_end_date TIMESTAMPTZ,
  ADD COLUMN event_location_name TEXT,
  ADD COLUMN event_location_address TEXT;

-- Migrate events → expert_contents:
INSERT INTO expert_contents (id, item_type, title, description, ..., event_start_date, ...)
SELECT id, 'event', title, description, ..., start_date, ...
FROM events
WHERE status = 'published';
```

**Előny:** egy query, egy filter, egy UI komponens, egy edit/create flow a creator számára.
**Hátrány:** migration, az events-specifikus képernyők átírása, a B2C adminban dual-write időszak.

### 3.2 Adatmodell-opció: külön táblák, view-jal egyesítve

`marketplace_items` view, ami `UNION ALL`-lel egyesíti `expert_contents` (programs) + `events` rekordokat egy közös sémába:
```sql
CREATE OR REPLACE VIEW marketplace_items AS
SELECT id, 'program' AS item_type, title, ..., NULL::timestamptz AS event_start_date FROM expert_contents WHERE status = 'published'
UNION ALL
SELECT id, 'event' AS item_type, title, ..., start_date AS event_start_date FROM events WHERE status = 'published';
```

A frontend csak ezt a view-t kérdezi le. **Nincs migration, csak read-side egyesítés.** Az írás külön-külön továbbra is megy.

**Ezt javaslom**, mert pre-launch szakaszban a kockázat a kicsi, és a creator workflow-jait nem kell rögtön refaktorálni.

### 3.3 Frontend refaktor

A `ProgramsListingPage.tsx` 1084 sora valószínűleg 60-70%-ra csökkenthető:
- 1 `useQuery` a `marketplace_items` view-ra
- 1 `filteredItems` useMemo (a 2 helyett)
- A render loop szétszedése egy `<MarketplaceItemCard>` komponensre, ami a `item_type` alapján rendereli a megfelelő részleteket

Ez a refaktor segít a WellBot Insights feature-höz is (l. külön spec): a WellBot egyetlen ajánlás-listához nyúl, nem kettőhöz.

---

## 4. i18n debt — külön munka, párhuzamosan

**EN: 301 TODO, DE: 480 TODO** — összesen ~780 string-fordítás. Ez egy jól lehatárolt, **egy hét alatt megoldható feladat**:

### 4.1 Folyamat
1. **Audit script**: bash script, ami listázza a TODO-kat témakör szerint csoportosítva (pl. dashboard.*, marketplace.*, expert.*).
2. **Prioritás**: a felhasználó által legtöbbet látott felületek elsőként (Index, Auth, Marketplace/Programs, Dashboard).
3. **AI-fordítás batch-ben**: a `bulk-translate` Supabase function már meg is van — ezt kell ráereszteni a TODO entrykre. **MIND a brand-voice rules szerint** (no exclamation, no emoji, "érett kolléga" hangnem).
4. **Review**: HU-EN-DE párhuzamosan, Attila/Nexa review-ja után írni a JSON-t.
5. **Commit**: külön commit `i18n(en/de): translate TODO entries — batch 1 of N`.

### 4.2 Brand voice szabály a fordítóknak

EN/DE fordítást **explicit brand-voice szabály** vezérelje (Claude system promptban, mint a Care esetében):

- Tone: *"informed local community member, not a preacher, rooted, calm"*
- Forbidden: exclamation marks, "Awesome!", "Don't give up!", marketing-superlatívuszok
- Desired: factual, observational, source-cited where applicable

A `bulk-translate` Supabase function jelenlegi promptját **ezzel a szabály-blokkjal kéne kiegészíteni**, akkor a fordítások önmagukban is brand-konzisztensek.

---

## 5. Tech debt — párhuzamos page-ek tisztítása

### 5.1 Mit találtam
```
src/pages/EventsPage.tsx
src/pages/EventsPageNew.tsx
src/pages/EventDetailPage.tsx
src/pages/EventDetailPageNew.tsx
src/pages/ProgramLearnPage.tsx
src/pages/ProgramLearnPageNew.tsx
src/pages/BrowseProgramsPage.tsx (deprecated, 18 sor, redirect)
```

### 5.2 Lépés
1. `git log --follow` a régi és új page-ekre — nézzük meg melyik az aktuális.
2. Az `App.tsx` route-jaiban fellistázni, melyik page-re mutat valójában a route.
3. A nem használt page-eket **törölni** (NEM csak letiltani — a build-ben szemét marad).
4. A `BrowseProgramsPage.tsx` 18-soros redirect-et megtartani vagy a route-t közvetlenül `/programs`-ra állítani — ne legyen feleslegesen indirection.

**Becsült munka: 1-2 óra, kockázat alacsony, de tesztelni kell hogy nincs-e hivatkozás valahonnan.**

---

## 6. Konkrét rangsor — mit mikor

| # | Mit | Becsült | Kockázat | Mikor |
|---|---|---|---|---|
| 1 | Fix-pálya A: conditional tabs + zero-state + i18n bind | 1-2 óra | alacsony | **Most, egy sprint-ben** |
| 2 | i18n debt — batch 1 (top 50 felhasználói felület) | 1 nap | alacsony | Pre-launch előtt |
| 3 | Tech debt page-tisztítás (régi+új duplikáció) | 1-2 óra | alacsony | Pre-launch előtt |
| 4 | Fix-pálya B: unified `marketplace_items` view + frontend refaktor | 1-2 nap | közepes | B2B sales előtt |
| 5 | i18n debt — batch 2-N (teljes 780 string) | 3-4 nap | alacsony | Soft launch előtt |

---

## 7. Care+DNA tanulságok, amelyeket itt aktiváltunk

- **Framework drift védelem**: a `t()`-rendszerre kötött tab-feliratok megakadályozzák, hogy egy bekötés-elmaradás végigfusson a UX-en. *(2.2-es pont)*
- **Ténymegállapítás → opció a zero-state-ben**: nincs *"ne add fel"*, nincs *"szuper"* — *"még épülünk, hamarosan jön"*. *(2.4-es pont)*
- **1/7/30 nap mental walkthrough**: a 30. napi felhasználó már elvárja, hogy ne legyen `[TODO: ...]` a UI-ban. Ez most is fáj, de blokkoló a 30. napi élménynél. *(4-es pont)*
- **Brand-voice szabály a Claude-promptban (bulk-translate)**: mint a Care-progress-narrative route, itt is system-prompt-szintű enforcement-tel kell védeni a hangnem-konzisztenciát. *(4.2-es pont)*

---

## 8. Mi NEM cél ebben a sprintben

- **NEM** a WellBot fejlesztés (külön spec — `WELLBOT_INSIGHTS_FOR_CREATORS_SPEC_2026-05-08.md`).
- **NEM** a fő funkció megváltoztatása. A "közösség + creator marketplace" identitás marad.
- **NEM** új feature — csak meglévő javítás.

---

**A spec célja:** ne kelljen Sprintet újra-tervezni — Attila vagy a fejlesztő (Cascade/Windsurf) eldöntheti, hogy fix-pálya A-t most kifut, és B-t a B2B-előkészítésbe rendezi.
