-- =============================================
-- NO-SHOW & LATE CANCELLATION FINANCIAL LOGIC
-- Expert gets 100% payout, Sponsor credit consumed, Tag gets 0%
-- =============================================

-- Add no-show and cancellation tracking to vouchers
ALTER TABLE public.vouchers 
ADD COLUMN IF NOT EXISTS cancellation_type TEXT CHECK (cancellation_type IN ('none', 'early', 'late', 'no_show')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS event_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expert_payout_status TEXT CHECK (expert_payout_status IN ('pending', 'paid', 'resource_consumed')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS sponsor_credit_status TEXT CHECK (sponsor_credit_status IN ('reserved', 'consumed', 'returned')) DEFAULT 'reserved',
ADD COLUMN IF NOT EXISTS payout_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS financial_notes TEXT;

-- Update status check constraint to include new states
ALTER TABLE public.vouchers DROP CONSTRAINT IF EXISTS vouchers_status_check;
ALTER TABLE public.vouchers ADD CONSTRAINT vouchers_status_check 
  CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled', 'no_show', 'late_cancelled'));

-- Create table for detailed financial settlements
CREATE TABLE IF NOT EXISTS public.voucher_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  expert_id UUID REFERENCES public.profiles(id),
  sponsor_id UUID REFERENCES public.profiles(id),
  content_id UUID REFERENCES public.expert_contents(id),
  
  -- Financial breakdown
  original_price INTEGER NOT NULL DEFAULT 0,
  sponsor_contribution INTEGER DEFAULT 0,
  user_payment INTEGER DEFAULT 0,
  
  -- Settlement amounts
  expert_payout INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  user_refund INTEGER DEFAULT 0,
  sponsor_credit_action TEXT CHECK (sponsor_credit_action IN ('consumed', 'returned', 'partial_return')) DEFAULT 'consumed',
  
  -- Status tracking
  settlement_type TEXT NOT NULL CHECK (settlement_type IN ('completed', 'no_show', 'late_cancellation', 'early_cancellation', 'refund')),
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'processed', 'failed')),
  
  -- Metadata
  event_date TIMESTAMP WITH TIME ZONE,
  cancellation_date TIMESTAMP WITH TIME ZONE,
  days_before_event INTEGER,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.voucher_settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voucher_settlements
CREATE POLICY "Users can view their own settlements"
ON public.voucher_settlements
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = expert_id OR auth.uid() = sponsor_id);

