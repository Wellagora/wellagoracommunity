-- Update profiles for demo users with urban context (using valid enum values)
UPDATE profiles 
SET 
  first_name = 'Eszter',
  last_name = 'Tóth',
  role = 'citizen',
  user_role = 'member',
  is_super_admin = false,
  location = 'Budapest, Hungary',
  preferred_language = 'hu',
  updated_at = NOW()
WHERE id = 'd150eb0a-5923-45b2-aa04-9f9c39e211d4';

UPDATE profiles 
SET 
  first_name = 'István',
  last_name = 'Dr. Kovács',
  role = 'business',
  user_role = 'creator',
  is_super_admin = false,
  location = 'Vienna, Austria',
  bio = 'Executive coach és mindfulness tréner 15 éves tapasztalattal.',
  is_verified_expert = true,
  preferred_language = 'hu',
  updated_at = NOW()
WHERE id = 'eef2bfde-56ca-48fd-a583-1bd9666e93b3';

UPDATE profiles 
SET 
  first_name = 'Anna',
  last_name = 'Schmidt',
  role = 'business',
  user_role = 'sponsor',
  is_super_admin = false,
  organization_name = 'Success Inc.',
  location = 'Eisenstadt, Austria',
  credit_balance = 35000,
  preferred_language = 'de',
  updated_at = NOW()
WHERE id = '199346df-1ef7-4b85-9f96-610356a7c5ca';

UPDATE profiles 
SET 
  first_name = 'System',
  last_name = 'Admin',
  role = 'business',
  user_role = 'business',
  is_super_admin = true,
  location = 'Budapest, Hungary',
  preferred_language = 'hu',
  updated_at = NOW()
WHERE id = '3ddf8449-98ac-4134-8441-287f1effabc1';