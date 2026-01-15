-- Add avatar URLs and expert data for existing demo profiles
UPDATE profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  expert_title = 'Executive Coach & Mindfulness Trainer'
WHERE id = 'eef2bfde-56ca-48fd-a583-1bd9666e93b3';

UPDATE profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
WHERE id = 'd150eb0a-5923-45b2-aa04-9f9c39e211d4';

UPDATE profiles SET
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  expert_title = 'Sustainability Director at Success Inc.'
WHERE id = '199346df-1ef7-4b85-9f96-610356a7c5ca';

-- Create more vouchers for the Live Feed (spread over last 30 days)
INSERT INTO vouchers (user_id, content_id, status, created_at, code)
SELECT 
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  id,
  'active',
  NOW() - (random() * interval '30 days'),
  'DEMO-' || substr(md5(random()::text), 0, 8)
FROM expert_contents
LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO vouchers (user_id, content_id, status, created_at, code)
SELECT 
  '199346df-1ef7-4b85-9f96-610356a7c5ca',
  id,
  'active',
  NOW() - (random() * interval '30 days'),
  'DEMO-' || substr(md5(random()::text), 0, 8)
FROM expert_contents
OFFSET 2 LIMIT 3
ON CONFLICT DO NOTHING;