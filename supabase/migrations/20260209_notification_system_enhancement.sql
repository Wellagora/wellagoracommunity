-- WellAgora Notification System Enhancement
-- Phase 1 MVP: Enhanced notifications + notification_preferences tables

-- ============================================================
-- 1. Enhance notifications table with new columns
-- ============================================================

-- Add category column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general';

-- Add priority column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

-- Add display fields
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT;

-- Add related entity tracking
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id UUID;

-- Add archive support
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add read_at timestamp
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Add delivery tracking
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT ARRAY['in_app'];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_sent BOOLEAN DEFAULT FALSE;

-- Add expiration
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category 
  ON notifications(category);

-- Ensure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Enhance notification_preferences table
-- ============================================================

-- Add email_enabled if missing
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN DEFAULT TRUE;

-- Add category-specific toggles
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS program_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS event_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS community_updates BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS payment_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS sponsor_updates BOOLEAN DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT FALSE;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS weekly_digest BOOLEAN DEFAULT TRUE;

-- Add quiet hours
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS quiet_hours_start TIME;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS quiet_hours_end TIME;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS quiet_hours_timezone TEXT DEFAULT 'Europe/Budapest';

-- Add digest frequency
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'weekly';

-- Add updated_at if missing
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own preferences" ON notification_preferences;
CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 3. Push subscriptions table (create if not exists)
-- ============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  device_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);
