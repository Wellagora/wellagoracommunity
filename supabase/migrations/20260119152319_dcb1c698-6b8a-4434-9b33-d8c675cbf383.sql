-- Assign all verified experts/creators to the Káli medence project for testing
UPDATE public.profiles 
SET project_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32'
WHERE is_verified_expert = true AND project_id IS NULL;