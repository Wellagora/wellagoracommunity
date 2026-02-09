-- ================================================
-- WELLAGORA TRANSACTION FLOW MIGRATION
-- 2026-02-09
-- NE FUTTASD AUTOMATIKUSAN — kézzel a Supabase SQL Editor-ban
-- ================================================

-- 1. Expert contents bővítés (csak ha hiányzik)
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'online';
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'HUF';
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS current_participants INTEGER DEFAULT 0;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS event_location TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS original_price INTEGER;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsored_at TIMESTAMPTZ;

-- 2. Content type constraint (ha még nincs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expert_contents_content_type_check'
  ) THEN
    ALTER TABLE expert_contents ADD CONSTRAINT expert_contents_content_type_check
      CHECK (content_type IN ('online', 'live_online', 'in_person', 'online_live', 'recorded'));
  END IF;
END $$;

-- 3. Participants increment function (atomikus)
CREATE OR REPLACE FUNCTION increment_participants(p_content_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE expert_contents
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = p_content_id;
  
  -- Ha elérte a max-ot, jelöljük beteltnek
  UPDATE expert_contents
  SET is_published = FALSE
  WHERE id = p_content_id
  AND max_capacity IS NOT NULL
  AND current_participants >= max_capacity
  AND is_published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Content access bővítés
ALTER TABLE content_access ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'purchased';
ALTER TABLE content_access ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Index a content_access dupla-check-hez
CREATE INDEX IF NOT EXISTS idx_content_access_user_content 
  ON content_access(user_id, content_id);

-- 6. Index az expert_contents kereséshez
CREATE INDEX IF NOT EXISTS idx_expert_contents_published 
  ON expert_contents(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_contents_creator 
  ON expert_contents(creator_id);

-- 7. Verification query (futtatás után ellenőrzés)
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'expert_contents'
AND column_name IN ('content_type', 'price_huf', 'currency', 'max_capacity', 'current_participants', 'event_date', 'event_location', 'sponsor_id')
ORDER BY ordinal_position;
