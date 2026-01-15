-- First, INSERT the profiles (they don't exist yet - only auth.users exist)
INSERT INTO profiles (id, email, first_name, last_name, role, user_role, is_super_admin, location, preferred_language, bio, is_verified_expert, organization_name, credit_balance, created_at, updated_at)
VALUES 
('d150eb0a-5923-45b2-aa04-9f9c39e211d4', 'user1@wellagora.org', 'Eszter', 'Tóth', 'citizen', 'member', false, 'Budapest, Hungary', 'hu', NULL, false, NULL, 0, NOW() - INTERVAL '28 days', NOW()),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'user2@wellagora.org', 'István', 'Dr. Kovács', 'business', 'creator', false, 'Vienna, Austria', 'hu', 'Executive coach és mindfulness tréner 15 éves tapasztalattal.', true, NULL, 0, NOW() - INTERVAL '30 days', NOW()),
('199346df-1ef7-4b85-9f96-610356a7c5ca', 'user3@wellagora.org', 'Anna', 'Schmidt', 'business', 'sponsor', false, 'Eisenstadt, Austria', 'de', NULL, false, 'Success Inc.', 35000, NOW() - INTERVAL '25 days', NOW()),
('3ddf8449-98ac-4134-8441-287f1effabc1', 'user4@wellagora.org', 'System', 'Admin', 'business', 'business', true, 'Budapest, Hungary', 'hu', NULL, false, NULL, 0, NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  user_role = EXCLUDED.user_role,
  is_super_admin = EXCLUDED.is_super_admin,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio,
  is_verified_expert = EXCLUDED.is_verified_expert,
  organization_name = EXCLUDED.organization_name,
  credit_balance = EXCLUDED.credit_balance,
  updated_at = NOW();