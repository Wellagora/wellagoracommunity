-- Seed Test Programs for Marketplace Testing
-- This creates 2 published programs (1 HUF, 1 EUR) with approved localizations in HU/DE/EN
-- Run this in Supabase SQL Editor to populate marketplace

-- First, get or create a test creator user
-- Replace 'YOUR_USER_ID' with an actual user ID from your profiles table
-- Or use this query to find one: SELECT id FROM profiles WHERE user_role = 'expert' LIMIT 1;

DO $$
DECLARE
  test_creator_id UUID;
  program_huf_id UUID;
  program_eur_id UUID;
BEGIN
  -- Get first expert user, or use a specific ID
  SELECT id INTO test_creator_id FROM profiles WHERE user_role = 'expert' LIMIT 1;
  
  -- If no expert exists, create a test one (optional - comment out if not needed)
  IF test_creator_id IS NULL THEN
    INSERT INTO profiles (id, first_name, last_name, user_role, is_verified_expert)
    VALUES (
      gen_random_uuid(),
      'Test',
      'Expert',
      'expert',
      true
    )
    RETURNING id INTO test_creator_id;
  END IF;

  -- Generate UUIDs for programs
  program_huf_id := gen_random_uuid();
  program_eur_id := gen_random_uuid();

  -- Insert Program 1: HUF Program
  INSERT INTO expert_contents (
    id,
    creator_id,
    title,
    description,
    category,
    content_type,
    access_type,
    price_huf,
    currency,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_huf_id,
    test_creator_id,
    'Fenntartható Kertészkedés Workshopja',
    'Tanuld meg a fenntartható kertészkedés alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez.',
    'sustainability',
    'in_person',
    'one_time_purchase',
    10000,
    'HUF',
    true,
    true,
    NOW(),
    NOW()
  );

  -- Insert Program 2: EUR Program
  INSERT INTO expert_contents (
    id,
    creator_id,
    title,
    description,
    category,
    content_type,
    access_type,
    price_huf,
    price_eur,
    currency,
    is_published,
    is_featured,
    created_at,
    updated_at
  ) VALUES (
    program_eur_id,
    test_creator_id,
    'Community Impact Workshop',
    'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs.',
    'community',
    'online_live',
    'one_time_purchase',
    20000,
    50,
    'EUR',
    true,
    false,
    NOW(),
    NOW()
  );

  -- Insert approved Hungarian localizations
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES
    (
      program_huf_id,
      'hu',
      'Fenntartható Kertészkedés Workshopja',
      'Tanuld meg a fenntartható kertészkedés alapjait! Gyakorlati tippek komposztáláshoz, vízgyűjtéshez és természetes növényvédelemhez. Ideális kezdőknek és haladóknak egyaránt.',
      true,
      NOW()
    ),
    (
      program_eur_id,
      'hu',
      'Közösségi Hatás Mérése Workshop',
      'Tanuld meg, hogyan mérd és maximalizáld közösségi hatásodat. Gyakorlati keretrendszerek szociális vállalkozások és civil szervezetek számára.',
      true,
      NOW()
    );

  -- Insert approved German localizations
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES
    (
      program_huf_id,
      'de',
      'Nachhaltige Gartenarbeit Workshop',
      'Lernen Sie die Grundlagen der nachhaltigen Gartenarbeit! Praktische Tipps für Kompostierung, Regenwassersammlung und natürlichen Pflanzenschutz.',
      true,
      NOW()
    ),
    (
      program_eur_id,
      'de',
      'Community Impact Workshop',
      'Erfahren Sie, wie Sie Ihre Community-Wirkung messen und maximieren können. Praktische Frameworks für Sozialunternehmen und NGOs.',
      true,
      NOW()
    );

  -- Insert approved English localizations
  INSERT INTO content_localizations (content_id, locale, title, description, is_approved, created_at)
  VALUES
    (
      program_huf_id,
      'en',
      'Sustainable Gardening Workshop',
      'Learn the fundamentals of sustainable gardening! Practical tips for composting, rainwater harvesting, and natural pest control.',
      true,
      NOW()
    ),
    (
      program_eur_id,
      'en',
      'Community Impact Workshop',
      'Learn how to measure and maximize your community impact. Practical frameworks for social enterprises and NGOs.',
      true,
      NOW()
    );

  -- Output the program IDs for reference
  RAISE NOTICE 'Created HUF Program ID: %', program_huf_id;
  RAISE NOTICE 'Created EUR Program ID: %', program_eur_id;
  RAISE NOTICE 'Creator ID: %', test_creator_id;
  
END $$;

-- Verify the programs were created
SELECT 
  ec.id,
  ec.title,
  ec.currency,
  ec.price_huf,
  ec.price_eur,
  ec.is_published,
  COUNT(cl.id) as approved_translations
FROM expert_contents ec
LEFT JOIN content_localizations cl ON ec.id = cl.content_id AND cl.is_approved = true
WHERE ec.is_published = true
GROUP BY ec.id, ec.title, ec.currency, ec.price_huf, ec.price_eur, ec.is_published
ORDER BY ec.created_at DESC
LIMIT 5;
