-- Add referral_code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate codes for existing users  
UPDATE profiles 
SET referral_code = LOWER(
  COALESCE(SUBSTRING(first_name, 1, 4), 'user') || '-' || 
  SUBSTRING(id::text, 1, 6)
) 
WHERE referral_code IS NULL;

-- Auto-generate trigger for new users
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := LOWER(
    COALESCE(SUBSTRING(NEW.first_name, 1, 4), 'user') || '-' || 
    SUBSTRING(NEW.id::text, 1, 6)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_referral_code ON profiles;
CREATE TRIGGER set_referral_code 
  BEFORE INSERT ON profiles 
  FOR EACH ROW 
  WHEN (NEW.referral_code IS NULL) 
  EXECUTE FUNCTION generate_referral_code();

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) NOT NULL,
  invitee_id UUID REFERENCES profiles(id),
  invitee_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'completed', 'rewarded')),
  reward_claimed BOOLEAN DEFAULT false,
  reward_points INTEGER DEFAULT 100,
  source TEXT,
  challenge_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, invitee_email)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals" ON referrals 
  FOR SELECT TO authenticated 
  USING (referrer_id = auth.uid() OR invitee_id = auth.uid());

CREATE POLICY "Users create referrals" ON referrals 
  FOR INSERT TO authenticated 
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Users update own referrals" ON referrals
  FOR UPDATE TO authenticated
  USING (referrer_id = auth.uid() OR invitee_id = auth.uid());

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_invitee_email ON referrals(invitee_email);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);