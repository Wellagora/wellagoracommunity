-- Create organization logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for organization logos
CREATE POLICY "Organization logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Organization members can upload their logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Organization members can update their logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Organization members can delete their logo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);