-- ============================================================================
-- 2) VERIFY: Check only DEV programs remain published
-- ============================================================================

-- Count total published
SELECT COUNT(*) as published_total
FROM public.expert_contents
WHERE is_published = true;

-- Count DEV published
SELECT COUNT(*) as dev_published
FROM public.expert_contents
WHERE is_published = true
AND title LIKE '[DEV]%';

-- List all published programs (should only be DEV)
SELECT 
  id,
  title,
  category,
  is_published,
  created_at
FROM public.expert_contents
WHERE is_published = true
ORDER BY created_at DESC;
