-- =====================================================
-- WELLAGORA BUSINESS ENGINE - Database Schema (Part 2)
-- =====================================================

-- 1. Insert default system settings (using correct column names)
INSERT INTO public.system_settings (key, value) VALUES
('platform_fee', '{"percentage": 20}'),
('exchange_rate', '{"EUR_HUF": 395}'),
('payout_settings', '{"minimum_threshold_huf": 10000, "frequency": "monthly"}'),
('sponsor_alert_thresholds', '{"warning": 5000, "critical": 1000}')
ON CONFLICT (key) DO NOTHING;

-- 2. Payouts Table for tracking expert earnings
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_huf integer NOT NULL,
  gross_revenue_huf integer NOT NULL,
  platform_fee_huf integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  programs_count integer DEFAULT 0,
  bookings_count integer DEFAULT 0,
  paid_at timestamp with time zone,
  payment_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Experts can view their own payouts
CREATE POLICY "Experts can view own payouts"
  ON public.payouts
  FOR SELECT
  USING (auth.uid() = expert_id);

-- Super admin full access
CREATE POLICY "Super admin can manage payouts"
  ON public.payouts
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 3. Audit Log Table for tracking all changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject', 'verify', 'suspend')),
  table_name text NOT NULL,
  record_id uuid,
  changes jsonb,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Super admin can view all audit logs
CREATE POLICY "Super admin can view audit logs"
  ON public.audit_log
  FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Anyone can insert audit logs (for tracking)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- 4. Broadcasts Table for admin notifications
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  target_role text CHECK (target_role IN ('all', 'member', 'expert', 'sponsor', 'creator')),
  channel text NOT NULL CHECK (channel IN ('push', 'email', 'in_app')),
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  delivery_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Super admin can manage broadcasts
CREATE POLICY "Super admin can manage broadcasts"
  ON public.broadcasts
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 5. Add Green Pass field to profiles (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'green_pass') THEN
    ALTER TABLE public.profiles ADD COLUMN green_pass boolean DEFAULT false;
  END IF;
END $$;

-- Add expert verification expiry (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verification_expires_at') THEN
    ALTER TABLE public.profiles ADD COLUMN verification_expires_at timestamp with time zone;
  END IF;
END $$;

-- 6. Add is_featured to expert_contents (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expert_contents' AND column_name = 'is_featured') THEN
    ALTER TABLE public.expert_contents ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;

-- Add sort_order for manual ordering (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expert_contents' AND column_name = 'sort_order') THEN
    ALTER TABLE public.expert_contents ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_green_pass ON public.profiles(green_pass) WHERE green_pass = true;
CREATE INDEX IF NOT EXISTS idx_expert_contents_featured ON public.expert_contents(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_expert ON public.payouts(expert_id);

-- 8. Function to log audit entries
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
  v_audit_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    v_user_id,
    v_user_email,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- 9. RPC function to get financial overview stats
CREATE OR REPLACE FUNCTION public.get_financial_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  -- Check if user is super admin
  IF NOT public.is_super_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Access denied');
  END IF;
  
  SELECT jsonb_build_object(
    'total_revenue_huf', COALESCE(SUM(ct.credits), 0),
    'total_transactions', COUNT(ct.id),
    'pending_payouts_count', (SELECT COUNT(*) FROM payouts WHERE status = 'pending'),
    'pending_payouts_amount', (SELECT COALESCE(SUM(amount_huf), 0) FROM payouts WHERE status = 'pending'),
    'completed_payouts_amount', (SELECT COALESCE(SUM(amount_huf), 0) FROM payouts WHERE status = 'completed'),
    'active_sponsors', (SELECT COUNT(DISTINCT sponsor_user_id) FROM sponsor_credits WHERE available_credits > 0),
    'total_credits_in_system', (SELECT COALESCE(SUM(available_credits), 0) FROM sponsor_credits),
    'low_balance_sponsors', (
      SELECT COUNT(*) FROM sponsor_credits WHERE available_credits < 5000 AND available_credits > 0
    ),
    'zero_balance_sponsors', (SELECT COUNT(*) FROM sponsor_credits WHERE available_credits <= 0)
  ) INTO v_result
  FROM credit_transactions ct
  WHERE ct.transaction_type = 'spend';
  
  RETURN v_result;
END;
$$;