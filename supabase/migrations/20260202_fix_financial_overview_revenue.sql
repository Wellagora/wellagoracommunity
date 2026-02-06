-- Fix get_financial_overview to calculate revenue from purchase transactions, not spend transactions
-- Revenue should be positive credits from purchases, not negative credits from spending

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
  WHERE ct.transaction_type IN ('purchase', 'subscription', 'initial', 'rollover', 'bonus');
  
  RETURN v_result;
END;
$$;
