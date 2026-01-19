-- Create a challenge sponsorship linking "Success Inc." sponsor to Káli medence project
INSERT INTO public.challenge_sponsorships (
  challenge_id,
  sponsor_user_id,
  project_id,
  package_type,
  region,
  status,
  credit_cost,
  tier,
  start_date
) VALUES (
  'wellness-001', -- dummy challenge_id
  '0be71725-70ac-4bd6-81b0-9fe106ed1573', -- Success Inc. user id
  '0ad8a5ec-de14-4e90-8dff-31019c535b32', -- Káli medence project UUID
  'gold',
  'Káli-medence',
  'active',
  25000,
  'gold',
  NOW()
);

-- Create test content_access records to show participants
-- First, get some user IDs and link them to programs in this project
INSERT INTO public.content_access (user_id, content_id, access_type, amount_paid)
SELECT 
  p.id as user_id,
  ec.id as content_id,
  'sponsored' as access_type,
  0 as amount_paid
FROM profiles p
CROSS JOIN (SELECT id FROM expert_contents WHERE region_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32' LIMIT 3) ec
WHERE p.project_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32'
AND p.is_verified_expert = false
LIMIT 5;