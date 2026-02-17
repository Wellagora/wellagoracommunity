# WellAgora SEO Stratégia — Átfogó Elemzés és Javaslatok

> Készült: 2026-02-17 | Verzió: 1.0
> Cél domain: `wellagora.org` | Demo: `demo.wellagora.org`
> Nyelvek: HU (elsődleges), EN, DE

---

## 1. KULCSSZÓKUTATÁS

### 1.1 Fő (head) kulcsszavak

| Kulcsszó (HU) | Havi keresés (becsült) | Nehézség | Relevancia |
|---|---|---|---|
| fenntarthatóság | 2400 | magas | közepes |
| közösségi programok | 880 | közepes | magas |
| workshopok | 6600 | magas | magas |
| helyi szakértő | 320 | alacsony | nagyon magas |
| önkéntes programok | 1300 | közepes | közepes |
| kézműves workshop | 1600 | közepes | magas |
| wellness programok | 2900 | közepes | magas |
| közösségépítés | 480 | alacsony | nagyon magas |

| Kulcsszó (EN) | Havi keresés (becsült) | Nehézség | Relevancia |
|---|---|---|---|
| sustainability workshops | 1900 | közepes | nagyon magas |
| local expert marketplace | 260 | alacsony | nagyon magas |
| community programs | 3600 | közepes | magas |
| sustainability community | 1100 | közepes | nagyon magas |

| Kulcsszó (DE) | Havi keresés (becsült) | Nehézség | Relevancia |
|---|---|---|---|
| Nachhaltigkeits-Workshop | 880 | közepes | nagyon magas |
| Gemeinschaftsprogramme | 390 | alacsony | nagyon magas |
| lokale Experten | 210 | alacsony | nagyon magas |
| Nachhaltigkeits-Veranstaltungen | 590 | közepes | magas |

### 1.2 Long-tail kulcsszavak (PRIORITÁS — könnyebb rangsorolás)

**HU — Magas konverziós potenciál:**
- `fenntarthatósági workshop [város]` (pl. "fenntarthatósági workshop Győr")
- `helyi szakértő kézműves workshop`
- `közösségi programok a közelemben`
- `ingyenes fenntarthatósági program`
- `wellness workshop hétvégén`
- `kertészeti workshop kezdőknek`
- `gasztronómiai workshop [város]`
- `hogyan legyek fenntarthatóbb`
- `helyi közösség csatlakozás`
- `szponzorált közösségi program`

**EN — Internationális elérés:**
- `sustainability workshop near me`
- `local expert knowledge sharing platform`
- `community sustainability programs Europe`
- `free sustainability workshops`
- `how to join a sustainability community`

**DE — Osztrák/Német piac:**
- `Nachhaltigkeits-Workshop in meiner Nähe`
- `lokale Experten Plattform`
- `Gemeinschaftsprogramme Nachhaltigkeit`
- `kostenlose Nachhaltigkeits-Workshops`

### 1.3 Branded kulcsszavak

| Kulcsszó | Típus | Prioritás |
|---|---|---|
| WellAgora | brand | kritikus |
| WellBot | brand/feature | magas |
| WellPoints | brand/feature | közepes |
| WellAgora közösség | brand + generic | magas |
| WellAgora piactér | brand + generic | magas |

---

## 2. TARTALOM AUDIT

### 2.1 Publikus oldalak (SEO-releváns)

| Oldal | Route | SEOHead? | H1? | Szöveges tartalom | Probléma |
|---|---|---|---|---|---|
| **Főoldal** | `/` | ✅ | ✅ | Hero + HowItWorks + WhyWellAgora + WellBotTeaser | Kevés indexelhető szöveg (SPA) |
| **Piactér** | `/programs`, `/piacer` | ✅ | ✅ | Dinamikus programlista | Nincs statikus szöveg a keresőknek |
| **Események** | `/events` | ✅ | ✅ | Dinamikus eseménylista | Nincs statikus bevezető szöveg |
| **Közösség** | `/community` | ✅ | ⚠️ | CommunityTeaser / CommunityHub | Bejelentkezett vs vendég eltérő tartalom |
| **WellBot** | `/ai-assistant` | ❌ | ❓ | AI chatbot | Nincs SEOHead! Nincs indexelhető tartalom |
| **Szponzor landing** | `/sponsor` | ❌ | ❓ | Részletes landing page + FAQ | Nincs SEOHead! Pedig gazdag tartalom |
| **Auth** | `/auth` | ✅ | ⚠️ | Login/Register form | noindex kellene |
| **Kapcsolat** | `/contact` | ❌ | ❓ | Kapcsolati űrlap | Nincs SEOHead! |
| **Segítség** | `/help` | ❌ | ❓ | FAQ/Segítség | Nincs SEOHead! |
| **ÁSZF** | `/terms` | ❌ | ❓ | Jogi szöveg | Nincs SEOHead, noindex kellene |
| **Adatvédelem** | `/privacy-policy` | ❌ | ❓ | Jogi szöveg | Nincs SEOHead, noindex kellene |
| **Impresszum** | `/impressum` | ❌ | ❓ | Jogi szöveg | Nincs SEOHead, noindex kellene |
| **Szakértő profil** | `/expert/:slug` | ✅ | ✅ | Dinamikus profil | OK — már van SEOHead |
| **Program részletek** | `/programs/:id` | ✅ | ✅ | Dinamikus program | OK — már van SEOHead |
| **Partnerek** | `/partners` | ❌ | ❓ | Partnerlista | Nincs SEOHead! |
| **Sitemap** | `/sitemap.xml` | — | — | XML | Ellenőrizni kell a tartalmát |

### 2.2 Kritikus hiányosságok

1. **SPA renderelés**: A Google crawler nem fut JS-t teljesen → a dinamikus tartalom (programok, események, szakértők) nem indexelődik megfelelően. Megoldás: SSR/SSG (Next.js migráció) vagy prerendering szolgáltatás (pl. prerender.io).

2. **Oldalak SEOHead nélkül**: `/ai-assistant`, `/sponsor`, `/contact`, `/help`, `/partners`, `/terms`, `/privacy-policy`, `/impressum` — **8 oldal hiányzik**.

3. **Nincs `robots.txt`**: Szükséges a crawl budget optimalizáláshoz.

4. **Nincs strukturált adat** (JSON-LD): Schema.org markup hiányzik (Organization, Event, Course, FAQPage, BreadcrumbList).

5. **Nincs sitemap.xml generálás**: A `/sitemap.xml` route SPA-oldalra mutat, nem valódi XML.

6. **Duplicate routes**: `/piacer` és `/programs` ugyanaz az oldal — canonical tag szükséges.

---

## 3. META TITLE ÉS DESCRIPTION JAVASLATOK

### 3.1 Jelenlegi vs. Javasolt (HU)

#### Főoldal `/`
- **Jelenlegi title**: WellAgora — Fenntartható közösségek, megosztott tudás
- **Javasolt title**: `WellAgora — Helyi Szakértők, Közösségi Workshopok | Fenntartható Közösség`
- **Jelenlegi desc**: Csatlakozz fenntartható közösségekhez és ismerd meg a helyi szakértőket...
- **Javasolt desc**: `Fedezd fel a helyi szakértők workshopjait és közösségi programjait. Kézműves, wellness, gasztronómia — szponzorált, ingyenes lehetőségek a közeledben. Csatlakozz!` (155 karakter)

#### Piactér `/programs`
- **Jelenlegi title**: WellAgora Piactér — Fenntarthatósági Programok
- **Javasolt title**: `Programok és Workshopok — Helyi Szakértőktől | WellAgora Piactér`
- **Jelenlegi desc**: Fedezd fel a fenntarthatósági programokat...
- **Javasolt desc**: `Böngészd a helyi szakértők workshopjait: kézműves, wellness, kertészeti, gasztronómiai programok. Ingyenes és szponzorált lehetőségek — jelentkezz most!` (154 karakter)