CREATE POLICY "System can insert settlements"
ON public.voucher_settlements
FOR INSERT
WITH CHECK (true);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_voucher_settlements_voucher ON public.voucher_settlements(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_settlements_expert ON public.voucher_settlements(expert_id);
CREATE INDEX IF NOT EXISTS idx_voucher_settlements_sponsor ON public.voucher_settlements(sponsor_id);

-- =============================================
-- FUNCTION: Process No-Show or Late Cancellation
-- Expert gets 100%, Sponsor credit consumed, Tag gets 0%
-- =============================================
CREATE OR REPLACE FUNCTION public.process_noshow_or_late_cancellation(
  p_voucher_id UUID,
  p_cancellation_type TEXT, -- 'no_show' or 'late_cancellation'
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher RECORD;
  v_content RECORD;
  v_sponsorship RECORD;
  v_original_price INTEGER;
  v_expert_payout INTEGER;
  v_platform_fee INTEGER;
  v_settlement_id UUID;
  v_days_before INTEGER;
BEGIN
  -- Validate cancellation type
  IF p_cancellation_type NOT IN ('no_show', 'late_cancellation') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid cancellation type');
  END IF;

  -- Get voucher details
  SELECT * INTO v_voucher FROM public.vouchers WHERE id = p_voucher_id;
  
  IF v_voucher IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;
  
  IF v_voucher.status NOT IN ('active', 'redeemed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher already processed');
  END IF;

  -- Get content details
  SELECT * INTO v_content FROM public.expert_contents WHERE id = v_voucher.content_id;
  
  IF v_content IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Content not found');
  END IF;

  -- Calculate original price
  v_original_price := COALESCE(v_content.price_huf, 0);
  
  -- For no-show/late cancellation: Expert gets 100% of their normal share
  -- Normal split is 80/20, but for no-show Expert gets full 80% (their share)
  v_expert_payout := FLOOR(v_original_price * 0.80);
  v_platform_fee := v_original_price - v_expert_payout;
  
  -- Calculate days before event
  IF v_voucher.event_date IS NOT NULL THEN
    v_days_before := EXTRACT(DAY FROM (v_voucher.event_date - v_voucher.cancelled_at));
  ELSE
    v_days_before := 0;
  END IF;

  -- Update voucher status
  UPDATE public.vouchers
  SET 
    status = CASE WHEN p_cancellation_type = 'no_show' THEN 'no_show' ELSE 'late_cancelled' END,
    cancellation_type = CASE WHEN p_cancellation_type = 'no_show' THEN 'no_show' ELSE 'late' END,
    cancelled_at = COALESCE(v_voucher.cancelled_at, now()),
    cancelled_by = COALESCE(p_processed_by, auth.uid()),
    expert_payout_status = 'resource_consumed',
    sponsor_credit_status = 'consumed',
    payout_amount = v_expert_payout,
    refund_amount = 0,
    financial_notes = 'Expert Paid - Resource Consumed. ' || 
      CASE WHEN p_cancellation_type = 'no_show' 
        THEN 'Member did not attend (No-Show).' 
        ELSE 'Late cancellation (<3 days before event).' 
      END
  WHERE id = p_voucher_id;

  -- Create settlement record
  INSERT INTO public.voucher_settlements (
    voucher_id,
    user_id,
    expert_id,
    sponsor_id,
    content_id,
    original_price,
    sponsor_contribution,
    user_payment,
    expert_payout,
    platform_fee,
    user_refund,
    sponsor_credit_action,
    settlement_type,
    settlement_status,
    event_date,
    cancellation_date,
    days_before_event,
    notes,
    processed_at
  ) VALUES (
    p_voucher_id,
    v_voucher.user_id,
    v_content.creator_id,
    v_content.sponsor_id,
    v_voucher.content_id,
    v_original_price,
    CASE WHEN v_content.is_sponsored THEN v_original_price ELSE 0 END,
    CASE WHEN v_content.is_sponsored THEN 0 ELSE v_original_price END,
    v_expert_payout,
    v_platform_fee,
    0, -- No refund for tag
    'consumed', -- Sponsor credit consumed
    CASE WHEN p_cancellation_type = 'no_show' THEN 'no_show' ELSE 'late_cancellation' END,
    'processed',
    v_voucher.event_date,
    now(),
    v_days_before,
    'Expert Paid - Resource Consumed. Tag 0% refund. Sponsor credit consumed.',
    now()
  )
  RETURNING id INTO v_settlement_id;

  -- Record transaction for expert payment
  INSERT INTO public.transactions (
    buyer_id,
    creator_id,
    content_id,
    amount,
    creator_revenue,
    platform_fee,
    status,
    transaction_type
  ) VALUES (
    v_voucher.user_id,
    v_content.creator_id,
    v_voucher.content_id,
    v_original_price,
    v_expert_payout,
    v_platform_fee,
    'completed',
    CASE WHEN p_cancellation_type = 'no_show' THEN 'no_show_settlement' ELSE 'late_cancel_settlement' END
  );

  RETURN jsonb_build_object(
    'success', true,
    'settlement_id', v_settlement_id,
    'expert_payout', v_expert_payout,
    'platform_fee', v_platform_fee,
    'user_refund', 0,
    'sponsor_credit_action', 'consumed',
    'status', 'Expert Paid - Resource Consumed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- FUNCTION: Process Early Cancellation (>3 days before)
-- Sponsor credit returned, Expert gets partial/no payout
-- =============================================
CREATE OR REPLACE FUNCTION public.process_early_cancellation(
  p_voucher_id UUID,
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher RECORD;
  v_content RECORD;
  v_settlement_id UUID;
  v_days_before INTEGER;
BEGIN
  -- Get voucher details
  SELECT * INTO v_voucher FROM public.vouchers WHERE id = p_voucher_id;
  
  IF v_voucher IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;
  
  IF v_voucher.status NOT IN ('active') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher cannot be cancelled');
  END IF;

  -- Get content details
  SELECT * INTO v_content FROM public.expert_contents WHERE id = v_voucher.content_id;
  
  -- Calculate days before event
  IF v_voucher.event_date IS NOT NULL THEN
    v_days_before := EXTRACT(DAY FROM (v_voucher.event_date - now()));
  ELSE
    v_days_before := 999; -- Assume early if no event date
  END IF;
  
  -- If less than 3 days, use no-show logic
  IF v_days_before < 3 THEN
    RETURN public.process_noshow_or_late_cancellation(p_voucher_id, 'late_cancellation', p_processed_by);
  END IF;

  -- Early cancellation: Return sponsor credit, no payout to expert
  UPDATE public.vouchers
  SET 
    status = 'cancelled',
    cancellation_type = 'early',
    cancelled_at = now(),
    cancelled_by = COALESCE(p_processed_by, auth.uid()),
    expert_payout_status = 'pending',
    sponsor_credit_status = 'returned',
    payout_amount = 0,
    refund_amount = COALESCE(v_content.price_huf, 0),
    financial_notes = 'Early cancellation (>' || v_days_before || ' days before). Sponsor credit returned.'
  WHERE id = p_voucher_id;

  -- If sponsored, return the credit to sponsor
  IF v_content.is_sponsored AND v_content.sponsor_id IS NOT NULL THEN
    -- Return credit to sponsor
    UPDATE public.sponsor_credits
    SET 
      used_credits = GREATEST(0, used_credits - COALESCE(v_content.fixed_sponsor_amount, v_content.price_huf, 0)),
      available_credits = available_credits + COALESCE(v_content.fixed_sponsor_amount, v_content.price_huf, 0)
    WHERE sponsor_user_id = v_content.sponsor_id;
    
    -- Also update content_sponsorships if applicable
    UPDATE public.content_sponsorships
    SET used_licenses = GREATEST(0, used_licenses - 1)
    WHERE content_id = v_voucher.content_id AND sponsor_id = v_content.sponsor_id;
  END IF;

  -- Create settlement record
  INSERT INTO public.voucher_settlements (
    voucher_id,
    user_id,
    expert_id,
    sponsor_id,
    content_id,
    original_price,
    sponsor_contribution,
    user_payment,
    expert_payout,
    platform_fee,
    user_refund,
    sponsor_credit_action,
    settlement_type,
    settlement_status,
    event_date,
    cancellation_date,
    days_before_event,
    notes,
    processed_at
  ) VALUES (
    p_voucher_id,
    v_voucher.user_id,
    v_content.creator_id,
    v_content.sponsor_id,
    v_voucher.content_id,
    COALESCE(v_content.price_huf, 0),
    CASE WHEN v_content.is_sponsored THEN COALESCE(v_content.price_huf, 0) ELSE 0 END,
    CASE WHEN v_content.is_sponsored THEN 0 ELSE COALESCE(v_content.price_huf, 0) END,
    0, -- No expert payout for early cancel
    0, -- No platform fee
    COALESCE(v_content.price_huf, 0), -- Full refund
    'returned',
    'early_cancellation',
    'processed',
    v_voucher.event_date,
    now(),
    v_days_before,
    'Early cancellation. Sponsor credit returned. Spot available for others.',
    now()
  )
  RETURNING id INTO v_settlement_id;

  RETURN jsonb_build_object(
    'success', true,
    'settlement_id', v_settlement_id,
    'expert_payout', 0,
    'platform_fee', 0,
    'user_refund', COALESCE(v_content.price_huf, 0),
    'sponsor_credit_action', 'returned',
    'status', 'Cancelled - Credit Returned'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- FUNCTION: Mark Voucher as No-Show (for Experts to use)
-- =============================================
CREATE OR REPLACE FUNCTION public.mark_voucher_noshow(
  p_voucher_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
BEGIN
  -- Find voucher by code
  SELECT id INTO v_voucher_id FROM public.vouchers WHERE code = p_voucher_code;
  
  IF v_voucher_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;
  
  -- Process as no-show
  RETURN public.process_noshow_or_late_cancellation(v_voucher_id, 'no_show', auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add transaction_type to transactions table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN transaction_type TEXT DEFAULT 'purchase';
  END IF;
END $$;