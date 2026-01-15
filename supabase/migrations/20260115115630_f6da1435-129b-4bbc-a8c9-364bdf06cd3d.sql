-- Create expert_media table for media library
CREATE TABLE public.expert_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('video', 'image')),
  thumbnail_url TEXT,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'raw' CHECK (status IN ('raw', 'in_draft', 'published')),
  program_id UUID REFERENCES public.expert_contents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_media ENABLE ROW LEVEL SECURITY;

-- Experts can manage their own media
CREATE POLICY "Experts can view own media"
ON public.expert_media
FOR SELECT
USING (auth.uid() = expert_id);

CREATE POLICY "Experts can insert own media"
ON public.expert_media
FOR INSERT
WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Experts can update own media"
ON public.expert_media
FOR UPDATE
USING (auth.uid() = expert_id);

CREATE POLICY "Experts can delete own media"
ON public.expert_media
FOR DELETE
USING (auth.uid() = expert_id);

-- Index for performance
CREATE INDEX idx_expert_media_expert_id ON public.expert_media(expert_id);
CREATE INDEX idx_expert_media_status ON public.expert_media(status);

-- Create storage bucket for expert media
INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-media', 'expert-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for expert-media bucket
CREATE POLICY "Experts can upload own media files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'expert-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Experts can update own media files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'expert-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Experts can delete own media files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'expert-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view expert media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'expert-media');

-- Trigger for updated_at
CREATE TRIGGER update_expert_media_updated_at
BEFORE UPDATE ON public.expert_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();