#### Események `/events`
- **Jelenlegi title**: WellAgora Események — Közösségi Programok
- **Javasolt title**: `Fenntarthatósági Események és Közösségi Programok | WellAgora`
- **Jelenlegi desc**: Fedezd fel a fenntarthatósági eseményeket...
- **Javasolt desc**: `Fenntarthatósági események, workshopok és közösségi programok a közeledben. Nézd meg a közelgő alkalmakat és jelentkezz — sok program ingyenes!` (147 karakter)

#### Közösség `/community`
- **Jelenlegi title**: WellAgora Közösség — Megosztott Tudás
- **Javasolt title**: `WellAgora Közösség — Helyi Tudásmegosztás és Kapcsolatok`
- **Jelenlegi desc**: Csatlakozz ezer tagból álló közösséghez...
- **Javasolt desc**: `Csatlakozz a WellAgora közösséghez: ismerd meg a helyi szakértőket, oszd meg tapasztalataidat és gyűjts WellPoints pontokat. Fenntartható fejlődés együtt!` (155 karakter)

#### WellBot `/ai-assistant` (ÚJ — jelenleg nincs)
- **Javasolt title**: `WellBot — Digitális Közösségi Asszisztens | WellAgora`
- **Javasolt desc**: `Kérdezd WellBot-ot programokról, szakértőkről és a közösségről! A WellAgora AI asszisztense segít megtalálni a tökéletes workshopot neked.` (140 karakter)

#### Szponzor Landing `/sponsor` (ÚJ — jelenleg nincs)
- **Javasolt title**: `Szponzori Program — Támogassa a Helyi Közösséget | WellAgora`
- **Javasolt desc**: `Legyen a közösség támogatója! Szponzoráljon helyi workshopokat és programokat. Bronze, Silver, Gold csomagok — a kredit nem jár le.` (133 karakter)

#### Kapcsolat `/contact` (ÚJ — jelenleg nincs)
- **Javasolt title**: `Kapcsolat — WellAgora | Kérdése van? Írjon nekünk!`
- **Javasolt desc**: `Lépjen kapcsolatba a WellAgora csapatával. Kérdések programokról, szponzori lehetőségekről vagy szakértői regisztrációról — szívesen segítünk!` (143 karakter)

#### Segítség `/help` (ÚJ — jelenleg nincs)
- **Javasolt title**: `Segítség és GYIK — WellAgora | Válaszok Kérdéseire`
- **Javasolt desc**: `Hogyan működik a WellAgora? Hogyan regisztráljon? Válaszok a leggyakoribb kérdésekre programokról, WellPoints-ról és a közösségről.` (131 karakter)

#### Partnerek `/partners` (ÚJ — jelenleg nincs)
- **Javasolt title**: `Partnereink és Támogatóink | WellAgora`
- **Javasolt desc**: `Ismerje meg a WellAgora partnereit és szponzorait, akik lehetővé teszik az ingyenes közösségi programokat és workshopokat.` (124 karakter)

### 3.2 EN meta javaslatok

| Oldal | Title | Description |
|---|---|---|
| Home | `WellAgora — Local Experts, Community Workshops \| Sustainability Platform` | `Discover workshops and programs by local sustainability experts. Craft, wellness, gardening — sponsored and free opportunities near you. Join now!` |
| Programs | `Programs & Workshops by Local Experts \| WellAgora Marketplace` | `Browse local expert workshops: craft, wellness, gardening, gastronomy. Free and sponsored opportunities — sign up today!` |
| Events | `Sustainability Events & Community Programs \| WellAgora` | `Upcoming sustainability events, workshops, and community programs in your region. Many events are free — RSVP now!` |
| Community | `WellAgora Community — Local Knowledge Sharing & Connections` | `Join the WellAgora community: meet local experts, share experiences, and earn WellPoints. Sustainable growth together!` |

### 3.3 DE meta javaslatok

