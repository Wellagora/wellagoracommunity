-- Delete test/mock sponsors and keep real partners
DELETE FROM sponsors WHERE name IN ('Öko Kert Kft', 'Béke Biztosító', 'Zöld Energia Zrt');

-- Insert real brand partners if they don't exist
INSERT INTO sponsors (name, slug, logo_url, description, location_city, is_active, is_verified, created_at)
VALUES
  ('DM Drogerie Markt', 'dm-drogerie', NULL, 'Egészség és szépségápolás', 'Budapest', true, true, NOW()),
  ('OBI', 'obi', NULL, 'Barkács és kertészet', 'Budapest', true, true, NOW()),
  ('Praktiker', 'praktiker', NULL, 'Otthon és kert', 'Budapest', true, true, NOW()),
  ('Rossmann', 'rossmann', NULL, 'Drogéria', 'Budapest', true, true, NOW()),
  ('SPAR', 'spar', NULL, 'Élelmiszer és háztartás', 'Budapest', true, true, NOW()),
  ('Lidl', 'lidl', NULL, 'Élelmiszer diszkont', 'Budapest', true, true, NOW())
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = true,
  is_verified = true;