-- WellAgora Business Engine v1.0
-- 1 Credit = 1 HUF internal currency
-- 80/20 split based on Expert Full Price

-- ============================================
-- 1. SPONSOR PACKAGES (Quarterly & Annual)
-- ============================================

-- Clear existing packages and replace with new business model
DELETE FROM public.credit_packages;

INSERT INTO public.credit_packages (id, name, credits, price_eur, price_huf) VALUES
  (gen_random_uuid(), 'Quarterly', 100000, 375, 150000),
  (gen_random_uuid(), 'Annual', 420000, 1200, 480000);

-- Add package metadata table for detailed package info
CREATE TABLE IF NOT EXISTS public.sponsor_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_key TEXT NOT NULL UNIQUE,
  name_hu TEXT NOT NULL,
  name_en TEXT NOT NULL,
  total_price_huf INTEGER NOT NULL,
  platform_fee_huf INTEGER NOT NULL,
  credits_huf INTEGER NOT NULL,
  bonus_credits_huf INTEGER DEFAULT 0,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('quarterly', 'annual')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsor_packages ENABLE ROW LEVEL SECURITY;

-- Public read access for packages
CREATE POLICY "Anyone can view sponsor packages"
ON public.sponsor_packages FOR SELECT
USING (is_active = true);

-- Insert the two packages
INSERT INTO public.sponsor_packages (
  package_key, name_hu, name_en, total_price_huf, platform_fee_huf, credits_huf, bonus_credits_huf, billing_period
) VALUES
  ('quarterly', 'Negyedéves Csomag', 'Quarterly Package', 150000, 50000, 100000, 0, 'quarterly'),
  ('annual', 'Éves Csomag', 'Annual Package', 480000, 80000, 400000, 20000, 'annual');

-- ============================================
-- 2. SPONSOR CONTRIBUTION PER PROGRAM
-- ============================================

-- Add sponsor contribution and quota fields to content_sponsorships
ALTER TABLE public.content_sponsorships
ADD COLUMN IF NOT EXISTS sponsor_contribution_huf INTEGER DEFAULT 0
  CHECK (sponsor_contribution_huf >= 0),
ADD COLUMN IF NOT EXISTS max_sponsored_seats INTEGER DEFAULT 10
  CHECK (max_sponsored_seats >= 1),
ADD COLUMN IF NOT EXISTS sponsored_seats_used INTEGER DEFAULT 0
  CHECK (sponsored_seats_used >= 0);

-- Comment explaining the sponsor contribution model
COMMENT ON COLUMN public.content_sponsorships.sponsor_contribution_huf IS 
  'Fixed HUF amount the sponsor contributes per seat. Member pays: expert_price - sponsor_contribution';
COMMENT ON COLUMN public.content_sponsorships.max_sponsored_seats IS 
  'Maximum number of seats the sponsor will subsidize for this program';
COMMENT ON COLUMN public.content_sponsorships.sponsored_seats_used IS 
  'Number of sponsored seats already claimed by members';

-- ============================================
-- 3. FINANCIAL DISTRIBUTION FUNCTION (80/20)
-- ============================================

-- Drop old function if exists and recreate with correct logic
DROP FUNCTION IF EXISTS calculate_revenue_split(INTEGER);

CREATE OR REPLACE FUNCTION calculate_program_payment(
  expert_price_huf INTEGER,
  sponsor_contribution_huf INTEGER DEFAULT 0
)
RETURNS TABLE(
  member_payment_huf INTEGER,
  sponsor_payment_huf INTEGER,
  total_collected_huf INTEGER,
  platform_commission_huf INTEGER,
  expert_payout_huf INTEGER
) AS $$
BEGIN
  -- Member pays the difference between expert price and sponsor contribution
  member_payment_huf := GREATEST(0, expert_price_huf - sponsor_contribution_huf);
  
  -- Sponsor pays their contribution (capped at expert price)
  sponsor_payment_huf := LEAST(sponsor_contribution_huf, expert_price_huf);
  
  -- Total collected always equals expert price
  total_collected_huf := expert_price_huf;
  
  -- Platform gets 20% of expert price
  platform_commission_huf := ROUND(expert_price_huf * 0.20);
  
  -- Expert gets 80% of expert price
  expert_payout_huf := ROUND(expert_price_huf * 0.80);
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 4. TRANSACTION TRACKING FOR DUAL-SOURCE PAYMENTS
-- ============================================