| Oldal | Title | Description |
|---|---|---|
| Home | `WellAgora — Lokale Experten, Gemeinschafts-Workshops \| Nachhaltigkeitsplattform` | `Entdecken Sie Workshops und Programme lokaler Nachhaltigkeitsexperten. Handwerk, Wellness, Garten — gesponserte und kostenlose Möglichkeiten. Mitmachen!` |
| Programs | `Programme & Workshops von lokalen Experten \| WellAgora Marktplatz` | `Lokale Experten-Workshops durchstöbern: Handwerk, Wellness, Garten, Gastronomie. Kostenlose und gesponserte Möglichkeiten!` |
| Events | `Nachhaltigkeits-Veranstaltungen & Gemeinschaftsprogramme \| WellAgora` | `Nachhaltigkeits-Events, Workshops und Gemeinschaftsprogramme in Ihrer Region. Viele Veranstaltungen kostenlos!` |

---

## 4. KERESÉSI SZÁNDÉK / INTENT-ELEMZÉS

### 4.1 Intent típusok és kulcsszó-mapping

| Kulcsszó | Intent | Céloldal | Konverziós cél |
|---|---|---|---|
| `wellagora` | Navigational | Főoldal `/` | Brand keresés → kielégíteni |
| `fenntarthatósági workshop [város]` | Transactional | Piactér `/programs` | Regisztráció + programra jelentkezés |
| `hogyan legyek fenntarthatóbb` | Informational | Blog (jelenleg nincs!) vagy Közösség | Tartalomfogyasztás → regisztráció |
| `közösségi programok a közelemben` | Local + Transactional | Események `/events` | RSVP |
| `kézműves workshop` | Transactional | Piactér `/programs?cat=craft` | Programra jelentkezés |
| `helyi szakértő [téma]` | Informational → Transactional | Szakértő profil `/expert/:slug` | Profil → program → jelentkezés |
| `ingyenes workshop` | Transactional | Piactér `/programs` (szűrő: ingyenes) | Regisztráció |
| `közösség támogatás szponzor` | Commercial Investigation | Szponzor landing `/sponsor` | Szponzori csomag vásárlás |
| `WellBot` | Navigational/Informational | WellBot `/ai-assistant` | Chatbot használat → regisztráció |
| `wellness program hétvégén` | Transactional + Local | Események/Piactér | RSVP/jelentkezés |

### 4.2 Content Gap elemzés (Intent vs. Tartalom)

| Intent típus | Van tartalom? | Hiány | Javaslat |
|---|---|---|---|
| **Informational** ("hogyan...", "miért...", "mi az a...") | ❌ Nincs blog | KRITIKUS | Blog/Tudásbázis szekció kellene |
| **Transactional** ("workshop [város]", "jelentkezés") | ✅ Piactér + Események | Város alapú szűrés nincs | Helyi szűrés + város alapú landing |
| **Local** ("a közelemben", "[város]") | ⚠️ Részleges | Geo-targeting hiányzik | Régió alapú landing oldalak |
| **Commercial** ("szponzori csomag", "ár") | ✅ Szponzor landing | SEOHead hiányzik | SEOHead hozzáadása |
| **Navigational** ("wellagora") | ✅ OK | — | Brand SERP optimalizálás |

---

## 5. KONKURENS OLDALAK ELEMZÉSE

### 5.1 Közvetlen és közvetett konkurensek

| Konkurens | Típus | Erősség | Gyengeség | WellAgora előny |
|---|---|---|---|---|
| **programturizmus.hu** | Közvetett (HU) | Erős SEO, 6600+ oldal, workshopok, események | Nincs közösség, nincs szponzoráció, passzív lista | Aktív közösség, szponzori támogatás, WellPoints |
| **imGrätzl.at** | Közvetlen (AT) | Helyi közösségi platform, workshops, Wien-fókusz | Csak Bécs, nincs marketplace, nincs AI | Többnyelvű, AI asszisztens, piactér |
| **Szakkör (EPALE)** | Közvetett (HU) | Hagyományőrzés, közösségépítés, EU-támogatás | Nincs technológia, nem marketplace | Modern tech, gamifikáció, AI |
| **Sharity.hu** | Közvetett (HU) | ESG compliance, nagyvállalati fókusz | B2B only, nem közösségi | B2C + B2B2C, helyi fókusz |
| **Meetup.com** | Közvetett (INT) | Hatalmas felhasználóbázis, eseményszervezés | Nincs fenntarthatósági fókusz, nincs szponzor modell | Niche fókusz, szponzori modell |
| **expert-marketplace.de** | Közvetett (DE) | Szakértő piactér, B2B | Csak előadók, nincs közösség | Közösségi programok, B2C |

