-- ============================================================================
-- B) CLEANUP: Hide all non-DEV programs (set is_published=false)
-- ============================================================================
-- This is safer than DELETE - preserves data but hides from /programs

BEGIN;

-- First, delete sponsor support rules for non-DEV programs
DELETE FROM public.sponsor_support_rules
WHERE scope_type = 'program'
AND scope_id IN (
  SELECT id FROM public.expert_contents
  WHERE title NOT LIKE '[DEV]%' AND (category != 'dev' OR category IS NULL)
);

-- Then, unpublish all non-DEV programs
UPDATE public.expert_contents
SET is_published = false
WHERE title NOT LIKE '[DEV]%' 
AND (category != 'dev' OR category IS NULL);

COMMIT;

-- Verify cleanup
SELECT 
  COUNT(*) FILTER (WHERE is_published = true AND title LIKE '[DEV]%') as dev_published,
  COUNT(*) FILTER (WHERE is_published = true AND title NOT LIKE '[DEV]%') as non_dev_published,
  COUNT(*) FILTER (WHERE is_published = false) as unpublished_total
FROM public.expert_contents;
