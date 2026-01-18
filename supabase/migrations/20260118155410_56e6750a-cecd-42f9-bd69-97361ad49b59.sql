-- Create sponsor-logos storage bucket for sponsor logo uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own sponsor logos
CREATE POLICY "Sponsors can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow sponsors to update their own logos
CREATE POLICY "Sponsors can update their own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'sponsor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow sponsors to delete their own logos
CREATE POLICY "Sponsors can delete their own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsor-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to sponsor logos
CREATE POLICY "Sponsor logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');