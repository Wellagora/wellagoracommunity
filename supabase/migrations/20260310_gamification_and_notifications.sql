-- ============================================================
-- GAMIFICATION & NOTIFICATION SYSTEM
-- WellPoints ledger, badges, levels, notification triggers
-- ============================================================

-- 1. Add wellpoints_balance to profiles if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'wellpoints_balance'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN wellpoints_balance integer DEFAULT 0;
  END IF;
END $$;

-- 2. Create wellpoints_ledger table
CREATE TABLE IF NOT EXISTS public.wellpoints_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  action text NOT NULL,
  description text,
  reference_id uuid,
  reference_type text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast balance queries and history
CREATE INDEX IF NOT EXISTS idx_wellpoints_ledger_user_id ON public.wellpoints_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wellpoints_ledger_created_at ON public.wellpoints_ledger(user_id, created_at DESC);

-- RLS for wellpoints_ledger
ALTER TABLE public.wellpoints_ledger ENABLE ROW LEVEL SECURITY;

-- Users can read their own ledger
DROP POLICY IF EXISTS "Users read own ledger" ON public.wellpoints_ledger;
CREATE POLICY "Users read own ledger"
  ON public.wellpoints_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert to their own ledger (point awards happen client-side)
DROP POLICY IF EXISTS "Users insert own ledger" ON public.wellpoints_ledger;
CREATE POLICY "Users insert own ledger"
  ON public.wellpoints_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Auto-update wellpoints_balance on profiles when ledger changes
CREATE OR REPLACE FUNCTION public.update_wellpoints_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET wellpoints_balance = COALESCE(wellpoints_balance, 0) + NEW.amount
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_wellpoints ON public.wellpoints_ledger;
CREATE TRIGGER trigger_update_wellpoints
  AFTER INSERT ON public.wellpoints_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wellpoints_balance();

-- 4. Badge definitions
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  name_de text,
  description text,
  description_en text,
  description_de text,
  icon text NOT NULL DEFAULT 'award',
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  category text NOT NULL DEFAULT 'general',
  requirement_type text NOT NULL, -- 'points', 'streak', 'programs', 'posts', 'referrals', 'manual'
  requirement_value integer NOT NULL DEFAULT 0,
  points_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. User earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  notified boolean DEFAULT false,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own badges" ON public.user_badges;
CREATE POLICY "Users read own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own badges" ON public.user_badges;
CREATE POLICY "Users insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Badge definitions (public read)
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read badge definitions" ON public.badge_definitions;
CREATE POLICY "Anyone can read badge definitions"
  ON public.badge_definitions FOR SELECT
  USING (true);

-- 6. Seed default badge definitions
INSERT INTO public.badge_definitions (name, name_en, name_de, icon, rarity, category, requirement_type, requirement_value, points_reward, sort_order)
VALUES
  -- Points milestones
  ('Első Lépések', 'First Steps', 'Erste Schritte', 'footprints', 'common', 'points', 'points', 10, 5, 1),
  ('Aktív Tag', 'Active Member', 'Aktives Mitglied', 'zap', 'common', 'points', 'points', 100, 10, 2),
  ('Pont Mester', 'Point Master', 'Punktemeister', 'trophy', 'rare', 'points', 'points', 500, 25, 3),
  ('Pont Bajnok', 'Point Champion', 'Punktechampion', 'crown', 'epic', 'points', 'points', 1000, 50, 4),
  ('Legendás Gyűjtő', 'Legendary Collector', 'Legendärer Sammler', 'gem', 'legendary', 'points', 'points', 5000, 100, 5),

  -- Streak milestones
  ('Kitartó (3 nap)', 'Persistent (3 days)', 'Beharrlich (3 Tage)', 'flame', 'common', 'streak', 'streak', 3, 10, 10),
  ('Elköteleződő (7 nap)', 'Committed (7 days)', 'Engagiert (7 Tage)', 'flame', 'rare', 'streak', 'streak', 7, 25, 11),
  ('Megszállott (14 nap)', 'Devoted (14 days)', 'Hingegeben (14 Tage)', 'flame', 'epic', 'streak', 'streak', 14, 50, 12),
  ('Fenntartható Harcos (30 nap)', 'Sustainability Warrior (30 days)', 'Nachhaltigkeitskrieger (30 Tage)', 'flame', 'legendary', 'streak', 'streak', 30, 100, 13),

  -- Community
  ('Első Poszt', 'First Post', 'Erster Beitrag', 'message-square', 'common', 'community', 'posts', 1, 10, 20),
  ('Közösségi Hang', 'Community Voice', 'Gemeinschaftsstimme', 'megaphone', 'rare', 'community', 'posts', 10, 25, 21),
  ('Véleményvezér', 'Thought Leader', 'Meinungsführer', 'brain', 'epic', 'community', 'posts', 50, 50, 22),

  -- Programs
  ('Első Program', 'First Program', 'Erstes Programm', 'book-open', 'common', 'programs', 'programs', 1, 15, 30),
  ('Tudásszomjas', 'Knowledge Seeker', 'Wissensdurstig', 'graduation-cap', 'rare', 'programs', 'programs', 5, 30, 31),
  ('Program Veterán', 'Program Veteran', 'Programmveteran', 'medal', 'epic', 'programs', 'programs', 20, 75, 32),

  -- Referrals
  ('Első Meghívó', 'First Referral', 'Erste Empfehlung', 'user-plus', 'common', 'referrals', 'referrals', 1, 10, 40),
  ('Közösségépítő', 'Community Builder', 'Gemeinschaftsbildner', 'users', 'rare', 'referrals', 'referrals', 5, 50, 41),
  ('Nagykövet', 'Ambassador', 'Botschafter', 'award', 'legendary', 'referrals', 'referrals', 20, 100, 42)

