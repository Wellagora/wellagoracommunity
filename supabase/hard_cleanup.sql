-- ============================================================================
-- 1) HARD CLEANUP: Unpublish ALL non-DEV programs
-- ============================================================================

BEGIN;

-- Delete sponsorship allocations for DEV programs (will be recreated by seed)
DELETE FROM public.sponsorship_allocations
WHERE rule_id IN (
  SELECT id FROM public.sponsor_support_rules
  WHERE scope_type = 'program'
  AND scope_id IN (SELECT id FROM public.expert_contents WHERE title LIKE '[DEV]%')
);

-- Delete sponsor support rules for DEV programs (will be recreated by seed)
DELETE FROM public.sponsor_support_rules
WHERE scope_type = 'program'
AND scope_id IN (
  SELECT id FROM public.expert_contents WHERE title LIKE '[DEV]%'
);

-- Unpublish ALL non-DEV programs (no category filter)
UPDATE public.expert_contents
SET is_published = false
WHERE is_published = true
AND title NOT LIKE '[DEV]%';

COMMIT;
