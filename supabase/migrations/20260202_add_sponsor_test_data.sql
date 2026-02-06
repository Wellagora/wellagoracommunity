-- Add test data for Sponsor Dashboard (attila.kelemen@proself.org)
-- This creates content_sponsorships and ensures spending data shows up correctly

-- First, ensure we have a sponsor record in the sponsors table
-- The sponsor_id in content_sponsorships references sponsors.id, not auth.users.id
INSERT INTO sponsors (id, name, slug, description, is_active, is_verified, location_city)
VALUES 
  ('0be71725-70ac-4bd6-81b0-9fe106ed1573', 'Success Inc.', 'success-inc', 'Test sponsor for dashboard', true, true, 'Budapest')
ON CONFLICT (id) DO UPDATE
SET 
  name = 'Success Inc.',
  is_active = true,
  is_verified = true;

-- Add content sponsorships for the sponsor user
INSERT INTO content_sponsorships (
  content_id, 
  sponsor_id, 
  total_licenses, 
  used_licenses, 
  is_active,
  max_sponsored_seats,
  sponsored_seats_used,
  sponsor_contribution_huf,
  created_at
)
SELECT 
  ec.id,
  '0be71725-70ac-4bd6-81b0-9fe106ed1573', -- Success Inc. sponsor user
  10,
  3,
  true,
  10,
  3,
  5000,
  NOW() - INTERVAL '10 days'
FROM expert_contents ec
WHERE ec.is_published = true
LIMIT 2
ON CONFLICT (content_id, sponsor_id) DO UPDATE
SET 
  is_active = true,
  total_licenses = 10,
  used_licenses = 3,
  max_sponsored_seats = 10,
  sponsored_seats_used = 3,
  sponsor_contribution_huf = 5000;

-- Ensure credit transactions are within 30 days for the "Költés (30 nap)" section
-- Delete old test transactions and recreate them with recent dates
DELETE FROM credit_transactions 
WHERE sponsor_user_id = '0be71725-70ac-4bd6-81b0-9fe106ed1573'
AND created_at < NOW() - INTERVAL '30 days';

-- Add recent spending transactions if they don't exist
INSERT INTO credit_transactions (sponsor_user_id, transaction_type, credits, description, created_at)
SELECT 
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  'spend',
  -50,
  'Program szponzorálás - ' || ec.title,
  NOW() - INTERVAL '5 days'
FROM expert_contents ec
WHERE ec.is_published = true
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO credit_transactions (sponsor_user_id, transaction_type, credits, description, created_at)
SELECT 
  '0be71725-70ac-4bd6-81b0-9fe106ed1573',
  'spend',
  -100,
  'Program szponzorálás - ' || ec.title,
  NOW() - INTERVAL '15 days'
FROM expert_contents ec
WHERE ec.is_published = true
OFFSET 1
LIMIT 1
ON CONFLICT DO NOTHING;
