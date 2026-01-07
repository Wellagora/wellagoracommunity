-- Add translated columns to expert_contents
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS title_de TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add translated columns to profiles for expert specialty/bio
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expert_title_en TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expert_title_de TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_en TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio_de TEXT;

-- Add organization name translations for sponsors
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name_en TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name_de TEXT;