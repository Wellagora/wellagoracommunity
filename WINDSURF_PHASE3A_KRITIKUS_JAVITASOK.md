# WINDSURF PHASE 3A — KRITIKUS JAVÍTÁSOK

**Dátum:** 2026-02-14
**Prioritás:** KRITIKUS — Ezek nélkül nem lehet élesíteni
**Referencia:** WellAgora_Strategiai_Audit_2026Q1.docx

---

## RÉSZ 1/4: Expert Studio Kép/Videó Feltöltés Javítás (BUCKET FIX)

### Probléma
A `ProgramCreatorWizard.tsx` az `"expert-content"` nevű storage bucket-re próbál feltölteni, ami **NEM LÉTEZIK** a Supabase-ben. A helyes bucket neve `"expert-media"` (amit a `useExpertMedia.ts` hook helyesen használ).

### Javítandó fájl
**`src/components/expert-studio/ProgramCreatorWizard.tsx`**

### Feladat
A 245-254. sor körül két helyen kell cserélni:

```typescript
// RÉGI (HIBÁS) — 246. sor körül:
.from("expert-content")

// ÚJ (HELYES):
.from("expert-media")
```

Mindkét előfordulást javítsd:
1. **Upload hívás** (~246. sor): `.from("expert-content")` → `.from("expert-media")`
2. **getPublicUrl hívás** (~251. sor): `.from("expert-content")` → `.from("expert-media")`

### Ellenőrzés
- Keresd meg az ÖSSZES `"expert-content"` előfordulást a `src/` mappában (NEM `"expert-content-thumbnails"`, az helyes!)
- Csak a `ProgramCreatorWizard.tsx`-ben kell cserélni, a `ProgramEditor.tsx`-ben az `"expert-content-thumbnails"` bucket helyes

---

## RÉSZ 2/4: Alapító Szakértő 0% Platform Díj Érvényesítése

### Probléma
A FOUNDING_EXPERT_PLAYBOOK.md dokumentálja, hogy az első 5 Alapító Szakértő 0%-os platform díjat kap (100% a szakértőé), de a `create-checkout-session` edge function MINDIG 20%-os platform díjat von le, függetlenül az `is_founding_expert` flag-től.

### Javítandó fájl
**`supabase/functions/create-checkout-session/index.ts`**

### Feladat

**A) Expert profil lekérdezés bővítése** (~89-92. sor)

A jelenlegi:
```typescript
const { data: expertProfile } = await supabase
  .from("profiles")
  .select("stripe_account_id, stripe_onboarding_complete")
  .eq("id", content.creator_id)
  .single();
```

Bővítsd `is_founding_expert`-tel:
```typescript
const { data: expertProfile } = await supabase
  .from("profiles")
  .select("stripe_account_id, stripe_onboarding_complete, is_founding_expert")
  .eq("id", content.creator_id)
  .single();
```

**B) Díjkalkuláció módosítása** (~148-150. sor)

A jelenlegi (HIBÁS — mindig 20%):
```typescript
const expertPayout = Math.round(basePrice * 0.80);
const applicationFee = Math.max(0, userPayment - expertPayout);
```

Lecserélés (Alapító Szakértő = 0% díj):
```typescript
// Founding experts get 0% platform fee (100% goes to expert)
const isFoundingExpert = expertProfile?.is_founding_expert === true;
const expertSharePercent = isFoundingExpert ? 1.00 : 0.80;
const expertPayout = Math.round(basePrice * expertSharePercent);
const applicationFee = isFoundingExpert ? 0 : Math.max(0, userPayment - expertPayout);
```

**C) Metadata bővítése** — A Stripe session metadata-jába add hozzá:
```typescript
founding_expert: isFoundingExpert ? "true" : "false",
expert_share_percent: String(expertSharePercent * 100),
```

**D) Ugyanezt a logikát alkalmazd a 0 Ft-os (fully sponsored) ágban is** (~155-190. sor körül):
- A `payout_amount` ott is `expertPayout`-ot használja, ami a fenti fix után automatikusan helyes lesz

### Ellenőrzés
- `is_founding_expert` oszlop létezik a `profiles` táblában (a migrációk definiálják)
- A `stripe-webhook/index.ts`-ben is ellenőrizd, hogy az `expertPayout` a metadata-ból jön-e, vagy újra számítódik. Ha újra számítódik, ott is alkalmazd a founding expert logikát!

---

## RÉSZ 3/4: Gamifikáció Pont-Szerzési Triggerek Bekötése

### Probléma
A `src/lib/wellpoints.ts` definiálja a pont-értékeket és az `awardPoints()` függvényt, de EGYETLEN felhasználói akció sem hívja meg. A gamifikáció megjelenítése működik (MyAgoraPage.tsx), de pontot senki nem kap.

### Javítandó/Bővítendő fájlok

**A) Program vásárlás → pont (25 WP)**
Fájl: `src/hooks/usePurchase.ts` vagy ahol a vásárlás sikerességét kezelik.
A sikeres vásárlás/voucher aktiválás után:
```typescript
import { awardPoints } from "@/lib/wellpoints";
// Sikeres vásárlás után:
await awardPoints(userId, 'event_participation', 25, `Részvétel: ${programTitle}`);
```

