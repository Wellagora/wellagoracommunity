-- Add image_url field to challenge_definitions table
ALTER TABLE challenge_definitions 
ADD COLUMN IF NOT EXISTS image_url text;