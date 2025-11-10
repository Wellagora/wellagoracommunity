-- Delete old global challenges
DELETE FROM challenge_definitions WHERE id IN ('bike-to-work', 'led-switch', 'zero-waste-week', 'water-saver');

-- Insert new Káli medence programs
INSERT INTO challenge_definitions (
  id, 
  title, 
  description, 
  category, 
  difficulty, 
  points_base, 
  duration_days,
  is_active,
  is_continuous,
  project_id,
  base_impact,
  validation_requirements
) VALUES 
(
  'kali-muhely',
  'Káli Műhely - Havi közösségi találkozók',
  'Havonta egyszer, rotálva a 4 településen (Kövágóörs, Kékkút, Mindszentkálla, Köveskál)',
  'Közösség',
  'beginner',
  150,
  30,
  true,
  false,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 0, "description": "Közösségépítés"}',
  '{"type": "manual", "description": "Részvétel igazolása", "steps": ["Részvétel a találkozón"], "tips": ["Hozz magaddal ötleteket"]}'
),
(
  'tudas-hid',
  'Tudás Híd - Generációk közötti program',
  'Hagyományőrzők és új lakosok párosítása a 4 településen',
  'Közösség',
  'intermediate',
  200,
  30,
  true,
  false,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 0, "description": "Tudásmegosztás"}',
  '{"type": "manual", "description": "Párosítás igazolása", "steps": ["Párosítás kialakítása", "Találkozás"], "tips": ["Nyitott hozzáállás"]}'
),
(
  'kali-kozos-kert',
  'Káli közös kert - Közösségi termelés',
  'Közös kertészkedés, helyi termékek a 4 településen',
  'Biodiverzitás',
  'beginner',
  180,
  1,
  true,
  true,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 5, "description": "Helyi termelés"}',
  '{"type": "manual", "description": "Kertészkedés igazolása", "steps": ["Kertmunka"], "tips": ["Hozz munkaeszközt"]}'
),
(
  'szomszed-segit',
  'Szomszéd segít szomszédnak - Támogatási hálózat',
  'Strukturált segítségnyújtás (bevásárlás, szállítás, gyerekfelügyelet)',
  'Közösség',
  'beginner',
  120,
  1,
  true,
  true,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 2, "description": "Közösségi támogatás"}',
  '{"type": "manual", "description": "Segítségnyújtás igazolása", "steps": ["Segítség felajánlása", "Végrehajtás"], "tips": ["Időben egyeztess"]}'
),
(
  'kali-tortenetek',
  'Káli Történetek - Közös identitás',
  'Helyi történetek gyűjtése és megosztása a 4 településről',
  'Közösség',
  'beginner',
  140,
  30,
  true,
  false,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 0, "description": "Helyi kultúra"}',
  '{"type": "manual", "description": "Történet megosztása", "steps": ["Történet gyűjtése", "Megosztás"], "tips": ["Kérdezd meg az időseket"]}'
),
(
  'kali-konyhak',
  'Káli konyhák - Havi közös főzés',
  'Rotálva a településeken, helyi specialitások',
  'Közösség',
  'beginner',
  160,
  30,
  true,
  false,
  '0ad8a5ec-de14-4e90-8dff-31019c535b32',
  '{"co2_saved": 3, "description": "Helyi gasztronómia"}',
  '{"type": "manual", "description": "Főzőrendezvény részvétel", "steps": ["Részvétel", "Főzés"], "tips": ["Hozz helyi receptet"]}'
);