### 5.2 Konkurens SEO metrikák (becsült)

| Metrika | programturizmus.hu | imGrätzl.at | WellAgora |
|---|---|---|---|
| Domain Authority | ~35 | ~25 | ~5 (új domain) |
| Indexelt oldalak | 6000+ | 2000+ | <50 |
| Organikus forgalom/hó | ~15K | ~3K | <100 |
| Backlink-ek | ~500 | ~200 | <20 |
| Blogcikkek | 100+ | 50+ | 0 |
| Strukturált adat | Részleges | Igen | Nincs |

### 5.3 Tanulságok a konkurenciából

1. **programturizmus.hu** → Erős kategória-oldalak (workshop típusonként), részletes leírások, város-alapú szűrés
2. **imGrätzl.at** → Kerület (Grätzl) alapú navigáció, közösségi események, egyszerű kategória-rendszer
3. **Meetup.com** → Event Schema markup, helyi SEO, user-generated content indexelés

---

## 6. SEO SZÖVEGÍRÁS — JAVASLATOK

### 6.1 Főoldal szövegoptimalizálás

**Jelenlegi Hero szöveg (HU):**
```
"Hatásod számít. Cselekedj lokálisan."
"Csatlakozz a régió fenntarthatósági közösségéhez. Mérhető hatás, valódi eredmények."
```

**Javasolt Hero szöveg (HU):**
```
"Helyi Szakértők. Közösségi Workshopok. Fenntartható Fejlődés."
"Fedezd fel a régiód legjobb szakértőinek workshopjait és programjait. 
Kézműves, wellness, gasztronómia — sok program ingyenes, szponzori támogatással."
```
→ Kulcsszavak beépítve: "helyi szakértők", "közösségi workshopok", "fenntartható", "programok", "ingyenes"

**Javasolt "Hogyan működik?" szöveg kiegészítés:**
```
1. "Böngészd a szakértők workshopjait" (jelenlegi: "Szakértők megosztják tudásukat")
2. "Jelentkezz programokra — sok ingyenes" (jelenlegi: "Te részt veszel")
3. "Építsd a közösséget, gyűjts WellPoints-ot" (jelenlegi: "A közösség erősödik")
```

### 6.2 Piactér bevezető szöveg (jelenleg nincs!)

**Javasolt statikus bevezető szöveg a `/programs` oldalra:**
```
Fedezd fel a WellAgora Piactér programjait és workshopjait. Helyi szakértőink 
kézműves, wellness, gasztronómiai, kertészeti és fenntarthatósági programokat 
kínálnak — sokuk ingyenes, szponzori támogatással. Válassz kategóriát és 
kezdd el a fejlődést!
```

### 6.3 Események bevezető szöveg (jelenleg nincs!)

**Javasolt statikus bevezető szöveg az `/events` oldalra:**
```
Közösségi események és fenntarthatósági programok a régiódban. Workshopok, 
találkozók és élő alkalmak helyi szakértőkkel. Jelentkezz és légy részese 
a változásnak!
```

### 6.4 Szponzor landing optimalizálás

A jelenlegi szponzor landing (`/sponsor`) már gazdag tartalmú, de a szövegben hiányznak kulcsszavak:
- Adjuk hozzá: "közösségi program szponzorálás", "helyi kezdeményezés támogatás", "CSR program"
- A FAQ szekció jó alap a strukturált adathoz (Schema.org FAQPage)

---

## 7. WEBSZÖVEG KORREKTÚRA

### 7.1 Konzisztencia-problémák a HU locale-ban

| Probléma | Hol | Javítás |
|---|---|---|
| "Piactér" vs "Programok" | Nav + oldalcímek | Egységesen "Piactér" vagy "Programok és Workshopok" |
| "Tag" vs "Mitglied" keveredés | Régi kulcsokban | Egységesen "Tag" (HU), "Member" (EN), "Mitglied" (DE) |
| Hero: "Hatásod számít" | Főoldal | Konkrétabb szöveg kulcsszavakkal |
| "100+ aktív tag" | Hero trust badge | Frissíteni valós adattal vagy eltávolítani |
| "50+ teljesített program" | Hero trust badge | Frissíteni valós adattal vagy eltávolítani |
| Sponsored badge: "SZPONZORÁLT" | Események | OK, de lehetne "Ingyenes — Szponzorált" |

