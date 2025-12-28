-- Update events with unique images based on title patterns
UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80'
WHERE title ILIKE '%kertészkedés%' OR title ILIKE '%kert%' OR title ILIKE '%ültetés%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'
WHERE title ILIKE '%történetmesélés%' OR title ILIKE '%történet%' OR title ILIKE '%emlék%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'
WHERE title ILIKE '%Zero Waste%' OR title ILIKE '%hulladék%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
WHERE title ILIKE '%workshop%' OR title ILIKE '%műhely%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
WHERE title ILIKE '%főzés%' OR title ILIKE '%gasztro%' OR title ILIKE '%konyha%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
WHERE title ILIKE '%közösség%' OR title ILIKE '%találkozó%';

-- Fallback for any remaining events without images
UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'
WHERE image_url IS NULL OR image_url = '';

-- Update expert_contents (Műhelytitkok) with unique images
UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80'
WHERE title ILIKE '%Zero-Waste%' OR title ILIKE '%hulladék%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
WHERE title ILIKE '%asztalos%' OR title ILIKE '%kézműves%' OR title ILIKE '%fa%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'
WHERE title ILIKE '%Kovász%' OR title ILIKE '%kenyér%' OR title ILIKE '%pék%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80'
WHERE title ILIKE '%falunap%' OR title ILIKE '%közösség%' OR title ILIKE '%szervez%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80'
WHERE title ILIKE '%gyógynövény%' OR title ILIKE '%herb%' OR title ILIKE '%tea%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80'
WHERE title ILIKE '%digitális%' OR title ILIKE '%remote%' OR title ILIKE '%online%' OR title ILIKE '%marketing%' OR title ILIKE '%etikus%';

-- Fallback for any remaining content without images
UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1518005020251-58296d8f8b4d?w=800&q=80'
WHERE thumbnail_url IS NULL OR thumbnail_url = '';