-- Insert 6 sample Workshop Secrets (Műhelytitkok) for testing
INSERT INTO public.expert_contents (
  title, 
  description, 
  category, 
  creator_id, 
  is_published, 
  price_huf, 
  access_type,
  access_level
) VALUES 
-- 1. Fenntartható Életmód (Sustainability)
(
  'Zero-Waste háztartás alapjai',
  'Hogyan csökkentsd a szemetet 80%-kal egy hónap alatt. Ez a Műhelytitok lépésről lépésre végigvezet a hulladékmentes életmód alapjain, a bevásárlástól a komposztálásig. Megtanulod, hogyan cseréld le az egyszer használatos termékeket fenntartható alternatívákra.',
  'sustainability',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  0,
  'free',
  'free'
),
-- 2. Műhely & Kézművesség (Workshop)
(
  'A modern asztalos titka',
  'Útmutató az antik bútorok kíméletes restaurálásához. Fedezd fel a hagyományos asztalos technikákat és a modern anyagokat ötvöző megoldásokat. Megtanulod, hogyan adj új életet régi bútoroknak anélkül, hogy elveszítenéd az eredeti karakterüket.',
  'workshop',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  4990,
  'paid',
  'one_time_purchase'
),
-- 3. Helyi Gasztronómia (Gastronomy)
(
  'Kovász-mágia',
  'A tökéletes, ropogós héjú falusi kenyér receptúrája. Ez a Műhelytitok megosztja a generációk óta őrzött kovász ápolási technikákat és a professzionális kenyérsütés minden fortélyát. Tartalmaz 5 különböző kenyérreceptet is.',
  'gastronomy',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  2990,
  'paid',
  'one_time_purchase'
),
-- 4. Közösségi Hatás (Community)
(
  'Sikeres falunap szervezése',
  'Hogyan mozgósítsd a lakosságot és a helyi támogatókat. Teljes útmutató a közösségi események szervezéséhez: a tervezéstől az engedélyeken át a marketingig. Valódi esettanulmányokkal és letölthető sablonokkal.',
  'community',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  0,
  'free',
  'free'
),
-- 5. Jóllét & Reziliencia (Wellness)
(
  'Gyógynövények a kertedből',
  'Természetes immunerősítők készítése. Ismerd meg a leghatékonyabb gyógynövényeket és tanuld meg, hogyan készíts belőlük teákat, tinktúrákat és kenőcsöket. A Műhelytitok tartalmaz egy szezonális gyűjtési naptárat is.',
  'wellness',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  3490,
  'paid',
  'one_time_purchase'
),
-- 6. Agora Business (Business)
(
  'Etikus marketing kistermelőknek',
  'Hogyan add el a termékedet őszintén a közösségi médiában. Ez a Műhelytitok megmutatja, hogyan építs autentikus online jelenlétet anélkül, hogy feladnád az értékeidet. Tartalmaz tartalomtervező sablonokat és hashtag stratégiákat.',
  'business',
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  true,
  5990,
  'paid',
  'one_time_purchase'
);