-- ============================================================================
-- A) DIAGNOSE: Current state of published programs
-- ============================================================================

-- List all published programs
SELECT 
  id,
  title,
  category,
  created_at,
  is_published,
  CASE 
    WHEN title LIKE '[DEV]%' THEN '✅ DEV'
    ELSE '❌ NOT DEV'
  END as dev_status
FROM public.expert_contents
WHERE is_published = true
ORDER BY created_at DESC;

-- Count DEV programs
SELECT 
  COUNT(*) FILTER (WHERE title LIKE '[DEV]%') as dev_count,
  COUNT(*) FILTER (WHERE title NOT LIKE '[DEV]%') as non_dev_count,
  COUNT(*) as total_published
FROM public.expert_contents
WHERE is_published = true;
