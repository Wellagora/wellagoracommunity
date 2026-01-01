-- 1. Update all content prices to have actual values (no 0 Ft)
UPDATE expert_contents 
SET price_huf = CASE 
    WHEN price_huf IS NULL OR price_huf <= 0 THEN 3490 
    ELSE price_huf 
END
WHERE is_published = true;

-- 2. Ensure all published content has sponsorship
INSERT INTO content_sponsorships (content_id, sponsor_id, total_licenses, used_licenses, is_active)
SELECT 
  ec.id,
  (SELECT id FROM sponsors LIMIT 1),
  100,
  FLOOR(RANDOM() * 20 + 5)::int,
  true
FROM expert_contents ec
WHERE ec.is_published = true
  AND ec.id NOT IN (SELECT content_id FROM content_sponsorships WHERE content_id IS NOT NULL)
ON CONFLICT DO NOTHING;