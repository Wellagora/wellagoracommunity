-- Add hierarchical region fields and coordinates to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Hungary',
ADD COLUMN IF NOT EXISTS region TEXT, -- e.g., "Alsó-Ausztria", "Pest megye"
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT, -- e.g., "V. kerület"
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS region_type TEXT CHECK (region_type IN ('country', 'region', 'city', 'district', 'local')),
ADD COLUMN IF NOT EXISTS visibility_radius_km INTEGER DEFAULT 50; -- How far they want to connect

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles (country, region, city, district);

-- Add stakeholder matching preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS seeking_partnerships BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_stakeholder_types TEXT[] DEFAULT ARRAY['citizen', 'business', 'ngo', 'government'];

-- Create a view for regional stakeholder matching
CREATE OR REPLACE VIEW public.regional_stakeholders AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.public_display_name,
  p.user_role,
  p.organization,
  p.organization_id,
  p.bio,
  p.avatar_url,
  p.location,
  p.country,
  p.region,
  p.city,
  p.district,
  p.latitude,
  p.longitude,
  p.region_type,
  p.visibility_radius_km,
  p.sustainability_goals,
  p.seeking_partnerships,
  p.preferred_stakeholder_types,
  p.is_public_profile
FROM public.profiles p
WHERE p.is_public_profile = true
  AND p.seeking_partnerships = true;