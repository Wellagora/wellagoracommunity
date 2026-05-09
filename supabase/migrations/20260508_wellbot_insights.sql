-- WellBot Insights for Creators — Migration
-- Date: 2026-05-08
-- Purpose: New tables to extract, aggregate, and serve community topics from WellBot conversations.
-- Care+DNA tanulság: strukturális anonimitás (k≥3) SECURITY DEFINER függvénnyel.

-- =====================================================================
-- 1) wellbot_message_topics — per-message topic extraction results
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.wellbot_message_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.ai_messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  topic_slug TEXT NOT NULL,                        -- normalized slug, e.g. 'composting-winter'
  topic_label TEXT NOT NULL,                       -- human-readable label, e.g. 'Téli komposztálás'
  category_slug TEXT,                              -- one of CATEGORIES (lifestyle, craft, gastronomy, etc.)
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0,      -- 0.00 - 1.00
  language TEXT NOT NULL DEFAULT 'hu',
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT confidence_range CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_msg_topics_message_id ON public.wellbot_message_topics(message_id);
CREATE INDEX IF NOT EXISTS idx_msg_topics_topic_slug ON public.wellbot_message_topics(topic_slug);
CREATE INDEX IF NOT EXISTS idx_msg_topics_category ON public.wellbot_message_topics(category_slug);
CREATE INDEX IF NOT EXISTS idx_msg_topics_extracted_at ON public.wellbot_message_topics(extracted_at);

-- RLS: csak service_role írhat, normál user nem olvashat (nyers adat).
ALTER TABLE public.wellbot_message_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role only" ON public.wellbot_message_topics;
CREATE POLICY "service role only" ON public.wellbot_message_topics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.wellbot_message_topics IS
  'Per-message topic extraction results from ai_messages. Service role only — no direct user access.';

-- =====================================================================
-- 2) wellbot_topic_weekly_aggregate — k≥3 aggregated weekly counts
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.wellbot_topic_weekly_aggregate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,                        -- Monday of the ISO week
  topic_slug TEXT NOT NULL,
  topic_label TEXT NOT NULL,
  category_slug TEXT,
  question_count INT NOT NULL,                     -- total question events
  unique_user_count INT NOT NULL,                  -- DISTINCT user count — k≥X applies here
  has_existing_program BOOLEAN NOT NULL DEFAULT FALSE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT week_topic_unique UNIQUE (week_start, topic_slug)
);

CREATE INDEX IF NOT EXISTS idx_topic_agg_week ON public.wellbot_topic_weekly_aggregate(week_start);
CREATE INDEX IF NOT EXISTS idx_topic_agg_category ON public.wellbot_topic_weekly_aggregate(category_slug);
CREATE INDEX IF NOT EXISTS idx_topic_agg_unique_users ON public.wellbot_topic_weekly_aggregate(unique_user_count);

-- RLS: csak service_role férhet hozzá direct módon.
-- A creator-ok / admin-ok a get_creator_insights() / get_admin_insights() függvényeken keresztül olvasnak.
ALTER TABLE public.wellbot_topic_weekly_aggregate ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role only" ON public.wellbot_topic_weekly_aggregate;
CREATE POLICY "service role only" ON public.wellbot_topic_weekly_aggregate
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.wellbot_topic_weekly_aggregate IS
  'Weekly aggregated topic counts. k≥3 anonymity threshold applied in get_creator_insights().';

-- =====================================================================
-- 3) get_creator_insights() — SECURITY DEFINER függvény creator-oknak
-- =====================================================================
-- Csak a creator saját kategóriáit látja, és csak ha legalább 3 különböző user kérdezett.
-- Ez a strukturális anonimitás kapuja — nem szabályzati ígéret, hanem RLS+function-szintű enforcement.

CREATE OR REPLACE FUNCTION public.get_creator_insights(
  _creator_id UUID,
  _weeks_back INT DEFAULT 4
)
RETURNS TABLE (
  week_start DATE,
  topic_label TEXT,
  topic_slug TEXT,
  category_slug TEXT,
  question_count INT,
  unique_user_count INT,
  has_existing_program BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- Csak a creator saját kategóriáit
  WITH creator_categories AS (
    SELECT DISTINCT category
    FROM public.expert_contents
    WHERE creator_id = _creator_id
      AND category IS NOT NULL
  )
  SELECT
    agg.week_start,
    agg.topic_label,
    agg.topic_slug,
    agg.category_slug,
    agg.question_count,
    agg.unique_user_count,
    agg.has_existing_program
  FROM public.wellbot_topic_weekly_aggregate agg
  WHERE agg.category_slug IN (SELECT category FROM creator_categories)
    AND agg.unique_user_count >= 3                       -- k≥3 ANONIMITÁS-KÜSZÖB
    AND agg.week_start >= (CURRENT_DATE - (_weeks_back * 7))::DATE
  ORDER BY agg.week_start DESC, agg.question_count DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_creator_insights(UUID, INT) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_creator_insights(UUID, INT) IS
  'Returns aggregated community topic signals for a creator, scoped to their own categories with k≥3 anonymity threshold.';

-- =====================================================================
-- 4) get_admin_insights() — SECURITY DEFINER függvény admin-oknak
-- =====================================================================
-- Admin az összes kategóriát látja, nem csak a sajátját. Még mindig k≥3 az anonimitás-küszöb.
-- Külön kiemelve: melyik témára nincs még program (content-gap).

