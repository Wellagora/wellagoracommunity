-- Sprint 12: Stripe Integration — DB migrations
-- Run this in Supabase SQL Editor

-- 1. WellPoints redemptions tracking table
CREATE TABLE IF NOT EXISTS wellpoints_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  points_spent INTEGER NOT NULL,
  redemption_type TEXT DEFAULT 'checkout_discount',
  discount_percent NUMERIC,
  discount_amount_ft NUMERIC,
  order_id UUID,
  voucher_id UUID REFERENCES vouchers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wellpoints_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own redemptions" ON wellpoints_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert redemptions" ON wellpoints_redemptions
  FOR INSERT WITH CHECK (true);

-- 2. RPC: deduct_sponsor_credit
CREATE OR REPLACE FUNCTION deduct_sponsor_credit(p_credit_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE sponsor_credits
  SET used_credits = used_credits + p_amount,
      available_credits = available_credits - p_amount,
      updated_at = NOW()
  WHERE id = p_credit_id AND available_credits >= p_amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient sponsor credits';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC: restore_sponsor_credit (for cancellation/no-show)
CREATE OR REPLACE FUNCTION restore_sponsor_credit(p_credit_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE sponsor_credits
  SET used_credits = GREATEST(0, used_credits - p_amount),
      available_credits = available_credits + p_amount,
      updated_at = NOW()
  WHERE id = p_credit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: add_platform_credit (refund as platform credit)
CREATE OR REPLACE FUNCTION add_platform_credit(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credit_balance = COALESCE(credit_balance, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
