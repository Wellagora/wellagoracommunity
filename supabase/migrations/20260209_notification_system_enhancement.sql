-- WellAgora Notification System Enhancement
-- Phase 1 MVP: Enhanced notifications + notification_preferences + push_subscriptions
-- Safe to re-run (idempotent)

-- ============================================================
-- 1. Enhance notifications table with new columns
-- ============================================================
DO $$
BEGIN
  -- category (nullable first, then backfill)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='category') THEN
    ALTER TABLE notifications ADD COLUMN category TEXT DEFAULT 'general';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='priority') THEN
    ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='icon') THEN
    ALTER TABLE notifications ADD COLUMN icon TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='image_url') THEN
    ALTER TABLE notifications ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='action_label') THEN
    ALTER TABLE notifications ADD COLUMN action_label TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_type') THEN
    ALTER TABLE notifications ADD COLUMN related_type TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_id') THEN
    ALTER TABLE notifications ADD COLUMN related_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='is_archived') THEN
    ALTER TABLE notifications ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read_at') THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='channels') THEN
    ALTER TABLE notifications ADD COLUMN channels TEXT[] DEFAULT ARRAY['in_app'];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='email_sent') THEN
    ALTER TABLE notifications ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='push_sent') THEN
    ALTER TABLE notifications ADD COLUMN push_sent BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='expires_at') THEN
    ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Backfill existing rows
UPDATE notifications SET category = 'general' WHERE category IS NULL;
UPDATE notifications SET priority = 'medium' WHERE priority IS NULL;

-- Now create indexes (columns guaranteed to exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type 
  ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category 
  ON notifications(category);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='email_enabled') THEN
    ALTER TABLE notification_preferences ADD COLUMN email_enabled BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='program_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN program_notifications BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='event_reminders') THEN
    ALTER TABLE notification_preferences ADD COLUMN event_reminders BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='community_updates') THEN
    ALTER TABLE notification_preferences ADD COLUMN community_updates BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='payment_notifications') THEN
    ALTER TABLE notification_preferences ADD COLUMN payment_notifications BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='sponsor_updates') THEN
    ALTER TABLE notification_preferences ADD COLUMN sponsor_updates BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='marketing_emails') THEN
    ALTER TABLE notification_preferences ADD COLUMN marketing_emails BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='weekly_digest') THEN
    ALTER TABLE notification_preferences ADD COLUMN weekly_digest BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='quiet_hours_start') THEN
    ALTER TABLE notification_preferences ADD COLUMN quiet_hours_start TIME;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='quiet_hours_end') THEN
    ALTER TABLE notification_preferences ADD COLUMN quiet_hours_end TIME;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='quiet_hours_timezone') THEN
    ALTER TABLE notification_preferences ADD COLUMN quiet_hours_timezone TEXT DEFAULT 'Europe/Budapest';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='digest_frequency') THEN
    ALTER TABLE notification_preferences ADD COLUMN digest_frequency TEXT DEFAULT 'weekly';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notification_preferences' AND column_name='updated_at') THEN
    ALTER TABLE notification_preferences ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own preferences" ON notification_preferences;
CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- 3. Push subscriptions table
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
