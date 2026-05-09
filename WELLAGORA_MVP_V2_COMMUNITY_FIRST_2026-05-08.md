# Wellagora MVP v2 — Community-First Concept

**Dátum:** 2026-05-08
**A pivot lényege:** A pénzügyi modellt (Stripe, sponsor mechanika, voucher-rendszer) háttérbe tesszük. A korai hónapok fókusza a **creator-tartalom feltöltése + közösségi engagement**.

---

## 1. A cél, egy mondatban

**Olyan teret építünk, ahol creator-ok ingyenesen tartalmat tölthetnek fel, és a közösség körülöttük megerősödik — a pénzügyi modell akkor kapcsolódik be, amikor van mit pénzre váltani.**

Ez azt is jelenti: pre-launch + első 3-6 hónap során a sikermutatónk **nem konverzió, hanem közösségi mozgás** (creator-feltöltés, kérdés, kommentár, részvétel).

---

## 2. Mit hagyunk meg (már megvan, illik az új irányhoz)

| Komponens | Miért marad aktív |
|---|---|
| **Programs (programok feltöltése + felfedezése)** | A creator-tartalom platformja. Ingyenes-ként megy. |
| **Creator profilok + Expert Studio** | A creator önmegjelenése. |
| **WellBot** | Discovery + segítség az új tagoknak — most már brand-voice-ban. |
| **WellBot Insights for Creators** (már megépítve) | A creator látja, mire kérdez a közösség → új tartalom-ötlet. **Ez pontosan a community→creator engagement loop motorja.** |
| **Carbon Handprint** | Önálló feature marad, de nem központi. Ha valaki használja, jó. |
| **Member regisztráció, profil, dashboard** | Az alap-belépés. |

---

## 3. Mit teszünk háttérbe (és miért nem törlünk semmit)

| Komponens | Mit csinálunk |
|---|---|
| **Stripe checkout / fizetés** | Kódban marad, ki van kapcsolva (feature flag) |
| **TÁMOGATOTT badge** a programokon | Eltávolítjuk a UI-ból, vagy átnevezzük "Nyílt tartalom"-ra (vagy egyszerűen elhagyjuk) |
| **Sponsor dashboard / Sponsor route-ok** | Hidden — a navigation-ban nem jelenik meg, de a kód marad |
| **Expert Payouts** | Hidden ugyanígy |
| **Voucher-rendszer** | A backend marad, a UI-ban nem jelenik meg |
| **Stripe Connect onboarding** | Nem kell az új creator-oknak |

**Fontos:** semmit NEM törlünk. Feature flag-en kapcsoljuk ki. Amikor jön a financial-fázis, egy ENV-változón visszakapcsoljuk. Ezzel megőrizzük a 6-12 hónapnyi munkát.

---

## 4. Az új creator első napja — frictionless onboarding

**Cél:** egy creator 10 percen belül tudjon első programot felrakni, **kapun belül**.

```
1. Regisztráció email-lel (vagy Google) → 30 mp
2. "Mire szeretnél tartalmat tölteni?" rövid 3-kérdéses onboarding (kategóriák) → 1 perc
3. WellBot proaktív üdvözlő üzenet: "Mutassam mire kérdez a közösség?" → kontextus
4. "Tölts fel egy első programot" CTA — egy egyszerű form:
   - cím
   - rövid leírás
   - kategória
   - opcionális: kép (vagy default)
   - opcionális: dátum (ha esemény)
5. PUBLIKÁLÁS — nincs ár, nincs Stripe-kapcsolás, nincs jóváhagyás-fal.
6. Megosztható link → "küldd el ismerősöknek vagy oszd meg".
```

**Care+DNA-tanulság aktiváció:** zero-state érdemi tartalom — az új creator nem üres dashboard-ot lát, hanem WellBot Insights jelzéseket ("mit kérdez a közösség") + 1-2 példa "starter program" sablon.

---

## 5. Három közösségi engagement-mechanizmus

Ezek a "fogadott motorok", amelyek visszahozzák a tagokat:

### A) **Programok mint folytonos beszélgetés**
- Egy program-oldalon: leírás + kreátor-bio + **kommentszekció**
- Tag kérdezhet, creator válaszolhat (vagy más tagok)
- Reactions: érdeklődöm / részt veszek / szeretném

### B) **Közösségi feed / fórum**
- A `/community` oldal lesz a központi tér
- Tagok **kérdést tehetnek fel** ("hogyan komposztáljak télen?")
- Kreátorok válaszolhatnak — ami egyúttal **content seed** a következő programjukhoz
- WellBot is megjelenhet itt: ha 3+ user kérdez ugyanarról → kreátor-ajánlás vagy kapcsolódó program-link

