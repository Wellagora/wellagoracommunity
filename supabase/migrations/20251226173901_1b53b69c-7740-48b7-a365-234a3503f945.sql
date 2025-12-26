-- Rename challenge_id to program_id in events table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'events' AND column_name = 'challenge_id') THEN
    ALTER TABLE public.events RENAME COLUMN challenge_id TO program_id;
  END IF;
END $$;