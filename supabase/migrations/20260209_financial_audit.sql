-- ================================================
-- WELLAGORA PÉNZÜGYI AUDIT — Sprint S.10
-- Date: 2026-02-09
-- ================================================

-- ============================================================
-- 1. Stripe Events table for webhook idempotency
-- ============================================================
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id ON stripe_events(event_id);

-- RLS
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage stripe_events" ON stripe_events;
CREATE POLICY "Service role can manage stripe_events" ON stripe_events
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- 2. Negative balance prevention trigger on credit_transactions
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_negative_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_balance BIGINT;
BEGIN
  -- Only check on spend-type transactions
  IF NEW.transaction_type = 'spend' THEN
    SELECT COALESCE(SUM(
      CASE 
        WHEN transaction_type = 'purchase' THEN credits
        WHEN transaction_type = 'spend' THEN credits
        WHEN transaction_type = 'refund' THEN credits
        WHEN transaction_type = 'bonus' THEN credits
        WHEN transaction_type = 'adjustment' THEN credits
        ELSE 0
      END
    ), 0) INTO current_balance
    FROM credit_transactions
    WHERE sponsor_user_id = NEW.sponsor_user_id;
    
    -- Check if balance after this transaction would be negative
    IF (current_balance + NEW.credits) < 0 THEN
      RAISE EXCEPTION 'Insufficient credits. Balance: %, Attempted: %', current_balance, NEW.credits;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_balance_before_spend ON credit_transactions;
CREATE TRIGGER check_balance_before_spend
  BEFORE INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_negative_balance();

-- ============================================================
-- 3. Credit balance verification function
-- ============================================================
CREATE OR REPLACE FUNCTION check_credit_balance(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  total_purchased BIGINT,
  total_spent BIGINT,
  total_refunded BIGINT,
  calculated_balance BIGINT,
  stored_balance BIGINT,
  is_consistent BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_user_id,
    COALESCE(SUM(CASE WHEN ct.transaction_type = 'purchase' THEN ct.credits ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN ct.transaction_type = 'spend' THEN ABS(ct.credits) ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(CASE WHEN ct.transaction_type = 'refund' THEN ct.credits ELSE 0 END), 0)::BIGINT,
    COALESCE(SUM(ct.credits), 0)::BIGINT,
    COALESCE((SELECT sc.available_credits FROM sponsor_credits sc WHERE sc.sponsor_user_id = p_user_id LIMIT 1), 0)::BIGINT,
    COALESCE(SUM(ct.credits), 0)::BIGINT = COALESCE((SELECT sc.available_credits FROM sponsor_credits sc WHERE sc.sponsor_user_id = p_user_id LIMIT 1), 0)::BIGINT
  FROM credit_transactions ct
  WHERE ct.sponsor_user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. Credit balances view — real-time balance from ledger
-- ============================================================
CREATE OR REPLACE VIEW credit_balances_view AS
SELECT 
  sponsor_user_id,
  COALESCE(SUM(CASE WHEN transaction_type = 'purchase' THEN credits ELSE 0 END), 0) as total_purchased,
  COALESCE(SUM(CASE WHEN transaction_type = 'spend' THEN ABS(credits) ELSE 0 END), 0) as total_spent,
  COALESCE(SUM(CASE WHEN transaction_type = 'refund' THEN credits ELSE 0 END), 0) as total_refunded,
  COALESCE(SUM(credits), 0) as current_balance,
  MAX(created_at) as last_transaction_at,
  COUNT(*) as transaction_count
FROM credit_transactions
GROUP BY sponsor_user_id;

-- ============================================================
-- 5. Ensure NOT NULL defaults on critical audit fields
-- ============================================================
DO $$
BEGIN
  -- credit_transactions.created_at should default to NOW()
  ALTER TABLE credit_transactions ALTER COLUMN created_at SET DEFAULT NOW();
  
  -- transactions.created_at should default to NOW()
  ALTER TABLE transactions ALTER COLUMN created_at SET DEFAULT NOW();
  
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some ALTER TABLE operations were skipped: %', SQLERRM;
END $$;

-- ============================================================
-- 6. Audit integrity checks (run as SELECT queries)
-- These are informational — uncomment in Supabase SQL Editor to verify
-- ============================================================

-- Check for credit_transactions with NULL required fields:
-- SELECT count(*) as missing_user FROM credit_transactions WHERE sponsor_user_id IS NULL;
-- SELECT count(*) as missing_type FROM credit_transactions WHERE transaction_type IS NULL;
-- SELECT count(*) as missing_amount FROM credit_transactions WHERE credits IS NULL OR credits = 0;

-- Check for transactions with inconsistent 80/20 split:
-- SELECT id, amount, creator_revenue, platform_fee,
--   ROUND(amount * 0.80) as expected_creator,
--   ROUND(amount * 0.20) as expected_platform,
--   ABS(creator_revenue - ROUND(amount * 0.80)) as creator_diff,
--   ABS(platform_fee - ROUND(amount * 0.20)) as platform_diff
-- FROM transactions
-- WHERE ABS(creator_revenue - ROUND(amount * 0.80)) > 1
--    OR ABS(platform_fee - ROUND(amount * 0.20)) > 1;

-- Check for balance drift (sponsor_credits vs credit_transactions):
-- SELECT sc.sponsor_user_id,
--   sc.available_credits as stored_balance,
--   COALESCE(SUM(ct.credits), 0) as calculated_balance,
--   sc.available_credits - COALESCE(SUM(ct.credits), 0) as drift
-- FROM sponsor_credits sc
-- LEFT JOIN credit_transactions ct ON ct.sponsor_user_id = sc.sponsor_user_id
-- GROUP BY sc.sponsor_user_id, sc.available_credits
-- HAVING sc.available_credits != COALESCE(SUM(ct.credits), 0);
