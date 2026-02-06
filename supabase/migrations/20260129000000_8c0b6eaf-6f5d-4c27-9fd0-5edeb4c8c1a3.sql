-- content localizations for expert contents (HU/EN/DE)

CREATE TABLE IF NOT EXISTS public.content_localizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.expert_contents(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('hu', 'en', 'de')),
  title text,
  description text,
  long_content jsonb,
  is_ai_generated boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  source_locale text CHECK (source_locale IN ('hu', 'en', 'de')),
  translated_at timestamptz,
  edited_at timestamptz,
  approved_at timestamptz,
  UNIQUE (content_id, locale)
);

ALTER TABLE public.content_localizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.expert_contents
ADD COLUMN IF NOT EXISTS master_locale text NOT NULL DEFAULT 'hu' CHECK (master_locale IN ('hu', 'en', 'de'));

ALTER TABLE public.expert_contents
ADD COLUMN IF NOT EXISTS translation_status text NOT NULL DEFAULT 'not_started'
CHECK (translation_status IN ('not_started', 'in_progress', 'needs_review', 'approved'));

-- Public can only view approved localizations for published content
CREATE POLICY "Public can view approved content localizations"
  ON public.content_localizations FOR SELECT
  USING (
    is_approved = true
    AND EXISTS (
      SELECT 1
      FROM public.expert_contents c
      WHERE c.id = content_localizations.content_id
        AND c.is_published = true
    )
  );

-- Creators can manage localizations of their own content
CREATE POLICY "Creators can view their content localizations"
  ON public.content_localizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.expert_contents c
      WHERE c.id = content_localizations.content_id
        AND c.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can insert their content localizations"
  ON public.content_localizations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.expert_contents c
      WHERE c.id = content_localizations.content_id
        AND c.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their content localizations"
  ON public.content_localizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.expert_contents c
      WHERE c.id = content_localizations.content_id
        AND c.creator_id = auth.uid()
    )
  );

-- Backfill existing expert_contents fields into content_localizations
INSERT INTO public.content_localizations (
  content_id,
  locale,
  title,
  description,
  is_ai_generated,
  is_approved,
  source_locale,
  translated_at,
  edited_at,
  approved_at
)
SELECT
  c.id,
  'hu',
  c.title,
  c.description,
  false,
  true,
  NULL,
  NULL,
  c.updated_at,
  c.updated_at
FROM public.expert_contents c
ON CONFLICT (content_id, locale) DO NOTHING;

INSERT INTO public.content_localizations (
  content_id,
  locale,
  title,
  description,
  is_ai_generated,
  is_approved,
  source_locale,
  translated_at,
  edited_at
)
SELECT
  c.id,
  'en',
  c.title_en,
  c.description_en,
  true,
  false,
  'hu',
  c.updated_at,
  c.updated_at
FROM public.expert_contents c
WHERE (c.title_en IS NOT NULL AND btrim(c.title_en) <> '')
   OR (c.description_en IS NOT NULL AND btrim(c.description_en) <> '')
ON CONFLICT (content_id, locale) DO NOTHING;

INSERT INTO public.content_localizations (
  content_id,
  locale,
  title,
  description,
  is_ai_generated,
  is_approved,
  source_locale,
  translated_at,
  edited_at
)
SELECT
  c.id,
  'de',
  c.title_de,
  c.description_de,
  true,
  false,
  'hu',
  c.updated_at,
  c.updated_at
FROM public.expert_contents c
WHERE (c.title_de IS NOT NULL AND btrim(c.title_de) <> '')
   OR (c.description_de IS NOT NULL AND btrim(c.description_de) <> '')
ON CONFLICT (content_id, locale) DO NOTHING;