### C) **WellBot mint összekötő**
- Member oldal: WellBot ajánl programokat, kreátorokat
- Creator oldal: WellBot Insights → "Itt van mit kérdezett a közösség. Akarsz ilyet csinálni?"
- Ez egy **feedback loop** — community-jelzés → creator-tartalom → community-engagement

**Mindhárom mechanizmus már részben megvan a kódban.** A munka 70%-a a kiemelés, nem új építés.

---

## 6. Mit jelent ez a fejlesztésre — két sprint

### Sprint 14 (1 hét, frictionless creator onboarding)
- **(a)** Feature flag rendszer: `VITE_FINANCIAL_MODEL_ENABLED=false` → kikapcsolja a Sponsor / Stripe / Voucher / Payout UI-t mindenhol
- **(b)** Creator quick-start flow: 3-step onboarding + first-program form egyszerűsítve (no Stripe-onboarding, no pricing fields)
- **(c)** Programs detail page: TÁMOGATOTT badge eltávolítása vagy átnevezése "Nyílt tartalom"-ra
- **(d)** Navigation: Sponsor menüpont eltüntetése
- **(e)** WellBot proaktív üdvözlés új creator-nak (utal az Insights-re)

### Sprint 15 (1 hét, közösségi engagement-réteg)
- **(a)** Program-oldali komment-szekció (ha még nincs) vagy kiemelése
- **(b)** Community feed: kérdés-feltétel form + kérdés-listázás
- **(c)** WellBot a `/community` oldalon: "Mire kérdezett a közösség mostanában?" widget
- **(d)** Creator-side: Insights tab kiemelése a Studio-ban (már megvan, csak láthatóság-igazítás)
- **(e)** Email-értesítés creator-nak, ha valaki kommentált a programja alatt

---

## 7. Sikermutatók — mit fogunk mérni

**Pre-launch (1-2 hónap):**
- Hány creator regisztrált
- Hányan töltöttek fel **legalább 1 programot** a regisztráció után 7 napon belül
- Hány member regisztrált
- WellBot conversation-szám / hét

**Soft launch (3-6 hónap):**
- Hány aktív program (>1 hónapja módosított)
- Hány közösségi kérdés / hét
- Engagement: mennyi komment / reakció / program
- Visszatérés: hányan jönnek vissza 7 napon belül
- Creator retention: hány creator tölt fel 2+ programot

**NEM mérünk most:** revenue, GMV, conversion rate, sponsor-volume — ezek a financial-fázisban.

---

## 8. Connection a már megépített Insights-szal

A WellBot Insights for Creators **már most azt csinálja**, amit ez a pivot kér:

- Creator látja, mit kérdezett a közösség (k≥3 anonimitással)
- Content-gap észlelés: "ezekre nincs még program — szeretnél csinálni?"
- B2C-loop: kérdés → tartalom → engagement → új kérdés

Tehát az új MVP koncepció **épít a már megépített backend-re**. Ami hiányzik: a frontend láthatóság + a creator onboarding-ba beépítés.

---

## 9. Döntések — bezárva 2026-05-08

| # | Kérdés | Döntés |
|---|---|---|
| 1 | Carbon Handprint sorsa | **HOLD — túl korai, nincs még módszertanunk.** Hide a UI-ból feature-flag-en, kód marad. |
| 2 | Pricing badge a programokon | **Nincs badge** — minden ingyenes a financial-fázis előtt, "TÁMOGATOTT"/"Nyílt tartalom" sem kell. |
| 3 | Member-to-member messaging | **Nincs DM** — csak feed és komment. Moderálás-igényt csökkenti. |
| 4 | Creator első hullám | **20 creator** — kicsi szám, white-glove onboarding feasible. |
| 5 | Tartalom-moderáció | **Free-publish + post-hoc admin-review** — creators bevonzása fontosabb. |

**Sprint 14-15 ezekkel a döntésekkel kerül megtervezésre.**

---

## 10. Mi nem cél most

- **NEM** a financial-modell kidobása — csak késleltetése. A kód marad.
- **NEM** új fő funkció — a Programok / Creators / Community már megvan, csak átsúlyozzuk.
- **NEM** átdesignolás — a navigation, layout, brand marad. Csak a financial-réteget kapcsoljuk ki.

---

## 11. Egy mondatos zárás

A Wellagora indulását egy **Lego-játékhoz** hasonlítanám: most a creator-tartalom + közösségi-engagement Lego-elemeket tesszük le. Ha a közösség mozogni kezd körülöttük, **akkor** kapcsoljuk be a financial-réteget — és akkor lesz mire bevezetni a Stripe-ot és a sponsor-mechanikát. **Fordítva nem működik.**

---

**Dönts a 9-es szakasz 5 nyitott kérdésén, és onnan tudunk Sprint 14-15 sprint-tervet csinálni.**
