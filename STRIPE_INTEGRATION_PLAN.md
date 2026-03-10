# WellAgora — Stripe Integráció Terv

**Dátum:** 2026.03.10.
**Cél:** Teljes pénzforgalmi rendszer bevezetése
**Platform jutalék:** 20%
**Pénznem:** HUF (elsődleges)

---

## Jelenlegi állapot

| Elem | Állapot |
|------|---------|
| Szakértő program létrehozás | ✅ Működik (wizard) |
| Kupon/voucher rendszer | ✅ Vizuálisan működik, pénz nélkül |
| Piactér és részletoldal | ✅ Működik |
| Hozzáférés logika (access_level) | ✅ Javítva (free/one_time_purchase) |
| Stripe fizetés | ❌ Nem létezik |
| Szponzor dashboard | ❌ Nem létezik |
| Tranzakció rögzítés | ❌ Nem létezik |
| Szakértő kifizetés | ❌ Nem létezik |

---

## Üzleti modell — A pénz útja

### A) Tag vásárol programot (közvetlen)

```
Tag → Stripe Checkout → Fizetés (5000 Ft)
  → Platform: 1000 Ft (20%)
  → Szakértő: 4000 Ft (80%)
  → content_access bejegyzés → Tag hozzáfér
  → transactions rekord → Elszámolás
```

### B) Szponzor támogat programot

```
Szponzor → Szponzor Dashboard → Kiválaszt programot
  → Beállít: 5000 Ft/fő, max 20 hely
  → Stripe Payment Intent → Szponzor fizet (5000 × 20 = 100.000 Ft)
  → Platform: 20.000 Ft (20%)
  → Szakértő: 80.000 Ft (80%)
  → sponsor_support_rules rekord → Kuponok aktiválódnak

Tag → "Támogatott hely igénylése" → Kupon kód
  → voucher rekord → Tag hozzáfér → Szponzor helye csökken
```

### C) Részleges szponzorálás

```
Program ára: 5000 Ft
Szponzor fizet: 3000 Ft/fő
Tag fizet: 2000 Ft (Stripe Checkout)
  → Platform: 1000 Ft (20% of teljes ár)
  → Szakértő: 4000 Ft (80% of teljes ár)
```

---

## Implementációs terv — 6 lépés

### 1. Stripe alapok és Supabase Edge Function

**Mit:** Stripe SDK telepítés, API kulcsok, Supabase Edge Function a fizetés kezeléséhez.

**Fájlok:**
- `supabase/functions/create-checkout/index.ts` — Stripe Checkout Session létrehozás
- `supabase/functions/stripe-webhook/index.ts` — Stripe webhook handler
- `.env` — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

**Stripe Checkout Session flow:**
```typescript
// create-checkout Edge Function
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  payment_method_types: ['card'],
  currency: 'huf',
  line_items: [{
    price_data: {
      currency: 'huf',
      product_data: {
        name: program.title,
        description: program.description?.substring(0, 200),
        images: program.image_url ? [program.image_url] : [],
      },
      unit_amount: program.price_huf, // HUF has no decimals in Stripe
    },
    quantity: 1,
  }],
  metadata: {
    content_id: contentId,
    buyer_id: userId,
    creator_id: program.creator_id,
    type: 'program_purchase', // or 'sponsor_contribution'
  },
  success_url: `${origin}/piacer/${contentId}?payment=success`,
  cancel_url: `${origin}/piacer/${contentId}?payment=cancelled`,
});
```

**Webhook handler:**
```typescript
// stripe-webhook Edge Function
switch (event.type) {
  case 'checkout.session.completed': {
    const session = event.data.object;
    const { content_id, buyer_id, creator_id, type } = session.metadata;

    // 1. Create content_access record
    await supabase.from('content_access').insert({
      content_id, user_id: buyer_id,
      amount_paid: session.amount_total,
      payment_reference: session.payment_intent,
      access_type: 'purchase',
    });

    // 2. Create transaction record
    const platformFee = Math.round(session.amount_total * 0.20);
    const creatorAmount = session.amount_total - platformFee;

    await supabase.from('transactions').insert({
      content_id, buyer_id, creator_id,
      amount_total: session.amount_total,
      amount_platform: platformFee,
      amount_creator: creatorAmount,
      currency: 'HUF',
      status: 'completed',
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      transaction_type: type,
    });
    break;
  }
}
```

**Tesztelés:**
- Stripe Test Mode → `sk_test_...` kulcsok
- Stripe CLI → `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`
- Teszt kártya: `4242 4242 4242 4242`

