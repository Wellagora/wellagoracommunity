-- WellBot Insights — Cron jobs (pg_cron)
-- Date: 2026-05-08
--
-- Ezt a fájlt KÉT módon lehet lefuttatni:
--   1. Supabase SQL Editor-ban: paste + Run
--   2. supabase db push (ha a migration-folyamat hozzáfér a pg_cron-hoz)
--
-- Előfeltételek:
--   - pg_cron extension engedélyezve a Supabase projecten (Database → Extensions)
--   - pg_net extension engedélyezve (a HTTP-hívásokhoz)
--   - extract-topics és aggregate-topics-weekly edge functions deployolva
--
-- Ha a pg_cron nem érhető el a tier-eden, alternatíva: GitHub Actions cron workflow
--   (.github/workflows/wellbot-insights-cron.yml — Te tudod megírni 5 perc alatt curl-rel).

-- =====================================================================
-- 0) BIZTONSÁGI BEÁLLÍTÁS — service_role JWT az auth headerhez
-- =====================================================================
-- A Supabase Edge Functions service-role JWT-vel hívhatók (vagy anon-nal,
-- de a service-role kötelező az extract-topics-nál mert a privát táblákba ír).
--
-- A service_role kulcsot a Supabase Dashboard → Project Settings → API oldalról
-- kell venni, ÉS a vault-ba beállítani egy adminnak a Database → Vault menüben:
--   Name: SUPABASE_FUNCTION_SERVICE_TOKEN
--   Secret: <service_role_jwt>
--
-- Ezután a cron job a vault.read_secret() függvénnyel olvassa.
-- Ha nincs vault-od, akkor inline string-ként is működik (kevésbé biztonságos).

-- =====================================================================
-- 1) CRON: extract-topics — minden óra 5. percében
-- =====================================================================
-- Téma-extrakció: feldolgoz max 50 új user-üzenetet az ai_messages-ből.
-- Idempotens: csak az új üzenetek kerülnek feldolgozásra (get_unprocessed_messages).

SELECT cron.schedule(
  'wellbot-extract-topics-hourly',
  '5 * * * *',                                     -- minden óra 5. percében
  $$
  SELECT net.http_post(
    url := 'https://vvunxewylcifwphxgqab.supabase.co/functions/v1/extract-topics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_FUNCTION_SERVICE_TOKEN')
    ),
    body := jsonb_build_object('limit', 50)
  ) AS request_id;
  $$
);

-- =====================================================================
-- 2) CRON: aggregate-topics-weekly — vasárnap éjjel 23:30
-- =====================================================================
-- Heti aggregátor: az aktuális és előző hét adatait újra-számolja.
-- Idempotens: a refresh_weekly_aggregates() függvény törli és újra-aggregálja.

SELECT cron.schedule(
  'wellbot-aggregate-topics-weekly',
  '30 23 * * 0',                                   -- vasárnap 23:30
  $$
  SELECT net.http_post(
    url := 'https://vvunxewylcifwphxgqab.supabase.co/functions/v1/aggregate-topics-weekly',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_FUNCTION_SERVICE_TOKEN')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- =====================================================================
-- 3) Verifikáció
-- =====================================================================
-- A cron-jobok listázása (futtatható lekérdezés a SQL Editor-ban):
--
--   SELECT jobid, jobname, schedule, command FROM cron.job
--   WHERE jobname LIKE 'wellbot-%';
--
-- A futások története (utolsó 100 hívás):
--
--   SELECT * FROM cron.job_run_details
--   WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'wellbot-%')
--   ORDER BY start_time DESC LIMIT 100;
--
-- Manuális trigger (teszthez):
--
--   SELECT net.http_post(
--     url := 'https://vvunxewylcifwphxgqab.supabase.co/functions/v1/extract-topics',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_FUNCTION_SERVICE_TOKEN')
--     ),
--     body := jsonb_build_object('limit', 5)
--   );

-- =====================================================================
-- 4) Visszavonás (ha valamiért le kell állítani a cron-okat)
-- =====================================================================
--   SELECT cron.unschedule('wellbot-extract-topics-hourly');
--   SELECT cron.unschedule('wellbot-aggregate-topics-weekly');
