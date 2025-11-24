-- Add translations column to projects table to support multilingual project names and descriptions
ALTER TABLE projects ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

-- Add a comment to explain the structure
COMMENT ON COLUMN projects.translations IS 'Stores translations for project name and description in format: {"de": {"name": "...", "description": "..."}, "en": {...}, "hu": {...}}';

-- Update existing Káli medence project with translations
UPDATE projects 
SET translations = jsonb_build_object(
  'hu', jsonb_build_object(
    'name', 'Káli medence közösségépítés',
    'description', 'Fenntartható közösségépítési program a Káli medence négy falujában'
  ),
  'de', jsonb_build_object(
    'name', 'Káli-Becken Gemeinschaftsaufbau',
    'description', 'Nachhaltige Gemeinschaftsaufbauprogramm in vier Dörfern des Káli-Beckens'
  ),
  'en', jsonb_build_object(
    'name', 'Káli Basin Community Building',
    'description', 'Sustainable community building program in four villages of the Káli Basin'
  ),
  'cs', jsonb_build_object(
    'name', 'Budování komunity v Káli pánvi',
    'description', 'Program udržitelného budování komunity ve čtyřech vesnicích Káli pánve'
  ),
  'sk', jsonb_build_object(
    'name', 'Budovanie komunity v Káli kotline',
    'description', 'Program udržateľného budovania komunity v štyroch dedinách Káli kotliny'
  ),
  'hr', jsonb_build_object(
    'name', 'Izgradnja zajednice u bazenu Káli',
    'description', 'Program održivog izgradnje zajednice u četiri sela bazena Káli'
  ),
  'ro', jsonb_build_object(
    'name', 'Construirea comunității în bazinul Káli',
    'description', 'Program de construire durabilă a comunității în patru sate din bazinul Káli'
  ),
  'pl', jsonb_build_object(
    'name', 'Budowanie społeczności w kotlinie Káli',
    'description', 'Program zrównoważonego budowania społeczności w czterech wioskach kotliny Káli'
  )
)
WHERE slug = 'kali-medence' OR name LIKE '%Káli%';