---

### 2. `transactions` tábla létrehozása

**SQL migráció:**
```sql
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES expert_contents(id),
  buyer_id UUID REFERENCES auth.users(id),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  sponsor_id UUID REFERENCES auth.users(id),

  -- Összegek (HUF, egész szám)
  amount_total INTEGER NOT NULL,
  amount_platform INTEGER NOT NULL,  -- 20% jutalék
  amount_creator INTEGER NOT NULL,   -- 80% kifizetés
  amount_sponsor INTEGER DEFAULT 0,  -- szponzor hozzájárulás

  currency TEXT NOT NULL DEFAULT 'HUF',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('purchase', 'sponsorship', 'partial_sponsor')),

  -- Stripe referenciák
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_refund_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Vásárló és készítő is lássa
CREATE POLICY "Users see own transactions" ON transactions
  FOR SELECT USING (
    buyer_id = auth.uid() OR creator_id = auth.uid() OR sponsor_id = auth.uid()
  );
```

---

### 3. Frontend: "Megvásárolom" gomb → Stripe Checkout

**Fájl:** `src/pages/ProgramDetailPage.tsx`

A `purchase_required` case-ben:
```typescript
case 'purchase_required':
  return (
    <Button onClick={async () => {
      const { data } = await supabase.functions.invoke('create-checkout', {
        body: { contentId: id, returnUrl: window.location.href }
      });
      if (data?.url) window.location.href = data.url;
    }}>
      <ShoppingCart className="w-5 h-5 mr-2" />
      Megvásárlom — {program.price_huf.toLocaleString()} Ft
    </Button>
  );
```

**Success page handler:**
```typescript
// useEffect-ben ellenőrizni a ?payment=success query param-ot
if (searchParams.get('payment') === 'success') {
  toast.success('Sikeres vásárlás!');
  queryClient.invalidateQueries(['contentAccess', id]);
}
```

**Tesztelés:**
- Teszt kártya → Checkout oldal megjelenik → Fizetés → Visszairányítás
- content_access rekord létrejön → Tartalom elérhető
- transactions rekord létrejön → Elszámolás helyes

---

### 4. Szponzor rendszer

