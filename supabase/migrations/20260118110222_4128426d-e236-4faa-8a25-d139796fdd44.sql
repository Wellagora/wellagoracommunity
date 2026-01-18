-- Update expert_contents with missing images
UPDATE expert_contents 
SET 
  image_url = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop',
  thumbnail_url = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop'
WHERE title = 'Jóga Webinar';

UPDATE expert_contents 
SET 
  image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  thumbnail_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
WHERE title = 'Workshop a kertben';

UPDATE expert_contents 
SET 
  image_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
  thumbnail_url = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop'
WHERE title = 'Kovászos videókurzus';