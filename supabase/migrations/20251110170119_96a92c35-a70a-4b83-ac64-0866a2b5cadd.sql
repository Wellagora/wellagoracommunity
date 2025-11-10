-- Create storage bucket for program images
INSERT INTO storage.buckets (id, name, public)
VALUES ('program-images', 'program-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for program images
CREATE POLICY "Program images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'program-images');

CREATE POLICY "Admins can upload program images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'program-images' 
  AND (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  ))
);

CREATE POLICY "Admins can update program images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'program-images' 
  AND (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  ))
);

CREATE POLICY "Admins can delete program images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'program-images' 
  AND (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'super_admin'
  ))
);