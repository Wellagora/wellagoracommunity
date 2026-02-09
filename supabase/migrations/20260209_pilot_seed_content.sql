-- ============================================================
-- PILOT SEED CONTENT
-- Run this AFTER the founding_expert migration
-- Replace 'ADMIN_USER_ID' with your actual admin/platform user ID
-- These posts make the community feel alive on day 1
-- ============================================================

-- To use: 
-- 1. Find your admin user ID from Supabase Auth > Users
-- 2. Replace all instances of 'REPLACE_WITH_ADMIN_USER_ID' below
-- 3. Run in Supabase SQL Editor

-- Example:
-- SET wellagora.admin_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Find the first admin/super_admin user to use as seed author
  -- If no admin exists, use the first expert
  SELECT id INTO v_admin_id
  FROM profiles
  WHERE is_super_admin = TRUE
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id
    FROM profiles
    WHERE user_role IN ('expert', 'creator')
    LIMIT 1;
  END IF;

  -- If no user found at all, skip seeding
  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'No admin or expert user found — skipping seed content. Create a user first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding community posts with author: %', v_admin_id;

  -- =====================================================
  -- SEED POST 1: Welcome / Pinned announcement
  -- =====================================================
  INSERT INTO community_posts (author_id, content, post_type, created_at)
  VALUES (
    v_admin_id,
    '🌱 Üdvözlünk a WellAgora közösségben!

Ez a te helyed, ahol megoszthatod gondolataidat, kérdezhetsz, és inspirálhatod a közösséget.

Néhány dolog, amit itt tehetsz:
💬 Írj egy bemutatkozó posztot — ki vagy, mi érdekel?
❓ Kérdezz bármit — a közösség és szakértőink segítenek
💡 Oszd meg a tippjeidet — minden apró lépés számít
🏆 Mesélj el egy sikertörténetet — inspirálj másokat!

Minden aktivitásért WellPoints-ot kapsz, amit később kedvezményekre válthatsz. 

Kezdjük el együtt! 👇',
    'announcement',
    NOW() - INTERVAL '2 hours'
  )
  ON CONFLICT DO NOTHING;

  -- =====================================================
  -- SEED POST 2: Expert tip
  -- =====================================================
  INSERT INTO community_posts (author_id, content, post_type, created_at)
  VALUES (
    v_admin_id,
    '💡 3 egyszerű lépés a fenntarthatóbb mindennapokért:

1️⃣ **Helyi piac a szupermarket helyett** — Frissebb, szezonális, és a helyi termelőket támogatod
2️⃣ **Komposztálj** — A konyhai zöldséghulladék arannyá válik a kertben
3️⃣ **Szezonális receptek** — Olcsóbb, finomabb, és kisebb a karbon-lábnyom

Ti mit csináltok a mindennapokban? Írjátok kommentben! 🌿',
    'tip',
    NOW() - INTERVAL '1 hour 30 minutes'
  )
  ON CONFLICT DO NOTHING;

  -- =====================================================
  -- SEED POST 3: Question to spark engagement
  -- =====================================================
  INSERT INTO community_posts (author_id, content, post_type, created_at)
  VALUES (
    v_admin_id,
    '❓ Kérdés a közösséghez:

Milyen fenntarthatósági témában szeretnétek programokat látni a WellAgora-n?

Néhány ötlet:
🌿 Kertészkedés, permakultúra
🍳 Szezonális, helyi alapanyagos főzés
♻️ Zero waste háztartás
🧘 Tudatos életmód, wellness
🎨 Kézműves technikák, upcycling
🥾 Természetjárás, helyi túrák

Szavazzatok, vagy írjatok saját ötletet! 👇',
    'question',
    NOW() - INTERVAL '45 minutes'
  )
  ON CONFLICT DO NOTHING;

  -- =====================================================
  -- SEED POST 4: Success story
  -- =====================================================
  INSERT INTO community_posts (author_id, content, post_type, created_at)
  VALUES (
    v_admin_id,
    '🏆 Miért indítottuk a WellAgora-t?

Hittünk benne, hogy a helyi tudás és a közösségi összefogás hatalmas erő. Láttuk, hogy a kis közösségekben rengeteg tehetséges ember van — kertészek, szakácsok, kézművesek, jógaoktatók — akiknek nincs platformjuk.

A WellAgora ezt a hiányt tölti be: egy helyet, ahol a helyi szakértők megoszthatják tudásukat, és a közösség tagjai megtalálhatják őket.

Ma még kicsik vagyunk, de nagy álmaink vannak. És ti vagytok az alapítók, akik formáljátok ezt a közösséget! 💚

#közösség #fenntarthatóság #helyi',
    'success_story',
    NOW() - INTERVAL '20 minutes'
  )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed content created successfully!';
END $$;
