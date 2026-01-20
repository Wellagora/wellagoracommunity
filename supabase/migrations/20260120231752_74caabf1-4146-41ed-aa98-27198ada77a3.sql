-- Add localization columns to events table for automatic translations
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_de TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_de TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.events.title_en IS 'English translation of title';
COMMENT ON COLUMN public.events.title_de IS 'German translation of title';
COMMENT ON COLUMN public.events.description_en IS 'English translation of description';
COMMENT ON COLUMN public.events.description_de IS 'German translation of description';