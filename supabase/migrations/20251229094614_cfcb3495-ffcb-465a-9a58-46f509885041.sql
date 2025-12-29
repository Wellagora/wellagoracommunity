-- Create content_milestones table
CREATE TABLE IF NOT EXISTS public.content_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.expert_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_milestones_content_id ON public.content_milestones(content_id);
CREATE INDEX IF NOT EXISTS idx_content_milestones_order ON public.content_milestones(content_id, order_index);

-- Enable RLS
ALTER TABLE public.content_milestones ENABLE ROW LEVEL SECURITY;

-- RLS: Public can view milestones for published content
CREATE POLICY "Public can view published milestones" ON public.content_milestones
  FOR SELECT USING (
    content_id IN (SELECT id FROM public.expert_contents WHERE is_published = true)
  );

-- RLS: Creators can manage their own milestones
CREATE POLICY "Creators can manage own milestones" ON public.content_milestones
  FOR ALL USING (
    content_id IN (SELECT id FROM public.expert_contents WHERE creator_id = auth.uid())
  );

-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view content images
CREATE POLICY "Anyone can view content images" ON storage.objects
  FOR SELECT USING (bucket_id = 'content-images');

-- Storage RLS: Authenticated users can upload to their folder
CREATE POLICY "Users can upload content images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'content-images' 
    AND auth.role() = 'authenticated'
  );

-- Storage RLS: Users can update their own images
CREATE POLICY "Users can update own content images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'content-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: Users can delete their own images
CREATE POLICY "Users can delete own content images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'content-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );