-- Add missing profile fields for matching and business features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS sustainability_goals TEXT[],
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Add indexes for better performance on matching queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON public.profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_sustainability_goals ON public.profiles USING GIN(sustainability_goals);

-- Add comments to document the new fields
COMMENT ON COLUMN public.profiles.location IS 'User location for regional matching (e.g., Budapest, Hungary)';
COMMENT ON COLUMN public.profiles.sustainability_goals IS 'Array of sustainability interest areas for matching algorithm';
COMMENT ON COLUMN public.profiles.industry IS 'Industry/sector for business users';
COMMENT ON COLUMN public.profiles.company_size IS 'Company size category for business matching';
COMMENT ON COLUMN public.profiles.website_url IS 'Website URL for organizations and businesses';