### 7.2 Hiányzó szövegek

| Szöveg típus | Hol kellene | Státusz |
|---|---|---|
| `alt` attribútumok képekhez | Minden kép | ⚠️ Ellenőrizni |
| Piactér bevezető szöveg | `/programs` oldal teteje | ❌ Hiányzik |
| Események bevezető szöveg | `/events` oldal teteje | ❌ Hiányzik |
| Footer SEO szöveg | Minden oldal | ❌ Hiányzik |
| 404 oldal szöveg | `/not-found` | ⚠️ Ellenőrizni |

---

## 8. KULCSSZÓ- ÉS TARTALOMOPTIMALIZÁLÁS — IMPLEMENTÁCIÓS TERV

### 8.1 Azonnali (P0 — 1-2 nap)

1. **SEOHead hozzáadása 8 hiányzó oldalhoz**:
   - `/ai-assistant`, `/sponsor`, `/contact`, `/help`, `/partners`
   - `/terms`, `/privacy-policy`, `/impressum` (noindex!)
2. **Javasolt meta title/description implementálása** mind a 3 nyelven
3. **robots.txt létrehozása** (`public/robots.txt`)
4. **Statikus bevezető szöveg** a Piactér és Események oldalakra

### 8.2 Rövid távú (P1 — 1-2 hét)

5. **JSON-LD strukturált adatok** hozzáadása:
   - `Organization` — globális
   - `WebSite` + `SearchAction` — főoldal
   - `Event` — minden eseményre
   - `Course` / `Product` — minden programra
   - `FAQPage` — szponzor landing + help oldal
   - `BreadcrumbList` — minden oldalra
6. **Valódi sitemap.xml generálás** (statikus oldalak + dinamikus programok/események)
7. **Hero szöveg kulcsszó-optimalizálás** mind a 3 nyelven
8. **Alt attribútumok** ellenőrzése és javítása

### 8.3 Középtávú (P2 — 1-2 hónap)

9. **Blog/Tudásbázis szekció** létrehozása (informational intent kielégítés):
   - "Hogyan válj fenntarthatóbbá?" cikksorozat
   - Szakértő interjúk
   - Programbeszámolók
   - Kategória guide-ok (pl. "A legjobb wellness workshopok")
10. **Régió-alapú landing oldalak** (pl. `/regio/gyor`, `/regio/sopron`)
11. **Prerendering** implementálása (prerender.io vagy hasonló) az SPA probléma megoldására
12. **Backlink-építés** stratégia (helyi önkormányzatok, civil szervezetek, szponzorok)

### 8.4 Hosszú távú (P3 — 3-6 hónap)

13. **Next.js SSR migráció** a teljes SEO-barát rendereléshez
14. **Google Business Profile** a helyi SEO-hoz
15. **Hreflang implementáció** aldomainekkel (`hu.wellagora.org`, `en.wellagora.org`)
16. **Tartalom skálázás** — 50+ blogcikk, 100+ indexelt program oldal

---

## 9. FAQ-STRATÉGIA

### 9.1 Globális FAQ (Főoldal / Help)

**HU:**

1. **Mi a WellAgora?**
   A WellAgora egy közösségi platform, ahol helyi szakértők workshopokat és programokat kínálnak fenntarthatósági témákban: kézműves, wellness, gasztronómia, kertészet és még sok más.

2. **Hogyan regisztrálhatok?**
   Kattints a "Csatlakozz" gombra, add meg az e-mail címedet és válaszd ki, hogy tagként, szakértőként vagy szponzorként szeretnél csatlakozni. A regisztráció ingyenes!

3. **Mennyibe kerülnek a programok?**
   Sok program ingyenes, szponzori támogatással. A fizetős programok árait a szakértők határozzák meg. WellPoints kedvezménnyel akár 20%-ot spórolhatsz!

