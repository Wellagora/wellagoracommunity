-- SUPER ADMIN TEST DATA - Minimal version that works
DELETE FROM content_sponsorships WHERE discount_description LIKE '%TEST_ADMIN_%';
DELETE FROM expert_contents WHERE description LIKE '%TEST_ADMIN_%';
DELETE FROM sponsors WHERE description LIKE '%TEST_ADMIN_%';

-- 1. CREATE 3 SPONSORS
INSERT INTO sponsors (id, name, slug, description, is_active, is_verified, location_city)
VALUES 
  ('11111111-1111-1111-1111-111111111101', 'Öko Kert Kft', 'test-oko-kert', 'TEST_ADMIN_Sponsor - 50000 HUF', true, true, 'Budapest'),
  ('11111111-1111-1111-1111-111111111102', 'Béke Biztosító', 'test-beke-biztosito', 'TEST_ADMIN_Sponsor - 30000 HUF', true, true, 'Debrecen'),
  ('11111111-1111-1111-1111-111111111103', 'Zöld Energia Zrt', 'test-zold-energia', 'TEST_ADMIN_Sponsor - inactive', false, true, 'Szeged');

-- 2. CREATE 5 PROGRAMS
INSERT INTO expert_contents (id, title, description, category, content_type, price_huf, is_published, is_sponsored, max_capacity, access_type)
VALUES 
  ('44444444-4444-4444-4444-444444444401', 'Reggeli jóga', 'TEST_ADMIN_Program - Online jóga (12/20 hely)', 'wellness', 'online_live', 8000, true, true, 20, 'paid'),
  ('44444444-4444-4444-4444-444444444402', 'Kovászos kenyér', 'TEST_ADMIN_Program - TELT HÁZ (10/10)', 'cooking', 'in_person', 15000, true, true, 10, 'paid'),
  ('44444444-4444-4444-4444-444444444403', 'Városi kertészet', 'TEST_ADMIN_Program - Felvett kurzus', 'gardening', 'recorded', 12000, true, false, NULL, 'paid'),
  ('44444444-4444-4444-4444-444444444404', 'Esti meditáció', 'TEST_ADMIN_Program - Online meditáció (3/15)', 'wellness', 'online_live', 6000, true, true, 15, 'paid'),
  ('44444444-4444-4444-4444-444444444405', 'Fűszernövények', 'TEST_ADMIN_Program - Személyes műhely (0/8)', 'gardening', 'in_person', 10000, true, true, 8, 'paid');

-- 3. CREATE SPONSORSHIPS
INSERT INTO content_sponsorships (content_id, sponsor_id, sponsor_contribution_huf, max_sponsored_seats, sponsored_seats_used, is_active, discount_description, total_licenses)
VALUES 
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111101', 5000, 20, 12, true, 'TEST_ADMIN_Sponsorship - Öko Kert', 20),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111102', 10000, 10, 10, true, 'TEST_ADMIN_Sponsorship - Béke Biztosító', 10),
  ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111101', 4000, 15, 3, true, 'TEST_ADMIN_Sponsorship - Öko Kert', 15),
  ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111103', 7000, 8, 0, false, 'TEST_ADMIN_Sponsorship - Zöld Energia', 8);