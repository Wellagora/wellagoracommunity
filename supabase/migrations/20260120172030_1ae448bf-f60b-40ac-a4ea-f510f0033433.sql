-- Create event_sponsors junction table
CREATE TABLE public.event_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
  contribution_amount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, sponsor_id)
);

-- Enable RLS
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Event sponsors are viewable by everyone" 
ON public.event_sponsors 
FOR SELECT 
USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage event sponsors" 
ON public.event_sponsors 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

-- Create index for fast lookup
CREATE INDEX idx_event_sponsors_event_id ON public.event_sponsors(event_id);
CREATE INDEX idx_event_sponsors_sponsor_id ON public.event_sponsors(sponsor_id);

-- Seed some example data
INSERT INTO public.event_sponsors (event_id, sponsor_id, tier) 
SELECT 
  '8f022465-38c1-473b-b6f8-5fd4ccb4659b'::uuid,
  id,
  CASE 
    WHEN name = 'DM Drogerie Markt' THEN 'gold'
    WHEN name = 'OBI' THEN 'silver'
    ELSE 'bronze'
  END
FROM sponsors 
WHERE is_active = true 
LIMIT 3;