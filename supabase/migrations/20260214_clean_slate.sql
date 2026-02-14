-- ============================================================
-- WellAgora Clean Slate Migration
-- Törli az ÖSSZES teszt adatot, megtartja a sémát, triggereket,
-- RLS policy-kat, függvényeket és enum-okat.
-- Dátum: 2026-02-14
-- ============================================================

-- Disable triggers temporarily for faster truncation
SET session_replication_role = 'replica';

-- ============================================================
-- 1. Tranzakciók, fizetések, Stripe
-- ============================================================
TRUNCATE TABLE IF EXISTS transactions CASCADE;
TRUNCATE TABLE IF EXISTS invoices CASCADE;
TRUNCATE TABLE IF EXISTS payouts CASCADE;
TRUNCATE TABLE IF EXISTS stripe_events CASCADE;
TRUNCATE TABLE IF EXISTS credit_transactions CASCADE;
TRUNCATE TABLE IF EXISTS credit_package_history CASCADE;
TRUNCATE TABLE IF EXISTS wellpoints_redemptions CASCADE;
TRUNCATE TABLE IF EXISTS voucher_settlements CASCADE;
TRUNCATE TABLE IF EXISTS vouchers CASCADE;
TRUNCATE TABLE IF EXISTS subscription_plans CASCADE;
TRUNCATE TABLE IF EXISTS subscriptions CASCADE;

-- ============================================================
-- 2. Program-kapcsolódó
-- ============================================================
TRUNCATE TABLE IF EXISTS content_access CASCADE;
TRUNCATE TABLE IF EXISTS content_milestones CASCADE;
TRUNCATE TABLE IF EXISTS content_reviews CASCADE;
TRUNCATE TABLE IF EXISTS content_localizations CASCADE;
TRUNCATE TABLE IF EXISTS content_waitlist CASCADE;
TRUNCATE TABLE IF EXISTS content_sponsorships CASCADE;
TRUNCATE TABLE IF EXISTS attendance CASCADE;
TRUNCATE TABLE IF EXISTS program_media_links CASCADE;
TRUNCATE TABLE IF EXISTS expert_media CASCADE;
TRUNCATE TABLE IF EXISTS expert_contents CASCADE;
TRUNCATE TABLE IF EXISTS expert_availability CASCADE;
TRUNCATE TABLE IF EXISTS expert_services CASCADE;

-- ============================================================
-- 3. Közösségi tartalom
-- ============================================================
TRUNCATE TABLE IF EXISTS community_post_likes CASCADE;
TRUNCATE TABLE IF EXISTS community_post_comments CASCADE;
TRUNCATE TABLE IF EXISTS community_posts CASCADE;
TRUNCATE TABLE IF EXISTS community_creations CASCADE;
TRUNCATE TABLE IF EXISTS community_questions CASCADE;
TRUNCATE TABLE IF EXISTS community_answers CASCADE;
TRUNCATE TABLE IF EXISTS event_rsvps CASCADE;
TRUNCATE TABLE IF EXISTS event_sponsors CASCADE;
TRUNCATE TABLE IF EXISTS events CASCADE;

-- ============================================================
-- 4. Gamification + Challenges
-- ============================================================
TRUNCATE TABLE IF EXISTS wellpoints_ledger CASCADE;
TRUNCATE TABLE IF EXISTS challenge_completions CASCADE;
TRUNCATE TABLE IF EXISTS challenge_sponsorships CASCADE;
TRUNCATE TABLE IF EXISTS challenge_definitions CASCADE;
TRUNCATE TABLE IF EXISTS carbon_handprint_entries CASCADE;
TRUNCATE TABLE IF EXISTS sustainability_activities CASCADE;

-- ============================================================
-- 5. Kommunikáció
-- ============================================================
TRUNCATE TABLE IF EXISTS messages CASCADE;
TRUNCATE TABLE IF EXISTS notifications CASCADE;
TRUNCATE TABLE IF EXISTS notification_preferences CASCADE;
TRUNCATE TABLE IF EXISTS push_subscriptions CASCADE;
TRUNCATE TABLE IF EXISTS broadcasts CASCADE;

-- ============================================================
-- 6. Szponzor
-- ============================================================
TRUNCATE TABLE IF EXISTS sponsor_activity_log CASCADE;
TRUNCATE TABLE IF EXISTS sponsor_alerts CASCADE;
TRUNCATE TABLE IF EXISTS sponsorship_allocations CASCADE;
TRUNCATE TABLE IF EXISTS sponsor_credits CASCADE;
TRUNCATE TABLE IF EXISTS sponsor_packages CASCADE;
TRUNCATE TABLE IF EXISTS sponsor_support_rules CASCADE;
TRUNCATE TABLE IF EXISTS sponsors CASCADE;

-- ============================================================
-- 7. Szervezetek
-- ============================================================
TRUNCATE TABLE IF EXISTS organization_invites CASCADE;
TRUNCATE TABLE IF EXISTS organization_subscriptions CASCADE;
TRUNCATE TABLE IF EXISTS team_invitations CASCADE;
TRUNCATE TABLE IF EXISTS organizations CASCADE;

-- ============================================================
-- 8. Felhasználó-kapcsolódó (profil adatok, NEM auth)
-- ============================================================
TRUNCATE TABLE IF EXISTS favorites CASCADE;
TRUNCATE TABLE IF EXISTS user_view_state CASCADE;
TRUNCATE TABLE IF EXISTS user_roles CASCADE;
TRUNCATE TABLE IF EXISTS referrals CASCADE;
TRUNCATE TABLE IF EXISTS share_clicks CASCADE;
TRUNCATE TABLE IF EXISTS affiliate_commissions CASCADE;
TRUNCATE TABLE IF EXISTS affiliate_links CASCADE;
TRUNCATE TABLE IF EXISTS guest_registrations CASCADE;
TRUNCATE TABLE IF EXISTS feedback CASCADE;
TRUNCATE TABLE IF EXISTS ai_messages CASCADE;
TRUNCATE TABLE IF EXISTS ai_conversations CASCADE;
TRUNCATE TABLE IF EXISTS analytics_events CASCADE;
TRUNCATE TABLE IF EXISTS audit_log CASCADE;
TRUNCATE TABLE IF EXISTS security_audit_log CASCADE;
TRUNCATE TABLE IF EXISTS project_members CASCADE;
TRUNCATE TABLE IF EXISTS projects CASCADE;

-- ============================================================
-- 9. Profilok
-- ============================================================
TRUNCATE TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- 10. Auth userek (Supabase auth schema)
-- ============================================================
DELETE FROM auth.users;

-- ============================================================
-- 11. system_settings frissítés (ha van)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_settings') THEN
    UPDATE system_settings SET value = 'WellAgora' WHERE key = 'platform_name';
  END IF;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- ============================================================
-- Kész. A platform tiszta állapotban van.
-- ============================================================
