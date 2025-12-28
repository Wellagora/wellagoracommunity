-- Add organization fields for sponsors
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_logo_url TEXT;

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing business-related storage policies if they exist
DROP POLICY IF EXISTS "Business can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Sponsors can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Sponsors update own logo" ON storage.objects;
DROP POLICY IF EXISTS "Sponsors delete own logo" ON storage.objects;
DROP POLICY IF EXISTS "Public org logos access" ON storage.objects;

-- Create storage RLS policies for organization-logos bucket
CREATE POLICY "Public org logos access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'organization-logos');

CREATE POLICY "Sponsors can upload logos" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'organization-logos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Sponsors update own logo" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'organization-logos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Sponsors delete own logo" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'organization-logos'
    AND auth.role() = 'authenticated'
  );