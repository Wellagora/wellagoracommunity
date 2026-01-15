-- Add AI suggestion column to expert_media
ALTER TABLE public.expert_media 
ADD COLUMN IF NOT EXISTS ai_suggestion JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.expert_media.ai_suggestion IS 'AI analysis result from Gemini: { category, suggestion_text, matched_program_id, confidence }';

-- Create program_media_links junction table
CREATE TABLE IF NOT EXISTS public.program_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.expert_contents(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.expert_media(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, media_id)
);

-- Enable RLS on program_media_links
ALTER TABLE public.program_media_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for program_media_links
CREATE POLICY "Experts can view own program media links"
ON public.program_media_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_contents ec 
    WHERE ec.id = program_media_links.program_id 
    AND ec.creator_id = auth.uid()
  )
);

CREATE POLICY "Experts can insert own program media links"
ON public.program_media_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expert_contents ec 
    WHERE ec.id = program_media_links.program_id 
    AND ec.creator_id = auth.uid()
  )
);

CREATE POLICY "Experts can update own program media links"
ON public.program_media_links
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.expert_contents ec 
    WHERE ec.id = program_media_links.program_id 
    AND ec.creator_id = auth.uid()
  )
);

CREATE POLICY "Experts can delete own program media links"
ON public.program_media_links
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.expert_contents ec 
    WHERE ec.id = program_media_links.program_id 
    AND ec.creator_id = auth.uid()
  )
);

-- Public can view links for published programs
CREATE POLICY "Public can view published program media links"
ON public.program_media_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_contents ec 
    WHERE ec.id = program_media_links.program_id 
    AND ec.is_published = true
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_program_media_links_program_id ON public.program_media_links(program_id);
CREATE INDEX IF NOT EXISTS idx_program_media_links_media_id ON public.program_media_links(media_id);

-- Add auto_create_drafts setting to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auto_create_drafts BOOLEAN DEFAULT false;

-- Create view for media usage count (computed)
CREATE OR REPLACE VIEW public.expert_media_with_usage AS
SELECT 
  em.*,
  COALESCE(usage.usage_count, 0) as usage_count
FROM public.expert_media em
LEFT JOIN (
  SELECT media_id, COUNT(*) as usage_count 
  FROM public.program_media_links 
  GROUP BY media_id
) usage ON em.id = usage.media_id;