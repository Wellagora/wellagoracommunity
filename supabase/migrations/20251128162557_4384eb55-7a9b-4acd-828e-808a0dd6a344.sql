-- Create legal_content table for managing Impressum and Privacy Policy
CREATE TABLE public.legal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('impressum', 'privacy_policy')),
  section_key TEXT NOT NULL,
  translations JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(content_type, section_key)
);

-- Enable RLS
ALTER TABLE public.legal_content ENABLE ROW LEVEL SECURITY;

-- Public can view active legal content
CREATE POLICY "Anyone can view active legal content"
ON public.legal_content
FOR SELECT
USING (is_active = true);

-- Only super admins can manage legal content
CREATE POLICY "Super admins can insert legal content"
ON public.legal_content
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update legal content"
ON public.legal_content
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete legal content"
ON public.legal_content
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_legal_content_updated_at
BEFORE UPDATE ON public.legal_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_legal_content_type ON public.legal_content(content_type, is_active);
CREATE INDEX idx_legal_content_order ON public.legal_content(content_type, display_order);