4. **Mi az a WellPoints?**
   A WellPoints a WellAgora jutalomrendszere. Pontokat gyűjthetsz aktív közösségi részvétellel, és programkedvezményekre válthatod be őket (max. 20%).

5. **Hogyan lehetek szakértő?**
   Regisztrálj szakértőként, töltsd ki a profilodat és hozd létre első programodat az Expert Studio-ban. A bevétel 80%-a a tiéd!

6. **Mi a WellBot?**
   A WellBot a WellAgora AI asszisztense. Kérdezd programokról, szakértőkről vagy a közösségről — azonnal válaszol!

7. **Hogyan lehetek szponzor?**
   Látogass el a szponzori oldalra, válassz csomagot (Bronze, Silver, Gold, Diamond) és támogass helyi programokat. A krediteid nem járnak le!

### 9.2 Szponzor FAQ (már létezik a locale-ban, de Schema.org markup kell)

A szponzor landing oldalon már van 5 FAQ kérdés (`sponsor_landing.faq_1_q` — `sponsor_landing.faq_5_q`). Ezekhez JSON-LD `FAQPage` schema markup szükséges.

### 9.3 FAQ implementáció — JSON-LD minta

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Mi a WellAgora?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A WellAgora egy közösségi platform, ahol helyi szakértők workshopokat és programokat kínálnak fenntarthatósági témákban."
      }
    }
  ]
}
```

### 9.4 FAQ oldal stratégia

- **Globális FAQ**: A `/help` oldalon, strukturált adattal
- **Szponzor FAQ**: A `/sponsor` oldalon, saját JSON-LD
- **Program FAQ**: Minden programoldalon, dinamikusan generálva ("Mikor kezdődik?", "Mennyibe kerül?", "Ki a szakértő?")
- **Google Rich Results**: A FAQ markup lehetővé teszi, hogy a Google SERP-ben megjelenjen a "People also ask" szekcióban

---

## 10. ÖSSZEFOGLALÓ PRIORITÁSI MÁTRIX

| # | Feladat | Hatás | Ráfordítás | Prioritás |
|---|---|---|---|---|
| 1 | SEOHead hozzáadása 8 oldalhoz | Magas | Alacsony | 🔴 P0 |
| 2 | Meta title/desc optimalizálás 3 nyelven | Magas | Alacsony | 🔴 P0 |
| 3 | robots.txt létrehozása | Közepes | Nagyon alacsony | 🔴 P0 |
| 4 | JSON-LD strukturált adatok | Magas | Közepes | 🟡 P1 |
| 5 | Statikus szöveg Piactér + Események | Közepes | Alacsony | 🟡 P1 |
| 6 | Valódi sitemap.xml | Magas | Közepes | 🟡 P1 |
| 7 | Hero szöveg kulcsszó-optimalizálás | Közepes | Alacsony | 🟡 P1 |
| 8 | FAQ JSON-LD (szponzor + help) | Közepes | Alacsony | 🟡 P1 |
| 9 | Alt attribútumok javítása | Közepes | Alacsony | 🟡 P1 |
| 10 | Blog/Tudásbázis szekció | Nagyon magas | Magas | 🔵 P2 |
| 11 | Régió-alapú landing oldalak | Magas | Magas | 🔵 P2 |
| 12 | Prerendering (SPA fix) | Nagyon magas | Közepes | 🔵 P2 |
| 13 | Backlink-építés | Magas | Folyamatos | 🔵 P2 |
| 14 | Next.js SSR migráció | Nagyon magas | Nagyon magas | ⚪ P3 |
| 15 | Google Business Profile | Közepes | Alacsony | ⚪ P3 |

---

## KÖVETKEZŐ LÉPÉS

Az azonnali (P0) feladatok **most implementálhatóak**:
1. SEOHead + locale kulcsok hozzáadása a hiányzó 8 oldalhoz
2. Meta title/description frissítése az optimalizált verzióra
3. `robots.txt` létrehozása
4. FAQ locale kulcsok hozzáadása (globális FAQ)

**Szeretnéd, hogy ezeket most implementáljam?**
