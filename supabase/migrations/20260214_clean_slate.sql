-- ============================================================
-- WellAgora Clean Slate Migration
-- Törli az ÖSSZES teszt adatot, megtartja a sémát, triggereket,
-- RLS policy-kat, függvényeket és enum-okat.
-- Dátum: 2026-02-14
-- ============================================================

DO $$
DECLARE
  _tbl TEXT;
BEGIN
  -- Disable triggers temporarily for faster truncation
  SET session_replication_role = 'replica';

  -- Helper: safe truncate that skips missing tables
  FOR _tbl IN
    SELECT unnest(ARRAY[
      -- 1. Tranzakciók, fizetések, Stripe
      'transactions','invoices','payouts','stripe_events',
      'credit_transactions','credit_package_history',
      'wellpoints_redemptions','voucher_settlements','vouchers',
      'subscription_plans','subscriptions',
      -- 2. Program-kapcsolódó
      'content_access','content_milestones','content_reviews',
      'content_localizations','content_waitlist','content_sponsorships',
      'attendance','program_media_links','expert_media',
      'expert_contents','expert_availability','expert_services',
      -- 3. Közösségi tartalom
      'community_post_likes','community_post_comments','community_posts',
      'community_creations','community_questions','community_answers',
      'event_rsvps','event_sponsors','events',
      -- 4. Gamification + Challenges
      'wellpoints_ledger','challenge_completions','challenge_sponsorships',
      'challenge_definitions','carbon_handprint_entries','sustainability_activities',
      -- 5. Kommunikáció
      'messages','notifications','notification_preferences',
      'push_subscriptions','broadcasts',
      -- 6. Szponzor
      'sponsor_activity_log','sponsor_alerts','sponsorship_allocations',
      'sponsor_credits','sponsor_packages','sponsor_support_rules','sponsors',
      -- 7. Szervezetek
      'organization_invites','organization_subscriptions',
      'team_invitations','organizations',
      -- 8. Felhasználó-kapcsolódó
      'favorites','user_view_state','user_roles','referrals',
      'share_clicks','affiliate_commissions','affiliate_links',
      'guest_registrations','feedback','ai_messages','ai_conversations',
      'analytics_events','audit_log','security_audit_log',
      'project_members','projects',
      -- 9. Profilok
      'profiles'
    ])
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = _tbl
    ) THEN
      EXECUTE format('TRUNCATE TABLE public.%I CASCADE', _tbl);
      RAISE NOTICE 'TRUNCATED: %', _tbl;
    ELSE
      RAISE NOTICE 'SKIPPED (not found): %', _tbl;
    END IF;
  END LOOP;

  -- 10. Auth userek (Supabase auth schema)
  DELETE FROM auth.users;
  RAISE NOTICE 'DELETED: auth.users';

  -- 11. system_settings frissítés (ha van)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'system_settings'
  ) THEN
    UPDATE system_settings SET value = 'WellAgora' WHERE key = 'platform_name';
    RAISE NOTICE 'UPDATED: system_settings platform_name = WellAgora';
  END IF;

  -- Re-enable triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CLEAN SLATE COMPLETE';
  RAISE NOTICE '========================================';
END $$;
