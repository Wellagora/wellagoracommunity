-- Add translations support to challenge_definitions
ALTER TABLE challenge_definitions
ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN challenge_definitions.translations IS 'Multi-language translations for title and description. Format: {"en": {"title": "...", "description": "..."}, "de": {...}, ...}';

-- Create index for better performance on translations lookup
CREATE INDEX IF NOT EXISTS idx_challenge_definitions_translations ON challenge_definitions USING GIN (translations);