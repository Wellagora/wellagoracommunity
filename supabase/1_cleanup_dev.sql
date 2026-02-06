-- ============================================================================
-- 1) CLEANUP: Unpublish non-DEV programs, delete DEV support chain
-- ============================================================================

BEGIN;

-- Delete sponsorship allocations for DEV programs
DELETE FROM public.sponsorship_allocations
WHERE rule_id IN (
  SELECT id FROM public.sponsor_support_rules
  WHERE scope_type = 'program'
  AND scope_id IN (SELECT id FROM public.expert_contents WHERE title LIKE '[DEV]%')
);

-- Delete sponsor support rules for DEV programs
DELETE FROM public.sponsor_support_rules
WHERE scope_type = 'program'
AND scope_id IN (
  SELECT id FROM public.expert_contents WHERE title LIKE '[DEV]%'
);

-- Unpublish ALL non-DEV programs
UPDATE public.expert_contents
SET is_published = false
WHERE is_published = true
AND title NOT LIKE '[DEV]%';

COMMIT;