Ha nincs dedikált hook, akkor a program detail page-en a sikeres checkout visszatérés után kell hívni.

**B) Értékelés/Review → pont (20 WP)**
Keresd meg a review/értékelés submit handler-t (valószínűleg `ReviewForm` vagy hasonló komponens).
A sikeres értékelés elküldése után:
```typescript
await awardPoints(userId, 'review_submitted', 20, `Értékelés: ${programTitle}`);
```

**C) Közösségi post → pont (5 WP)**
Ha van community post submit (keress `CommunityPost`, `createPost`, `submitPost`):
```typescript
await awardPoints(userId, 'post_created', 5, 'Közösségi poszt');
```

**D) Komment → pont (3 WP)**
Ha van comment submit handler:
```typescript
await awardPoints(userId, 'comment_created', 3, 'Hozzászólás');
```

**E) Like/Kedvelés → pont (1 WP)**
Ha van like/favorite handler:
```typescript
await awardPoints(userId, 'like_given', 1, 'Kedvelés');
```

**F) Regisztráció → pont (50 WP)**
A regisztrációs flow sikeres befejezése után (auth callback vagy onboarding):
```typescript
await awardPoints(userId, 'registration', 50, 'Üdvözlő pontok');
```

### Fontos
- Csak azokat kösd be, amelyekhez létezik a handler/submit logika!
- Ha egy akció (pl. community post) még nincs implementálva, hagyd ki — ne hozz létre új UI-t
- Az `awardPoints` async hívás ne blokkolja a fő műveletet — használj `.catch(console.error)` ha kell
- Mindig ellenőrizd, hogy a `POINT_VALUES` objektumban létezik-e az adott action tipus

---

## RÉSZ 4/4: WellBot Kontextus-Tudatosság (Route + Oldal)

### Probléma
A WellBot (ai-chat edge function) nem tudja, melyik oldalon van a felhasználó. Generikus válaszokat ad ahelyett, hogy releváns, kontextus-specifikus segítséget nyújtana.

### Javítandó fájlok

**A) Frontend — Aktuális route küldése a chatnek**
Fájl: `src/components/ai/WellBotWidget.tsx` (vagy ahol a chat üzenetet küldi az edge function-nek)

A chat API híváshoz add hozzá a jelenlegi route-ot:
```typescript
// A chat üzenet küldésekor:
const currentRoute = window.location.pathname;
const currentPageTitle = document.title;

// A request body-ba:
{
  message: userMessage,
  currentRoute: currentRoute,
  currentPageTitle: currentPageTitle,
  // ... meglévő paraméterek
}
```

**B) Backend — Route feldolgozása a rendszer promptban**
Fájl: `supabase/functions/ai-chat/index.ts`

A request body-ból olvasd ki a route-ot:
```typescript
const { message, currentRoute, currentPageTitle } = await req.json();
```

A rendszer prompt elejére (vagy a felhasználói kontextus részeként) add hozzá:
```typescript
const routeContext = currentRoute
  ? `\n\nA felhasználó jelenleg a következő oldalon van: ${currentRoute} (${currentPageTitle || 'N/A'}).
     Adj kontextus-specifikus segítséget! Ha a piactéren van, ajánlj programokat.
     Ha az Expert Stúdióban van, segíts a program létrehozásban.
     Ha a profil oldalán van, segíts a profil kiegészítésében.`
  : '';
```

Ezt fűzd hozzá a meglévő system prompt-hoz.

### Route → Kontextus térkép (referencia a prompt-hoz):
- `/` vagy `/home` → Üdvözlés, platform bemutatás, regisztráció segítés
- `/piacer` vagy `/programs` → Program ajánlás, szűrés segítség, kategóriák
- `/esemenyek` vagy `/events` → Esemény ajánlás, RSVP segítség
- `/szakertoi-studio` → Program létrehozás, Stripe Connect, bevétel
- `/my-agora` → Pont szerzés tippek, program kezelés, streak
- `/szponzor-panel` → Kredit vásárlás, szponzorálás, hatás
- `/kozosseg` → Közösségi aktivitás, posztolás segítség
- `/expert/:id` → Szakértő bemutatás, programjai

---

## VÉGREHAJTÁSI SORREND

1. **RÉSZ 1** (5 perc) — Bucket fix: `"expert-content"` → `"expert-media"`
2. **RÉSZ 2** (30 perc) — Founding expert 0% díj a Stripe kódban
3. **RÉSZ 3** (45 perc) — Gamifikáció triggerek (csak meglévő handler-ekhez!)
4. **RÉSZ 4** (30 perc) — WellBot route kontextus

## COMMIT ÜZENET
```
fix: Phase 3A kritikus javítások

- fix(storage): expert-content → expert-media bucket a ProgramCreatorWizard-ban
- feat(stripe): founding expert 0% platform díj érvényesítése
- feat(gamification): pont-szerzési triggerek bekötése meglévő akciókhoz
- feat(wellbot): route-alapú kontextus-tudatosság
```