ON CONFLICT DO NOTHING;

-- 7. Function to check and award badges after point changes
CREATE OR REPLACE FUNCTION public.check_badge_eligibility()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge RECORD;
  user_points integer;
  user_streak integer;
  user_posts bigint;
  user_programs bigint;
  user_referrals bigint;
BEGIN
  -- Get user stats
  SELECT wellpoints_balance, current_streak
  INTO user_points, user_streak
  FROM public.profiles WHERE id = NEW.user_id;

  -- Count posts
  SELECT count(*) INTO user_posts
  FROM public.community_posts WHERE author_id = NEW.user_id;

  -- Count completed programs (vouchers used)
  SELECT count(*) INTO user_programs
  FROM public.vouchers WHERE user_id = NEW.user_id AND status = 'used';

  -- Count referrals
  SELECT count(*) INTO user_referrals
  FROM public.referrals WHERE referrer_id = NEW.user_id AND status IN ('joined', 'completed', 'rewarded');

  -- Check each badge definition
  FOR badge IN
    SELECT bd.* FROM public.badge_definitions bd
    LEFT JOIN public.user_badges ub ON ub.badge_id = bd.id AND ub.user_id = NEW.user_id
    WHERE ub.id IS NULL AND bd.is_active = true
  LOOP
    -- Check if requirement met
    IF (badge.requirement_type = 'points' AND user_points >= badge.requirement_value)
       OR (badge.requirement_type = 'streak' AND user_streak >= badge.requirement_value)
       OR (badge.requirement_type = 'posts' AND user_posts >= badge.requirement_value)
       OR (badge.requirement_type = 'programs' AND user_programs >= badge.requirement_value)
       OR (badge.requirement_type = 'referrals' AND user_referrals >= badge.requirement_value)
    THEN
      -- Award badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (NEW.user_id, badge.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;

      -- Award bonus points for badge (if any)
      IF badge.points_reward > 0 THEN
        INSERT INTO public.wellpoints_ledger (user_id, amount, action, description, reference_id, reference_type)
        VALUES (NEW.user_id, badge.points_reward, 'badge_earned', badge.name, badge.id, 'badge');
      END IF;

      -- Create notification for badge
      INSERT INTO public.notifications (user_id, title, message, type, action_url, metadata)
      VALUES (
        NEW.user_id,
        CASE badge.rarity
          WHEN 'legendary' THEN '🏆 Legendás Jelvény!'
          WHEN 'epic' THEN '💎 Epikus Jelvény!'
          WHEN 'rare' THEN '⭐ Ritka Jelvény!'
          ELSE '🎖️ Új Jelvény!'
        END,
        'Megszerezted: ' || badge.name || CASE WHEN badge.points_reward > 0 THEN ' (+' || badge.points_reward || ' WellPoint)' ELSE '' END,
        'milestone',
        '/profil',
        jsonb_build_object('badge_id', badge.id, 'badge_name', badge.name, 'rarity', badge.rarity, 'points_reward', badge.points_reward)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_check_badges ON public.wellpoints_ledger;
CREATE TRIGGER trigger_check_badges
  AFTER INSERT ON public.wellpoints_ledger
  FOR EACH ROW
  EXECUTE FUNCTION public.check_badge_eligibility();

-- 8. Level-up notification trigger
-- When wellpoints_balance crosses a 100-point threshold, send a notification
CREATE OR REPLACE FUNCTION public.check_level_up()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_level integer;
  new_level integer;
BEGIN
  old_level := COALESCE(OLD.wellpoints_balance, 0) / 100;
  new_level := COALESCE(NEW.wellpoints_balance, 0) / 100;

  IF new_level > old_level AND new_level > 0 THEN
    INSERT INTO public.notifications (user_id, title, message, type, action_url, metadata)
    VALUES (
      NEW.id,
      '🎉 Szintlépés!',
      'Elérted a ' || (new_level + 1) || '. szintet! (' || NEW.wellpoints_balance || ' WellPont)',
      'milestone',
      '/profil',
      jsonb_build_object('level', new_level + 1, 'wellpoints', NEW.wellpoints_balance)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_level_up ON public.profiles;
CREATE TRIGGER trigger_level_up
  AFTER UPDATE OF wellpoints_balance ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_level_up();

-- 9. Streak milestone notification (DB trigger)
CREATE OR REPLACE FUNCTION public.check_streak_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.current_streak != COALESCE(OLD.current_streak, 0) THEN
    -- Notify at milestones
    IF NEW.current_streak IN (3, 7, 14, 30, 50, 100) THEN
      INSERT INTO public.notifications (user_id, title, message, type, action_url, metadata)
      VALUES (
        NEW.id,
        '🔥 Sorozat Mérföldkő!',
        NEW.current_streak || ' napos sorozat! Fantasztikus kitartás!',
        'milestone',
        '/profil',
        jsonb_build_object('streak', NEW.current_streak)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_streak_milestone ON public.profiles;
CREATE TRIGGER trigger_streak_milestone
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_streak_milestone();
