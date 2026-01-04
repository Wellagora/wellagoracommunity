-- Create regions table
CREATE TABLE public.regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT DEFAULT 'HUF' CHECK (currency IN ('HUF', 'EUR')),
  locale TEXT DEFAULT 'hu',
  country_code TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active regions
CREATE POLICY "Anyone can view active regions"
ON public.regions
FOR SELECT
USING (is_active = true);

-- Super admins can manage all regions
CREATE POLICY "Super admins can manage regions"
ON public.regions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Seed initial data
INSERT INTO public.regions (id, name, currency, locale, country_code, is_active) VALUES 
('kali-medence', 'Káli-medence', 'HUF', 'hu', 'HU', true),
('wien-neubau', 'Wien VII. Bezirk', 'EUR', 'de', 'AT', false);