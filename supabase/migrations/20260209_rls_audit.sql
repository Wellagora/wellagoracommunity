-- ================================================
-- WELLAGORA RLS & AUTH BIZTONSÁGI AUDIT — Sprint S.11
-- Date: 2026-02-09
-- ================================================

-- ============================================================
-- 1. Enable RLS on ALL public tables that might be missing it
-- ============================================================

-- Financial tables (CRITICAL)
ALTER TABLE IF EXISTS credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS voucher_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS challenge_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_package_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payouts ENABLE ROW LEVEL SECURITY;

-- User / Profile tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS referrals ENABLE ROW LEVEL SECURITY;

-- Content tables
ALTER TABLE IF EXISTS expert_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expert_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expert_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_localizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS program_media_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_progress ENABLE ROW LEVEL SECURITY;

-- Community tables
ALTER TABLE IF EXISTS community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_creations ENABLE ROW LEVEL SECURITY;

-- Event tables
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_sponsors ENABLE ROW LEVEL SECURITY;

-- Organization tables
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS organization_invites ENABLE ROW LEVEL SECURITY;

-- Project tables
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_members ENABLE ROW LEVEL SECURITY;

-- Sponsor tables
ALTER TABLE IF EXISTS sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsor_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsor_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsor_support_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sponsorship_allocations ENABLE ROW LEVEL SECURITY;

-- System / Misc tables
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS local_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sustainability_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS carbon_handprint_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS challenge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wellpoints_ledger ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. CRITICAL: Ensure stripe_events is service-role only
-- ============================================================
DROP POLICY IF EXISTS "Service role can manage stripe_events" ON stripe_events;
CREATE POLICY "Service role only" ON stripe_events
  FOR ALL USING (FALSE) WITH CHECK (FALSE);
-- Only service_role key bypasses RLS, anon/authenticated cannot touch this table

-- ============================================================
-- 3. Ensure notifications are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 4. Ensure credit_transactions are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Sponsors see own credit transactions" ON credit_transactions;
CREATE POLICY "Sponsors see own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = sponsor_user_id);

DROP POLICY IF EXISTS "Sponsors insert own credit transactions" ON credit_transactions;
CREATE POLICY "Sponsors insert own credit transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = sponsor_user_id);

-- ============================================================
-- 5. Ensure sponsor_credits are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Sponsors see own credits" ON sponsor_credits;
CREATE POLICY "Sponsors see own credits" ON sponsor_credits
  FOR SELECT USING (auth.uid() = sponsor_user_id);

-- ============================================================
-- 6. Ensure transactions (content purchases) are buyer/creator isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own transactions" ON transactions;
CREATE POLICY "Users see own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = creator_id);

-- ============================================================
-- 7. Ensure vouchers are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own vouchers" ON vouchers;
CREATE POLICY "Users see own vouchers" ON vouchers
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 8. Ensure invoices are org-isolated
-- ============================================================
DROP POLICY IF EXISTS "Org members see own invoices" ON invoices;
CREATE POLICY "Org members see own invoices" ON invoices
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 9. Ensure messages are participant-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own messages" ON messages;
CREATE POLICY "Users see own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users send messages" ON messages;
CREATE POLICY "Users send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- 10. Ensure favorites are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own favorites" ON favorites;
CREATE POLICY "Users see own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 11. Ensure AI conversations are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users see own ai conversations" ON ai_conversations;
CREATE POLICY "Users see own ai conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users see own ai messages" ON ai_messages;
CREATE POLICY "Users see own ai messages" ON ai_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 12. Ensure push_subscriptions are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 13. Ensure notification_preferences are user-isolated
-- ============================================================
DROP POLICY IF EXISTS "Users manage own notification preferences" ON notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 14. Public read tables (safe — no sensitive data)
-- ============================================================
-- subscription_plans, regions, legal_content, exchange_rates, local_partners
-- These are reference data, safe for all authenticated users to read

DROP POLICY IF EXISTS "Anyone can read subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can read subscription plans" ON subscription_plans
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read regions" ON regions;
CREATE POLICY "Anyone can read regions" ON regions
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read legal content" ON legal_content;
CREATE POLICY "Anyone can read legal content" ON legal_content
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read exchange rates" ON exchange_rates;
CREATE POLICY "Anyone can read exchange rates" ON exchange_rates
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can read local partners" ON local_partners;
CREATE POLICY "Anyone can read local partners" ON local_partners
  FOR SELECT USING (TRUE);

-- ============================================================
-- 15. Audit check: list tables without RLS (run manually)
-- ============================================================
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = FALSE
-- ORDER BY tablename;

-- ============================================================
-- 16. Audit check: list tables with RLS but no policies (run manually)
-- ============================================================
-- SELECT t.tablename, COUNT(p.policyname) as policy_count
-- FROM pg_tables t
-- LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
-- WHERE t.schemaname = 'public' AND t.rowsecurity = TRUE
-- GROUP BY t.tablename
-- HAVING COUNT(p.policyname) = 0
-- ORDER BY t.tablename;
