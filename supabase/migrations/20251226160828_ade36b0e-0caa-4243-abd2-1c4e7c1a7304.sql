-- PART 1: Create carbon_handprint_entries table if not exists
CREATE TABLE IF NOT EXISTS carbon_handprint_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  action_type TEXT NOT NULL,
  impact_kg_co2 NUMERIC NOT NULL DEFAULT 0,
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  challenge_completion_id UUID REFERENCES challenge_completions(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE carbon_handprint_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own handprint entries" ON carbon_handprint_entries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own handprint entries" ON carbon_handprint_entries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Project admins view project entries" ON carbon_handprint_entries
  FOR SELECT TO authenticated
  USING (project_id IS NOT NULL AND is_project_admin(auth.uid(), project_id));

CREATE INDEX IF NOT EXISTS idx_handprint_user ON carbon_handprint_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_handprint_category ON carbon_handprint_entries(category);
CREATE INDEX IF NOT EXISTS idx_handprint_created ON carbon_handprint_entries(created_at DESC);

-- PART 2: Update process_referral_reward to include handprint entry
CREATE OR REPLACE FUNCTION process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  invitee_completion_count INTEGER;
  reward_amount INTEGER := 100;
BEGIN
  -- Only process approved completions
  IF NEW.validation_status = 'approved' THEN
    
    -- Check if this is the user's FIRST completion
    SELECT COUNT(*) INTO invitee_completion_count
    FROM challenge_completions
    WHERE user_id = NEW.user_id
      AND validation_status = 'approved'
      AND id != NEW.id;
    
    -- Only proceed if this is their first completion
    IF invitee_completion_count = 0 THEN
      
      -- Find pending/joined referral for this user
      SELECT * INTO ref_record 
      FROM referrals 
      WHERE invitee_id = NEW.user_id 
        AND status IN ('pending', 'joined')
        AND NOT reward_claimed
      LIMIT 1;
      
      IF FOUND THEN
        -- Update referral status to completed and rewarded
        UPDATE referrals 
        SET status = 'rewarded',
            completed_at = NOW(),
            reward_claimed = true,
            reward_points = reward_amount
        WHERE id = ref_record.id;
        
        -- Create notification for referrer
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
          ref_record.referrer_id,
          'referral_reward',
          'Referral jutalom!',
          'A barátod teljesítette az első kihívását! ' || reward_amount || ' pontot kaptál.',
          jsonb_build_object(
            'points', reward_amount, 
            'invitee_id', NEW.user_id,
            'challenge_id', NEW.challenge_id
          )
        );
        
        -- Add points to referrer's sustainability activities
        INSERT INTO sustainability_activities (
          user_id,
          activity_type,
          points_earned,
          impact_amount,
          description
        ) VALUES (
          ref_record.referrer_id,
          'referral_bonus',
          reward_amount,
          0.5,
          'Referral jutalom - barát első kihívása'
        );

        -- Add to carbon_handprint_entries for auditable impact
        INSERT INTO carbon_handprint_entries (
          user_id,
          category,
          action_type,
          impact_kg_co2,
          title,
          description,
          metadata
        ) VALUES (
          ref_record.referrer_id,
          'community',
          'referral_growth',
          0.5,
          'Community Growth Impact',
          'Positive environmental impact from referring a friend who completed their first challenge',
          jsonb_build_object(
            'invitee_id', NEW.user_id,
            'challenge_id', NEW.challenge_id,
            'reward_points', reward_amount
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 3: Create Impact Summary RPCs
CREATE OR REPLACE FUNCTION get_user_impact_summary(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT json_build_object(
    'total_co2_kg', COALESCE(SUM(impact_kg_co2), 0),
    'total_entries', COUNT(*),
    'categories', COALESCE((
      SELECT json_object_agg(category, cat_total)
      FROM (
        SELECT category, SUM(impact_kg_co2) as cat_total
        FROM carbon_handprint_entries
        WHERE user_id = target_user_id
        GROUP BY category
      ) cat_sums
    ), '{}'::json),
    'recent_entries', COALESCE((
      SELECT json_agg(row_to_json(recent))
      FROM (
        SELECT id, category, action_type, impact_kg_co2, title, created_at
        FROM carbon_handprint_entries
        WHERE user_id = target_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) recent
    ), '[]'::json)
  ) INTO result
  FROM carbon_handprint_entries
  WHERE user_id = target_user_id;
  
  RETURN COALESCE(result, '{"total_co2_kg": 0, "total_entries": 0, "categories": {}, "recent_entries": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_community_impact_summary(p_project_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_co2_kg', COALESCE(SUM(impact_kg_co2), 0),
    'total_participants', COUNT(DISTINCT user_id),
    'total_entries', COUNT(*),
    'top_categories', COALESCE((
      SELECT json_agg(row_to_json(cats))
      FROM (
        SELECT category, SUM(impact_kg_co2) as total_impact, COUNT(*) as entry_count
        FROM carbon_handprint_entries
        WHERE (p_project_id IS NULL OR project_id = p_project_id)
        GROUP BY category
        ORDER BY SUM(impact_kg_co2) DESC
        LIMIT 5
      ) cats
    ), '[]'::json)
  ) INTO result
  FROM carbon_handprint_entries
  WHERE (p_project_id IS NULL OR project_id = p_project_id);
  
  RETURN COALESCE(result, '{"total_co2_kg": 0, "total_participants": 0, "total_entries": 0, "top_categories": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 4: Stripe Connect Preparation
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT false;

-- Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  partner_id UUID REFERENCES organizations(id),
  challenge_completion_id UUID REFERENCES challenge_completions(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'HUF',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own commissions" ON affiliate_commissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Super admins manage commissions" ON affiliate_commissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_user ON affiliate_commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);