-- =============================================
-- SPONSORSHIP SELECTION LOGIC REFINEMENT
-- Sponsors can now only support: Category OR Expert (not individual programs)
-- =============================================

-- Add sponsorship type tracking to sponsor_credits
ALTER TABLE public.sponsor_credits 
ADD COLUMN IF NOT EXISTS sponsorship_type TEXT CHECK (sponsorship_type IN ('category', 'expert')) DEFAULT 'category',
ADD COLUMN IF NOT EXISTS sponsored_category TEXT,
ADD COLUMN IF NOT EXISTS sponsored_expert_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS package_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS package_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS initial_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_balance_alert_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_renewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS previous_package_rollover INTEGER DEFAULT 0;

-- Create index for efficient category/expert lookups
CREATE INDEX IF NOT EXISTS idx_sponsor_credits_category ON public.sponsor_credits(sponsored_category) WHERE sponsorship_type = 'category';
CREATE INDEX IF NOT EXISTS idx_sponsor_credits_expert ON public.sponsor_credits(sponsored_expert_id) WHERE sponsorship_type = 'expert';

-- =============================================
-- CREDIT EXPIRY & ROLLOVER TRACKING
-- =============================================

-- Create a history table for credit package renewals/expirations
CREATE TABLE IF NOT EXISTS public.credit_package_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL,
  initial_credits INTEGER NOT NULL,
  remaining_credits INTEGER NOT NULL,
  rollover_credits INTEGER DEFAULT 0,
  action TEXT NOT NULL CHECK (action IN ('purchased', 'renewed', 'expired', 'rolled_over')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.credit_package_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_package_history
CREATE POLICY "Users can view their own credit history"
ON public.credit_package_history
FOR SELECT
USING (auth.uid() = sponsor_user_id);

CREATE POLICY "System can insert credit history"
ON public.credit_package_history
FOR INSERT
WITH CHECK (auth.uid() = sponsor_user_id);

-- =============================================
-- LOW BALANCE ALERT TRACKING
-- =============================================

-- Create table for tracking sent alerts (to avoid duplicate emails)
CREATE TABLE IF NOT EXISTS public.sponsor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_balance', 'critical_balance', 'expired', 'renewal_reminder')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_sent_to TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.sponsor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own alerts"
ON public.sponsor_alerts
FOR SELECT
USING (auth.uid() = sponsor_user_id);

CREATE POLICY "System can insert alerts"
ON public.sponsor_alerts
FOR INSERT
WITH CHECK (true);

-- Index for efficient alert lookups
CREATE INDEX IF NOT EXISTS idx_sponsor_alerts_user_type ON public.sponsor_alerts(sponsor_user_id, alert_type);

-- =============================================
-- UPDATE CONTENT SPONSORSHIPS FOR SIMPLIFIED MODEL
-- =============================================

-- Add category tracking to content_sponsorships
ALTER TABLE public.content_sponsorships
ADD COLUMN IF NOT EXISTS supported_category TEXT,
ADD COLUMN IF NOT EXISTS is_category_sponsorship BOOLEAN DEFAULT false;

-- Function to check if sponsor credit is below threshold
CREATE OR REPLACE FUNCTION public.check_sponsor_credit_threshold()
RETURNS TRIGGER AS $$
DECLARE
  threshold_percent NUMERIC := 0.20; -- 20%
  current_percent NUMERIC;
  alert_exists BOOLEAN;
BEGIN
  -- Only check if credits decreased
  IF NEW.available_credits < OLD.available_credits THEN
    -- Calculate current percentage
    IF NEW.initial_credits > 0 THEN
      current_percent := NEW.available_credits::NUMERIC / NEW.initial_credits::NUMERIC;
      
      -- Check if below 20% and alert not already sent
      IF current_percent <= threshold_percent AND NOT COALESCE(NEW.low_balance_alert_sent, false) THEN
        -- Check if alert was sent in last 7 days
        SELECT EXISTS (
          SELECT 1 FROM public.sponsor_alerts 
          WHERE sponsor_user_id = NEW.sponsor_user_id 
          AND alert_type = 'low_balance'
          AND sent_at > now() - INTERVAL '7 days'
        ) INTO alert_exists;
        
        IF NOT alert_exists THEN
          -- Mark that we should send an alert (the edge function will handle actual sending)
          NEW.low_balance_alert_sent := true;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for credit threshold check
DROP TRIGGER IF EXISTS trigger_check_sponsor_credit ON public.sponsor_credits;
CREATE TRIGGER trigger_check_sponsor_credit
  BEFORE UPDATE ON public.sponsor_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.check_sponsor_credit_threshold();

-- Function to process credit expiry (called by scheduled job or manually)
CREATE OR REPLACE FUNCTION public.process_credit_expiry()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  sponsor_record RECORD;
BEGIN
  -- Find all expired credits that haven't been processed
  FOR sponsor_record IN 
    SELECT * FROM public.sponsor_credits 
    WHERE package_end_date IS NOT NULL 
    AND package_end_date < now() 
    AND available_credits > 0
    AND NOT COALESCE(is_renewed, false)
  LOOP
    -- Log the expiration
    INSERT INTO public.credit_package_history (
      sponsor_user_id,
      package_type,
      initial_credits,
      remaining_credits,
      action
    ) VALUES (
      sponsor_record.sponsor_user_id,
      COALESCE(sponsor_record.sponsorship_type, 'category'),
      sponsor_record.initial_credits,
      sponsor_record.available_credits,
      'expired'
    );
    
    -- Zero out the credits
    UPDATE public.sponsor_credits 
    SET available_credits = 0,
        used_credits = initial_credits
    WHERE id = sponsor_record.id;
    
    expired_count := expired_count + 1;
  END LOOP;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process credit rollover on renewal
CREATE OR REPLACE FUNCTION public.process_credit_renewal(
  p_sponsor_user_id UUID,
  p_new_credits INTEGER,
  p_package_type TEXT DEFAULT 'category'
)
RETURNS JSONB AS $$
DECLARE
  current_record RECORD;
  rollover_amount INTEGER := 0;
  result JSONB;
BEGIN
  -- Get current credits
  SELECT * INTO current_record 
  FROM public.sponsor_credits 
  WHERE sponsor_user_id = p_sponsor_user_id;
  
  IF current_record IS NOT NULL THEN
    -- Calculate rollover (remaining credits)
    rollover_amount := COALESCE(current_record.available_credits, 0);
    
    -- Log the rollover
    INSERT INTO public.credit_package_history (
      sponsor_user_id,
      package_type,
      initial_credits,
      remaining_credits,
      rollover_credits,
      action
    ) VALUES (
      p_sponsor_user_id,
      p_package_type,
      current_record.initial_credits,
      rollover_amount,
      rollover_amount,
      'rolled_over'
    );
    
    -- Update credits with new + rollover
    UPDATE public.sponsor_credits 
    SET total_credits = p_new_credits + rollover_amount,
        available_credits = p_new_credits + rollover_amount,
        initial_credits = p_new_credits,
        used_credits = 0,
        is_renewed = true,
        previous_package_rollover = rollover_amount,
        package_start_date = now(),
        package_end_date = now() + INTERVAL '1 year',
        low_balance_alert_sent = false
    WHERE sponsor_user_id = p_sponsor_user_id;
  ELSE
    -- New sponsor - create record
    INSERT INTO public.sponsor_credits (
      sponsor_user_id,
      total_credits,
      available_credits,
      initial_credits,
      used_credits,
      sponsorship_type,
      package_start_date,
      package_end_date
    ) VALUES (
      p_sponsor_user_id,
      p_new_credits,
      p_new_credits,
      p_new_credits,
      0,
      p_package_type,
      now(),
      now() + INTERVAL '1 year'
    );
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'new_credits', p_new_credits,
    'rollover_credits', rollover_amount,
    'total_credits', p_new_credits + rollover_amount
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;