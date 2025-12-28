-- 1) Ensure expert_contents has a single canonical image field
ALTER TABLE public.expert_contents
ADD COLUMN IF NOT EXISTS image_url text;

-- Backfill from existing thumbnail_url where image_url is missing
UPDATE public.expert_contents
SET image_url = thumbnail_url
WHERE (image_url IS NULL OR image_url = '') AND thumbnail_url IS NOT NULL AND thumbnail_url <> '';

-- 2) Set the 6 Workshop Secrets to the requested unique images
UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
WHERE title ILIKE '%Kovász%';

UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
WHERE title ILIKE '%falunap%';

UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&q=80'
WHERE title ILIKE '%Gyógynövény%';

UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80'
WHERE title ILIKE '%asztalos%';

UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'
WHERE title ILIKE '%Zero-Waste%';

UPDATE public.expert_contents
SET image_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
WHERE title ILIKE '%marketing%' OR title ILIKE '%Etikus%';

-- Fallback: still missing -> keep thumbnail_url if present, otherwise set a neutral placeholder
UPDATE public.expert_contents
SET image_url = COALESCE(NULLIF(thumbnail_url, ''), 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=800&q=80')
WHERE image_url IS NULL OR image_url = '';

-- 3) Events: enforce unique images by ID (duplicates exist)
UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80'
WHERE id = '0e2da0bb-3529-4038-8857-3cb0c0bc242d';

UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&q=80'
WHERE id = 'c47d47b1-99ae-4194-aa53-8841a41b29c5';

UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80'
WHERE id = '4dcd5ac9-d77c-4847-b757-8a76b4b4066d';

UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=800&q=80'
WHERE id = 'dcb73217-4b16-4d35-962e-843e044b606b';

UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'
WHERE id = '3c9accf7-667b-4b49-8b26-606812918a2b';

UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
WHERE id = 'f251c078-89a3-40ac-82d7-fd056b8334ea';

-- Fallback for events still missing
UPDATE public.events
SET image_url = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'
WHERE image_url IS NULL OR image_url = '';