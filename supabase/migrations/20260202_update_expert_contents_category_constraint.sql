-- Update expert_contents category constraint to include 5 new categories
-- New categories: market, community, sport, culture, family
-- Existing categories: lifestyle, craft, gastronomy, wellness, hiking, gardening, heritage, volunteering

-- Drop existing constraint if it exists
ALTER TABLE public.expert_contents 
DROP CONSTRAINT IF EXISTS expert_contents_category_check;

-- Add new constraint with all 13 unified categories
ALTER TABLE public.expert_contents 
ADD CONSTRAINT expert_contents_category_check 
CHECK (category IN (
  'lifestyle',
  'craft',
  'gastronomy',
  'wellness',
  'hiking',
  'gardening',
  'heritage',
  'volunteering',
  'market',
  'community',
  'sport',
  'culture',
  'family'
));

-- Update events table constraint to match (if not already done)
ALTER TABLE public.events 
DROP CONSTRAINT IF EXISTS events_category_check;

ALTER TABLE public.events 
ADD CONSTRAINT events_category_check 
CHECK (category IN (
  'lifestyle',
  'craft',
  'gastronomy',
  'wellness',
  'hiking',
  'gardening',
  'heritage',
  'volunteering',
  'market',
  'community',
  'sport',
  'culture',
  'family'
));

-- Add comment for documentation
COMMENT ON COLUMN public.expert_contents.category IS 'Unified category shared with events: lifestyle, craft, gastronomy, wellness, hiking, gardening, heritage, volunteering, market, community, sport, culture, family';
COMMENT ON COLUMN public.events.category IS 'Unified category shared with expert_contents: lifestyle, craft, gastronomy, wellness, hiking, gardening, heritage, volunteering, market, community, sport, culture, family';
