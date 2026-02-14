-- ============================================================
-- WellAgora Clean Slate Migration — VÉGLEGES
-- Törli az ÖSSZES adatot, megtartja a sémát, triggereket,
-- RLS policy-kat, függvényeket és enum-okat.
-- Dátum: 2026-02-14
-- ============================================================
-- Megközelítés: Dinamikusan megkeresi az ÖSSZES public táblát
-- és TRUNCATE CASCADE-del törli, így nem maradhat FK-ütközés.
-- ============================================================

DO $$
DECLARE
  _tbl RECORD;
  _count INT := 0;
BEGIN
  -- Disable triggers temporarily for faster truncation
  SET session_replication_role = 'replica';

  -- TRUNCATE MINDEN public táblát (system_settings kivétel)
  FOR _tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename != 'system_settings'
    ORDER BY tablename
  LOOP
    EXECUTE format('TRUNCATE TABLE public.%I CASCADE', _tbl.tablename);
    RAISE NOTICE 'TRUNCATED: %', _tbl.tablename;
    _count := _count + 1;
  END LOOP;

  RAISE NOTICE '--- % public tables truncated ---', _count;

  -- Auth userek (Supabase auth schema)
  DELETE FROM auth.users;
  RAISE NOTICE 'DELETED: all auth.users';

  -- system_settings frissítés
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'system_settings'
  ) THEN
    UPDATE system_settings SET value = '"WellAgora"'::jsonb WHERE key = 'platform_name';
    RAISE NOTICE 'UPDATED: system_settings platform_name = WellAgora';
  END IF;

  -- Re-enable triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLEAN SLATE COMPLETE';
  RAISE NOTICE '========================================';
END $$;