CREATE OR REPLACE FUNCTION public.get_admin_insights(
  _weeks_back INT DEFAULT 4,
  _only_content_gaps BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  week_start DATE,
  topic_label TEXT,
  topic_slug TEXT,
  category_slug TEXT,
  question_count INT,
  unique_user_count INT,
  has_existing_program BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    agg.week_start,
    agg.topic_label,
    agg.topic_slug,
    agg.category_slug,
    agg.question_count,
    agg.unique_user_count,
    agg.has_existing_program
  FROM public.wellbot_topic_weekly_aggregate agg
  WHERE agg.unique_user_count >= 3
    AND agg.week_start >= (CURRENT_DATE - (_weeks_back * 7))::DATE
    AND (NOT _only_content_gaps OR agg.has_existing_program = FALSE)
  ORDER BY agg.week_start DESC, agg.question_count DESC;
$$;

-- Admin-only — checked at RPC layer (caller must verify admin role)
GRANT EXECUTE ON FUNCTION public.get_admin_insights(INT, BOOLEAN) TO authenticated, service_role;

COMMENT ON FUNCTION public.get_admin_insights(INT, BOOLEAN) IS
  'Returns aggregated topic signals across all categories for admin use. k≥3 anonymity. Caller must verify admin role.';

-- =====================================================================
-- 5) Helper: refresh_weekly_aggregates() — re-aggregate a specific week
-- =====================================================================
-- Cron-job vagy edge function hívja meg vasárnap éjjel.
-- Idempotens: ugyanazt a hetet többször lefuthatod, az UNIQUE constraint felülírja a sort.

CREATE OR REPLACE FUNCTION public.refresh_weekly_aggregates(
  _week_start DATE
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  rows_affected INT;
BEGIN
  -- Töröljük a meglévő aggregátumokat erre a hétre
  DELETE FROM public.wellbot_topic_weekly_aggregate
  WHERE week_start = _week_start;

  -- Új aggregálás: csak a USER role-os messages-eken (assistant válaszok kihagyva)
  WITH week_messages AS (
    SELECT
      mt.topic_slug,
      mt.topic_label,
      mt.category_slug,
      mt.message_id,
      mt.conversation_id,
      conv.user_id
    FROM public.wellbot_message_topics mt
    JOIN public.ai_messages msg ON msg.id = mt.message_id
    JOIN public.ai_conversations conv ON conv.id = mt.conversation_id
    WHERE msg.role = 'user'
      AND msg.timestamp >= _week_start
      AND msg.timestamp < (_week_start + 7)
      AND mt.confidence >= 0.5
  ),
  programs_per_category AS (
    SELECT DISTINCT category
    FROM public.expert_contents
    WHERE status = 'published'
  )
  INSERT INTO public.wellbot_topic_weekly_aggregate
    (week_start, topic_slug, topic_label, category_slug, question_count, unique_user_count, has_existing_program)
  SELECT
    _week_start,
    wm.topic_slug,
    -- Use most common label for this slug (fallback: just take any)
    (ARRAY_AGG(wm.topic_label ORDER BY wm.topic_label))[1] AS topic_label,
    wm.category_slug,
    COUNT(*)::INT AS question_count,
    COUNT(DISTINCT wm.user_id)::INT AS unique_user_count,
    EXISTS (
      SELECT 1 FROM programs_per_category ppc WHERE ppc.category = wm.category_slug
    ) AS has_existing_program
  FROM week_messages wm
  WHERE wm.user_id IS NOT NULL
  GROUP BY wm.topic_slug, wm.category_slug;

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_weekly_aggregates(DATE) TO service_role;

COMMENT ON FUNCTION public.refresh_weekly_aggregates(DATE) IS
  'Re-aggregates topic counts for a given week. Idempotent. Called by aggregate-topics-weekly edge function.';

-- =====================================================================
-- 6) Backfill helper: get_unprocessed_messages() — az extract-topics function használja
-- =====================================================================
-- Visszaadja azokat az ai_messages rekordokat, amelyekre még nem futott le téma-extrakció.

CREATE OR REPLACE FUNCTION public.get_unprocessed_messages(
  _limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  content TEXT,
  language TEXT,
  timestamp TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT msg.id, msg.conversation_id, msg.content, conv.language, msg.timestamp
  FROM public.ai_messages msg
  JOIN public.ai_conversations conv ON conv.id = msg.conversation_id
  LEFT JOIN public.wellbot_message_topics mt ON mt.message_id = msg.id
  WHERE msg.role = 'user'
    AND mt.id IS NULL
    AND char_length(msg.content) >= 10                    -- skip too-short messages (noise)
  ORDER BY msg.timestamp ASC
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_unprocessed_messages(INT) TO service_role;

COMMENT ON FUNCTION public.get_unprocessed_messages(INT) IS
  'Returns user messages that have not yet been processed by the topic extractor. Used by extract-topics edge function.';
