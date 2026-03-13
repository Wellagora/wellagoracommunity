-- ============================================================
-- WellAgora — Founding Expert & Legal Compliance Fields
-- Date: 2026-03-11
-- Purpose: Add founding expert flag, ÁSZF acceptance tracking,
--          invoice/billing fields, and DAC7 reporting support
-- ============================================================

-- 1. Founding Expert flag on profiles
-- Only 5 founding experts, they get 0% platform fee forever
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_founding_expert BOOLEAN DEFAULT false;

-- 2. Expert Agreement (ÁSZF) acceptance tracking
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS expert_aszf_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expert_aszf_version TEXT;

-- 3. DAC7 reporting fields (EU directive - platform must report payments to individuals)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tax_id TEXT,                    -- Adóazonosító jel (magánszemély)
  ADD COLUMN IF NOT EXISTS company_tax_id TEXT,            -- Adószám (vállalkozó)
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,             -- Születési dátum (DAC7 kötelező)
  ADD COLUMN IF NOT EXISTS country_of_residence TEXT DEFAULT 'HU';  -- Lakóhely országa

-- 4. Invoice tracking on transactions
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,             -- Számlázz.hu számla szám
  ADD COLUMN IF NOT EXISTS invoice_issued_by TEXT           -- 'platform' | 'creator'
    CHECK (invoice_issued_by IN ('platform', 'creator')),
  ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'pending'
    CHECK (invoice_status IN ('pending', 'issued', 'failed', 'cancelled')),
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,            -- Számla PDF link
  ADD COLUMN IF NOT EXISTS creator_legal_status TEXT        -- Snapshot at purchase time
    CHECK (creator_legal_status IN ('individual', 'entrepreneur')),
  ADD COLUMN IF NOT EXISTS withdrawal_consent BOOLEAN DEFAULT false;  -- Elállási jog lemondás

-- 5. Sponsor credit expiration (dec. 31. of purchase year)
ALTER TABLE sponsor_credits
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set default expiry for existing records (end of current year)
UPDATE sponsor_credits
  SET expires_at = (date_trunc('year', created_at) + interval '1 year' - interval '1 second')
  WHERE expires_at IS NULL;

-- 6. Voucher settlements — add invoice tracking
ALTER TABLE voucher_settlements
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS invoice_issued_by TEXT
    CHECK (invoice_issued_by IN ('platform', 'creator'));

-- 7. RLS: Users can see their own tax info only
CREATE POLICY "Users see own tax fields" ON profiles
  FOR SELECT USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 8. Index for DAC7 annual reporting query
CREATE INDEX IF NOT EXISTS idx_transactions_creator_year
  ON transactions (creator_id, created_at)
  WHERE status = 'completed';

-- 9. Function to check if sponsor credit is expired
CREATE OR REPLACE FUNCTION is_sponsor_credit_valid(credit_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM sponsor_credits
    WHERE id = credit_id
    AND (expires_at IS NULL OR expires_at > now())
    AND available_credits > 0
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 10. Function to get DAC7 annual report data
CREATE OR REPLACE FUNCTION get_dac7_report(report_year INTEGER)
RETURNS TABLE (
  creator_id UUID,
  creator_name TEXT,
  creator_email TEXT,
  tax_id TEXT,
  date_of_birth DATE,
  country_of_residence TEXT,
  legal_status TEXT,
  total_transactions BIGINT,
  total_amount NUMERIC,
  total_creator_revenue NUMERIC,
  total_platform_fee NUMERIC
) AS $$
  SELECT
    p.id AS creator_id,
    COALESCE(p.first_name || ' ' || p.last_name, p.public_display_name) AS creator_name,
    p.email AS creator_email,
    p.tax_id,
    p.date_of_birth,
    p.country_of_residence,
    p.creator_legal_status AS legal_status,
    COUNT(t.id) AS total_transactions,
    COALESCE(SUM(t.amount), 0) AS total_amount,
    COALESCE(SUM(t.creator_revenue), 0) AS total_creator_revenue,
    COALESCE(SUM(t.platform_fee), 0) AS total_platform_fee
  FROM profiles p
  LEFT JOIN transactions t ON t.creator_id = p.id
    AND t.status = 'completed'
    AND EXTRACT(YEAR FROM t.created_at) = report_year
  WHERE p.creator_legal_status = 'individual'
    AND EXISTS (
      SELECT 1 FROM transactions t2
      WHERE t2.creator_id = p.id
      AND t2.status = 'completed'
      AND EXTRACT(YEAR FROM t2.created_at) = report_year
    )
  GROUP BY p.id, p.first_name, p.last_name, p.public_display_name,
           p.email, p.tax_id, p.date_of_birth, p.country_of_residence,
           p.creator_legal_status;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_dac7_report IS 'DAC7 EU directive: Annual report of all payments to individual (magánszemély) creators for NAV reporting';
