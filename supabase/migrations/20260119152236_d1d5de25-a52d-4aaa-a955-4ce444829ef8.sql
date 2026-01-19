-- Update all programs with region_id='kali-medence' to use the actual project UUID
UPDATE public.expert_contents 
SET region_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32'
WHERE region_id = 'kali-medence';

-- Update any remaining null region_id to the first active project (Káli medence)
UPDATE public.expert_contents 
SET region_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32'
WHERE region_id IS NULL OR region_id = '';