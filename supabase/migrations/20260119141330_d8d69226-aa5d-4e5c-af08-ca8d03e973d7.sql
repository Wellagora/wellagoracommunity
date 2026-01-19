-- Add global expansion fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'HU',
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'HUF',
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Budapest',
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.country_code IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN public.projects.currency_code IS 'ISO 4217 currency code';
COMMENT ON COLUMN public.projects.timezone IS 'IANA timezone identifier';

-- Create index for country-based queries
CREATE INDEX IF NOT EXISTS idx_projects_country_code ON public.projects(country_code);

-- Add exchange rates table for multi-currency support
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(18, 8) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Exchange rates are viewable by authenticated users"
ON public.exchange_rates
FOR SELECT
TO authenticated
USING (true);

-- Allow super admins to manage exchange rates
CREATE POLICY "Super admins can manage exchange rates"
ON public.exchange_rates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_super_admin = true
  )
);

-- Insert default exchange rates (EUR as base)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
('EUR', 'HUF', 395.00),
('EUR', 'USD', 1.08),
('EUR', 'GBP', 0.86),
('EUR', 'CHF', 0.95),
('HUF', 'EUR', 0.00253),
('USD', 'EUR', 0.926),
('GBP', 'EUR', 1.163),
('CHF', 'EUR', 1.053)
ON CONFLICT (from_currency, to_currency) DO NOTHING;

-- Update existing projects with coordinates for Hungary
UPDATE public.projects 
SET 
  latitude = 47.1625,
  longitude = 19.5033,
  country_code = 'HU',
  currency_code = 'HUF'
WHERE country_code IS NULL OR country_code = 'HU';