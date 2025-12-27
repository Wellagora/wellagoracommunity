-- Create storage bucket for expert content thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-content-thumbnails', 'expert-content-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow creators to upload their own files
CREATE POLICY "Creators can upload own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expert-content-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow creators to update their own files
CREATE POLICY "Creators can update own thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expert-content-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow creators to delete their own files
CREATE POLICY "Creators can delete own thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expert-content-thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access for thumbnails
CREATE POLICY "Public can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'expert-content-thumbnails');