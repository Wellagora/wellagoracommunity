-- Update expert_contents with unique, reliable images
UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1532996126646-c4da88043f1b?w=800&auto=format&fit=crop'
WHERE title LIKE '%Zero-Waste%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1610555356070-d0fb61016879?w=800&auto=format&fit=crop'
WHERE title LIKE '%asztalos%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1586225678964-054d66297906?w=800&auto=format&fit=crop'
WHERE title LIKE '%Kovász%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1511632765486-a0a920954cd2?w=800&auto=format&fit=crop'
WHERE title LIKE '%falunap%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1471193945509-9adadd0317c6?w=800&auto=format&fit=crop'
WHERE title LIKE '%Gyógynövények%';

UPDATE public.expert_contents 
SET thumbnail_url = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop'
WHERE title LIKE '%Etikus%';

-- Update events with unique images based on title
UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1523301349195-64eb6042084f?w=800&auto=format&fit=crop'
WHERE title LIKE '%kertészkedés%' OR title LIKE '%Kertész%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1506869645985-157d06730560?w=800&auto=format&fit=crop'
WHERE title LIKE '%történetmesélés%' OR title LIKE '%Káli%';

UPDATE public.events 
SET image_url = 'https://images.unsplash.com/photo-1605000058636-756884037197?w=800&auto=format&fit=crop'
WHERE title LIKE '%Zero Waste%' OR title LIKE '%zero waste%';