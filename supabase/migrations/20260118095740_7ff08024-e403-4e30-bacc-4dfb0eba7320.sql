-- Insert 3 test programs with different content types (Expert: Hanna Weber)
INSERT INTO public.expert_contents (
  creator_id, 
  title, 
  description,
  content_type, 
  price_huf, 
  max_capacity,
  is_published,
  is_sponsored,
  category,
  access_level,
  total_licenses,
  used_licenses
) VALUES 
(
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  'Kovászos videókurzus',
  'Tanuld meg a kovászos kenyér készítését lépésről lépésre, saját tempódban.',
  'recorded',
  10000,
  NULL,
  true,
  true,
  'food',
  'premium',
  50,
  12
),
(
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  'Jóga Webinar',
  'Élő online jóga óra kezdőknek és haladóknak.',
  'online_live',
  5000,
  100,
  true,
  true,
  'wellness',
  'premium',
  30,
  8
),
(
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  'Workshop a kertben',
  'Személyes kerti workshop, ahol megtanulod az urbánus kertészkedés alapjait.',
  'in_person',
  15000,
  10,
  true,
  true,
  'gardening',
  'premium',
  10,
  3
);