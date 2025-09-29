-- Challenge teljesítések és aktivitások összekapcsolása

-- Challenge teljesítések táblája
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_type TEXT NOT NULL DEFAULT 'manual', -- manual, photo, api_verified, peer_verified
  validation_status TEXT NOT NULL DEFAULT 'pending', -- pending, validated, rejected
  evidence_data JSONB, -- foto URL, GPS track, stb.
  impact_data JSONB NOT NULL, -- { "co2_saved": 2.5, "activity_type": "transport", "details": { "km": 12 } }
  points_earned INTEGER NOT NULL DEFAULT 0,
  validation_score NUMERIC DEFAULT 0.8, -- 0-1 skála mennyire valid
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced sustainability activities with challenge linkage
ALTER TABLE public.sustainability_activities 
ADD COLUMN IF NOT EXISTS challenge_completion_id UUID REFERENCES public.challenge_completions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS validation_method TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS evidence_url TEXT,
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;

-- Challenge definitions (master data)
CREATE TABLE public.challenge_definitions (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- transport, energy, waste, water, community
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  base_impact JSONB NOT NULL, -- default CO2/pontok/stb számítás
  validation_requirements JSONB, -- milyen validálás szükséges
  duration_days INTEGER DEFAULT 1,
  points_base INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_definitions ENABLE ROW LEVEL SECURITY;

-- Challenge completions policies
CREATE POLICY "Users can view their own challenge completions"
ON public.challenge_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge completions"
ON public.challenge_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge completions"
ON public.challenge_completions FOR UPDATE
USING (auth.uid() = user_id);

-- Challenge definitions policies (public read)
CREATE POLICY "Challenge definitions are viewable by everyone"
ON public.challenge_definitions FOR SELECT
USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_challenge_completions_updated_at
BEFORE UPDATE ON public.challenge_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample challenge definitions
INSERT INTO public.challenge_definitions (id, title, description, category, base_impact, validation_requirements, points_base) VALUES
('bike-to-work', 'Bike to Work Challenge', 'Biciklizz munkába autó helyett egy hétig', 'transport', 
 '{"co2_saved_per_day": 4.2, "calculation_method": "user_distance * 0.21"}',
 '{"options": ["manual", "photo", "gps"], "bonus_multipliers": {"photo": 1.2, "gps": 1.5}}', 150),

('led-switch', 'LED Fényváltás', 'Cseréld le otthoni izzóidat LED-re', 'energy',
 '{"co2_saved_monthly": 8.5, "calculation_method": "bulb_count * 2.8"}',
 '{"options": ["manual", "photo"], "bonus_multipliers": {"photo": 1.3}}', 200),

('zero-waste-week', 'Zero Waste Hét', 'Egy hétig kerüld a eldobható csomagolást', 'waste',
 '{"co2_saved": 12.3, "calculation_method": "fixed_impact"}',
 '{"options": ["manual", "photo", "community"], "bonus_multipliers": {"photo": 1.2, "community": 1.4}}', 180),

('water-saver', 'Víz Takarékos', 'Csökkentsd vízfogyasztásodat tudatos használattal', 'water',
 '{"co2_saved_monthly": 1.8, "calculation_method": "water_saved_liters * 0.0004"}',
 '{"options": ["manual", "smart_meter"], "bonus_multipliers": {"smart_meter": 2.0}}', 120);