**Táblák:**
```sql
-- Szponzor támogatási szabály
CREATE TABLE sponsor_support_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES auth.users(id),
  content_id UUID REFERENCES expert_contents(id),     -- NULL = kategória szponzor
  category TEXT,                                        -- NULL = specifikus program
  amount_per_participant INTEGER NOT NULL,              -- Ft/fő
  budget_total INTEGER NOT NULL,                        -- Teljes keret
  budget_used INTEGER DEFAULT 0,
  max_participants INTEGER,
  currency TEXT DEFAULT 'HUF',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'exhausted')),
  stripe_payment_intent TEXT,                           -- Szponzor előre fizetett
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kupon felhasználás → tranzakció
CREATE TABLE sponsorship_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES sponsor_support_rules(id),
  content_id UUID NOT NULL REFERENCES expert_contents(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  voucher_id UUID REFERENCES vouchers(id),
  amount INTEGER NOT NULL,              -- ténylegesen levont összeg
  currency TEXT DEFAULT 'HUF',
  status TEXT DEFAULT 'allocated' CHECK (status IN ('allocated', 'redeemed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Frontend:** Szponzor Dashboard (`/sponsor-dashboard`)
- Válassz programot vagy kategóriát
- Állítsd be: összeg/fő, max helyek, költségkeret
- Stripe Payment Intent → Keret előre fizetve
- Valós idejű statisztika: felhasznált helyek, maradék keret

**Tesztelés:**
- Szponzor létrehoz szabályt → Stripe előre fizetés
- Tag igényli kuponnal → allocation rekord → keret csökken
- Keret kifogy → "Elfogyott a támogatott keret" üzenet

---

### 5. Wizard frissítés — Alapár mindig kötelező

**Jelenlegi logika (hibás):**
- "Csak szponzorált" → `price_huf = 0`
- Nincs mit elszámolni

**Új logika:**
- Szakértő MINDIG megad alapárat (pl. 5000 Ft)
- "Hozzáférés típusa":
  - "Csak szponzorált" → Tag nem fizet, de az ár megmarad a szponzor elszámoláshoz
  - "Vásárolható is" → Tag is fizethet közvetlenül

```typescript
// Wizard contentData
const contentData = {
  price_huf: formData.price_huf,  // MINDIG van ár!
  access_type: formData.pricingMode === "purchasable" ? "paid" : "sponsored",
  access_level: formData.pricingMode === "purchasable"
    ? "one_time_purchase"
    : "registered",  // szponzorált = bejelentkezés kell + kupon
};
```

**Tesztelés:**
- Wizard nem engedi 0 Ft árat
- Szponzorált program: ár megjelenik áthúzva + "TÁMOGATOTT"
- Vásárolható: ár megjelenik + Stripe Checkout gomb

---

### 6. Szakértő kifizetés (Stripe Connect)

**Opció A: Stripe Connect Express** (ajánlott)
- Szakértő regisztrál Stripe Express fiókot
- Platform automatikusan utalja a 80%-ot
- `profiles.stripe_account_id` → Connect fiók

**Opció B: Manuális utalás** (egyszerűbb)
- Szakértő megadja bankszámlaszámát (`payout_preference`)
- Admin havonta készít összesítőt → Kézi utalás
- Nincs Stripe Connect szükség

**Ajánlás Fázis 2-re:** Opció B (manuális), mert:
- Gyorsabban bevezethető
- Nem kell Stripe Connect engedélyezés
- Magyar bankszámlára közvetlenül utalható

**Tesztelés:**
- Tranzakciók összesítő nézet admin dashboardon
- Szűrés: dátum, szakértő, státusz
- Export: CSV/Excel a kifizetésekhez

---

## Tesztelési checklist

### Stripe Checkout (közvetlen vásárlás)
- [ ] Teszt kártyával fizetés → success redirect
- [ ] content_access rekord létrejön
- [ ] transactions rekord: amount_total, amount_platform (20%), amount_creator (80%)
- [ ] Tag hozzáfér a tartalomhoz fizetés után
- [ ] Hibás kártya → cancel redirect → toast.error
- [ ] Dupla fizetés védelem (idempotency key)

### Szponzor flow
- [ ] Szponzor létrehoz támogatási szabályt
- [ ] Szponzor kifizeti a keretet Stripe-on
- [ ] Tag igényel kupont → sponsorship_allocation rekord
- [ ] Keret csökken → max elérésekor "Elfogyott"
- [ ] Szponzor látja a statisztikát (helyek, keret)

### Részleges szponzor
- [ ] Program ára 5000 Ft, szponzor fizet 3000 Ft
- [ ] Tag fizet 2000 Ft Stripe-on
- [ ] Tranzakció: platform 1000 Ft, szakértő 4000 Ft

### Edge esetek
- [ ] Szponzor keret lejárt (end_at múltban)
- [ ] Szponzor keret szüneteltetve (status=paused)
- [ ] Tag már rendelkezik hozzáféréssel → ne fizethessen újra
- [ ] Webhook retry → idempotens kezelés
- [ ] Stripe webhook signature verification

### Admin nézet
- [ ] Összes tranzakció listája
- [ ] Szűrés: dátum, típus, státusz
- [ ] Kifizetés összesítő szakértőnként
- [ ] Platform bevétel kimutatás

---

## Fájlok összefoglaló

| Fájl | Leírás |
|------|--------|
| `supabase/functions/create-checkout/index.ts` | Stripe Checkout Session |
| `supabase/functions/stripe-webhook/index.ts` | Webhook handler |
| `supabase/migrations/XXXXXX_stripe_transactions.sql` | transactions tábla |
| `supabase/migrations/XXXXXX_sponsor_rules.sql` | Szponzor táblák |
| `src/pages/ProgramDetailPage.tsx` | Megvásárlom gomb → Checkout |
| `src/components/expert-studio/ProgramCreatorWizard.tsx` | Alapár kötelező |
| `src/pages/SponsorDashboard.tsx` | Szponzor felület (új) |
| `src/pages/admin/AdminTransactions.tsx` | Admin tranzakciók (új) |

---

## Időbecslés

| Lépés | Idő |
|-------|-----|
| 1. Stripe alapok + Edge Functions | 2-3 óra |
| 2. transactions tábla + RLS | 30 perc |
| 3. Frontend Checkout integráció | 1-2 óra |
| 4. Szponzor rendszer (DB + UI) | 3-4 óra |
| 5. Wizard frissítés (alapár) | 1 óra |
| 6. Szakértő kifizetés | 1-2 óra (manuális) |
| **Tesztelés** | **2-3 óra** |
| **Összesen** | **~12-16 óra** |

---

*Készítette: Claude Opus 4.6 — 2026.03.10.*
*ProSelf International Zrt — WellAgora Platform*