-- Update transactions table to track dual-source payments
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS member_payment_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sponsor_payment_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sponsorship_id UUID REFERENCES public.content_sponsorships(id),
ADD COLUMN IF NOT EXISTS expert_price_huf INTEGER,
ADD COLUMN IF NOT EXISTS platform_commission INTEGER,
ADD COLUMN IF NOT EXISTS expert_payout INTEGER;

-- ============================================
-- 5. QUOTA MANAGEMENT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION check_and_reserve_sponsored_seat(
  p_sponsorship_id UUID,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  seats_remaining INTEGER
) AS $$
DECLARE
  v_max_seats INTEGER;
  v_used_seats INTEGER;
BEGIN
  -- Get current quota
  SELECT max_sponsored_seats, sponsored_seats_used
  INTO v_max_seats, v_used_seats
  FROM content_sponsorships
  WHERE id = p_sponsorship_id AND is_active = true
  FOR UPDATE;

  IF v_max_seats IS NULL THEN
    RETURN QUERY SELECT false, 'Sponsorship not found or inactive'::TEXT, 0;
    RETURN;
  END IF;

  IF v_used_seats >= v_max_seats THEN
    RETURN QUERY SELECT false, 'No sponsored seats available'::TEXT, 0;
    RETURN;
  END IF;

  -- Reserve the seat
  UPDATE content_sponsorships
  SET sponsored_seats_used = sponsored_seats_used + 1,
      updated_at = now()
  WHERE id = p_sponsorship_id;

  RETURN QUERY SELECT true, 'Seat reserved successfully'::TEXT, (v_max_seats - v_used_seats - 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. PROCESS SPONSORED PURCHASE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION process_sponsored_purchase(
  p_content_id UUID,
  p_user_id UUID,
  p_sponsorship_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  member_amount INTEGER,
  sponsor_amount INTEGER,
  message TEXT
) AS $$
DECLARE
  v_expert_price INTEGER;
  v_sponsor_contribution INTEGER;
  v_creator_id UUID;
  v_payment_record RECORD;
  v_seat_result RECORD;
BEGIN
  -- Get content price and sponsorship details
  SELECT 
    ec.price_huf, 
    ec.creator_id,
    cs.sponsor_contribution_huf
  INTO v_expert_price, v_creator_id, v_sponsor_contribution
  FROM expert_contents ec
  JOIN content_sponsorships cs ON cs.content_id = ec.id
  WHERE ec.id = p_content_id AND cs.id = p_sponsorship_id AND cs.is_active = true;

  IF v_expert_price IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'Content or sponsorship not found'::TEXT;
    RETURN;
  END IF;

  -- Check and reserve sponsored seat
  SELECT * INTO v_seat_result 
  FROM check_and_reserve_sponsored_seat(p_sponsorship_id, p_user_id);

  IF NOT v_seat_result.success THEN
    RETURN QUERY SELECT false, 0, 0, v_seat_result.message;
    RETURN;
  END IF;

  -- Calculate payment distribution
  SELECT * INTO v_payment_record 
  FROM calculate_program_payment(v_expert_price, v_sponsor_contribution);

  -- Insert transaction with dual-source payment tracking
  INSERT INTO transactions (
    content_id,
    buyer_id,
    creator_id,
    amount,
    member_payment_amount,
    sponsor_payment_amount,
    sponsorship_id,
    expert_price_huf,
    platform_commission,
    expert_payout,
    platform_fee,
    creator_revenue,
    status,
    transaction_type
  ) VALUES (
    p_content_id,
    p_user_id,
    v_creator_id,
    v_expert_price,
    v_payment_record.member_payment_huf,
    v_payment_record.sponsor_payment_huf,
    p_sponsorship_id,
    v_expert_price,
    v_payment_record.platform_commission_huf,
    v_payment_record.expert_payout_huf,
    v_payment_record.platform_commission_huf,
    v_payment_record.expert_payout_huf,
    'completed',
    'sponsored_purchase'
  );

  -- Grant content access
  INSERT INTO content_access (content_id, user_id, access_type, sponsorship_id, amount_paid)
  VALUES (p_content_id, p_user_id, 'sponsored', p_sponsorship_id, v_payment_record.member_payment_huf);

  RETURN QUERY SELECT 
    true, 
    v_payment_record.member_payment_huf, 
    v_payment_record.sponsor_payment_huf,
    'Purchase completed successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;