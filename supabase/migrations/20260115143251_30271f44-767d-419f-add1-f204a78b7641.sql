-- Fix super admin flag and add avatar URLs

-- Remove accidental super admin from Zoltán (should only be Attila)
UPDATE public.profiles 
SET is_super_admin = false
WHERE id = '3ddf8449-98ac-4134-8441-287f1effabc1';

-- Clear extra credit balance from Elena (she's an expert, not a sponsor)
UPDATE public.profiles 
SET credit_balance = 0, organization_name = NULL
WHERE id = '199346df-1ef7-4b85-9f96-610356a7c5ca';

-- Set avatar URLs for experts using the generated images
UPDATE public.profiles SET avatar_url = '/src/assets/expert-hanna.jpg' WHERE id = 'd150eb0a-5923-45b2-aa04-9f9c39e211d4';
UPDATE public.profiles SET avatar_url = '/src/assets/expert-marton.jpg' WHERE id = 'eef2bfde-56ca-48fd-a583-1bd9666e93b3';
UPDATE public.profiles SET avatar_url = '/src/assets/expert-elena.jpg' WHERE id = '199346df-1ef7-4b85-9f96-610356a7c5ca';
UPDATE public.profiles SET avatar_url = '/src/assets/expert-zoltan.jpg' WHERE id = '3ddf8449-98ac-4134-8441-287f1effabc1';