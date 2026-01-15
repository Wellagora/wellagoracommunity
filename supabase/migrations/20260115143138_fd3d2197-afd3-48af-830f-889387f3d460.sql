-- =============================================
-- REGIONAL & HUMAN MVP SEEDING
-- =============================================

-- Step 1: Update existing profiles to become our 4 human experts
-- Using existing user IDs from the database

-- Hanna Weber (Vienna) - Urban Gardening Expert
UPDATE public.profiles 
SET 
  first_name = 'Hanna',
  last_name = 'Weber',
  user_role = 'creator',
  location = 'Wien, Österreich',
  location_city = 'Wien',
  country = 'AT',
  bio = 'Leidenschaftliche Stadtgärtnerin und Permakultur-Enthusiastin. Ich helfe Menschen, selbst auf kleinstem Raum grüne Oasen zu schaffen.',
  bio_de = 'Leidenschaftliche Stadtgärtnerin und Permakultur-Enthusiastin. Ich helfe Menschen, selbst auf kleinstem Raum grüne Oasen zu schaffen.',
  bio_en = 'Passionate urban gardener and permaculture enthusiast. I help people create green oases even in the smallest spaces.',
  expert_title = 'Urban Gardening & Permaculture',
  expert_title_de = 'Urban Gardening & Permakultur',
  expert_title_en = 'Urban Gardening & Permaculture',
  is_verified_expert = true,
  is_public_profile = true,
  expertise_areas = ARRAY['permaculture', 'urban-gardening', 'sustainability']
WHERE id = 'd150eb0a-5923-45b2-aa04-9f9c39e211d4';

-- Kovács Márton (Budapest) - Artisan Baker
UPDATE public.profiles 
SET 
  first_name = 'Márton',
  last_name = 'Kovács',
  user_role = 'creator',
  location = 'Budapest, Hungary',
  location_city = 'Budapest',
  country = 'HU',
  bio = 'Kézműves pék és kovászos kenyér specialista. A hagyományos magyar sütéstechnikákat ötvözöm modern tudással.',
  bio_de = 'Handwerklicher Bäcker und Sauerteig-Spezialist. Ich verbinde traditionelle ungarische Backtechniken mit modernem Wissen.',
  bio_en = 'Artisan baker and sourdough specialist. I combine traditional Hungarian baking techniques with modern knowledge.',
  expert_title = 'Artisan Baker & Sourdough Master',
  expert_title_de = 'Handwerklicher Bäcker & Sauerteig-Meister',
  expert_title_en = 'Artisan Baker & Sourdough Master',
  is_verified_expert = true,
  is_public_profile = true,
  expertise_areas = ARRAY['baking', 'sourdough', 'local-gastronomy']
WHERE id = 'eef2bfde-56ca-48fd-a583-1bd9666e93b3';

-- Elena Fischer (Eisenstadt) - Herbalist
UPDATE public.profiles 
SET 
  first_name = 'Elena',
  last_name = 'Fischer',
  user_role = 'creator',
  location = 'Eisenstadt, Österreich',
  location_city = 'Eisenstadt',
  country = 'AT',
  bio = 'Zertifizierte Kräuterkundige und Naturheilpraktikerin. Ich bringe Menschen die Kraft der regionalen Heilpflanzen näher.',
  bio_de = 'Zertifizierte Kräuterkundige und Naturheilpraktikerin. Ich bringe Menschen die Kraft der regionalen Heilpflanzen näher.',
  bio_en = 'Certified herbalist and naturopath. I bring people closer to the power of regional medicinal plants.',
  expert_title = 'Herbalist & Natural Well-being',
  expert_title_de = 'Kräuterkundige & Natürliches Wohlbefinden',
  expert_title_en = 'Herbalist & Natural Well-being',
  is_verified_expert = true,
  is_public_profile = true,
  expertise_areas = ARRAY['herbalism', 'wellness', 'natural-healing']
WHERE id = '199346df-1ef7-4b85-9f96-610356a7c5ca';

-- Nagy Zoltán (Sopron) - Traditional Potter  
UPDATE public.profiles 
SET 
  first_name = 'Zoltán',
  last_name = 'Nagy',
  user_role = 'creator',
  location = 'Sopron, Magyarország',
  location_city = 'Sopron',
  country = 'HU',
  bio = 'Harmadik generációs fazekas. A hagyományos magyar kerámiakészítést tanítom, természetes anyagokból.',
  bio_de = 'Töpfer in dritter Generation. Ich lehre traditionelle ungarische Keramikherstellung mit natürlichen Materialien.',
  bio_en = 'Third-generation potter. I teach traditional Hungarian ceramics using natural materials.',
  expert_title = 'Traditional Pottery & Crafts',
  expert_title_de = 'Traditionelle Töpferei & Handwerk',
  expert_title_en = 'Traditional Pottery & Crafts',
  is_verified_expert = true,
  is_public_profile = true,
  expertise_areas = ARRAY['pottery', 'crafts', 'traditions']
WHERE id = '3ddf8449-98ac-4134-8441-287f1effabc1';

-- Step 2: Update Super Admin (Attila) - keeping sponsor role with proper credits
UPDATE public.profiles 
SET 
  organization_name = 'Success Inc.',
  organization_name_de = 'Success GmbH',
  organization_name_en = 'Success Inc.',
  credit_balance = 50000,
  sponsor_status = 'active',
  is_super_admin = true
WHERE id = '0be71725-70ac-4bd6-81b0-9fe106ed1573';