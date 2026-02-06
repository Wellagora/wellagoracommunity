-- Create storage bucket for community images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable public read access to community images
CREATE POLICY IF NOT EXISTS "Public read community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- Allow authenticated users to upload images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload community images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update own community images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'community-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete own community images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
