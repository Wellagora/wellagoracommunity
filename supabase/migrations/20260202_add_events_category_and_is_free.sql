-- Add category and is_free columns to events table for Phase 1 Events feature

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('market', 'workshop', 'social', 'sport', 'culture', 'nature')),
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;

-- Add comments for documentation
COMMENT ON COLUMN public.events.category IS 'Event category for filtering: market, workshop, social, sport, culture, nature';
COMMENT ON COLUMN public.events.is_free IS 'Whether the event is free to attend';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
