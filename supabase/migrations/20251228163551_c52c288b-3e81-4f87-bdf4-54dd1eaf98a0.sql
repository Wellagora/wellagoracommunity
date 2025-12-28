-- Update thumbnail URLs for workshop secrets with Unsplash images
UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?w=800&q=80'
WHERE title LIKE '%Zero-Waste%' OR category = 'sustainability';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=800&q=80'
WHERE title LIKE '%asztalos%' OR category = 'workshop';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80'
WHERE title LIKE '%Kovász%' OR category = 'gastronomy';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80'
WHERE title LIKE '%falunap%' OR category = 'community';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&q=80'
WHERE title LIKE '%Gyógynövények%' OR category = 'wellness';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80'
WHERE title LIKE '%Etikus%' OR category = 'business';

-- Update events with a default image
UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80'
WHERE image_url IS NULL;