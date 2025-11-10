-- Assign all existing programs to the Káli medence project
UPDATE challenge_definitions 
SET project_id = '0ad8a5ec-de14-4e90-8dff-31019c535b32' 
WHERE project_id IS NULL;