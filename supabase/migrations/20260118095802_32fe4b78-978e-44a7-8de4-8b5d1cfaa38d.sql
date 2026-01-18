-- Create sponsorship links between sponsor and the 3 test programs
-- Using 'Káli Panzió' sponsor (id: 1d557991-bdd8-4fa0-9731-0c0a9bc7ac4a)

-- First get the content IDs for the new programs
WITH new_contents AS (
  SELECT id, title, price_huf FROM public.expert_contents 
  WHERE title IN ('Kovászos videókurzus', 'Jóga Webinar', 'Workshop a kertben')
)
INSERT INTO public.content_sponsorships (
  content_id,
  sponsor_id,
  total_licenses,
  used_licenses,
  is_active,
  sponsor_contribution_huf,
  max_sponsored_seats,
  sponsored_seats_used,
  sponsorship_benefit
)
SELECT 
  nc.id,
  '1d557991-bdd8-4fa0-9731-0c0a9bc7ac4a'::uuid,
  CASE 
    WHEN nc.title = 'Kovászos videókurzus' THEN 50
    WHEN nc.title = 'Jóga Webinar' THEN 30
    ELSE 10
  END,
  CASE 
    WHEN nc.title = 'Kovászos videókurzus' THEN 12
    WHEN nc.title = 'Jóga Webinar' THEN 8
    ELSE 3
  END,
  true,
  CASE 
    WHEN nc.title = 'Kovászos videókurzus' THEN 4000  -- 40% of 10000
    WHEN nc.title = 'Jóga Webinar' THEN 2500         -- 50% of 5000
    ELSE 7500                                         -- 50% of 15000
  END,
  CASE 
    WHEN nc.title = 'Kovászos videókurzus' THEN 50
    WHEN nc.title = 'Jóga Webinar' THEN 30
    ELSE 10
  END,
  CASE 
    WHEN nc.title = 'Kovászos videókurzus' THEN 12
    WHEN nc.title = 'Jóga Webinar' THEN 8
    ELSE 3
  END,
  'Fenntarthatósági kezdeményezés támogatása'
FROM new_contents nc;

-- Update the sponsor info on the programs
UPDATE public.expert_contents
SET 
  sponsor_name = 'Káli Panzió',
  sponsor_id = (SELECT id FROM profiles WHERE first_name = 'Attila' LIMIT 1),
  fixed_sponsor_amount = CASE 
    WHEN title = 'Kovászos videókurzus' THEN 4000
    WHEN title = 'Jóga Webinar' THEN 2500
    ELSE 7500
  END
WHERE title IN ('Kovászos videókurzus', 'Jóga Webinar', 'Workshop a kertben');