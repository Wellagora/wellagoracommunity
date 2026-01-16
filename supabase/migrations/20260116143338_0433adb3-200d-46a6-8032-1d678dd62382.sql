-- =====================================================
-- WellAgora Impact Marketplace: Business Model Alignment
-- =====================================================

-- 1. Add fixed_sponsor_amount to expert_contents (programs)
-- This is the fixed HUF amount deducted from sponsor's credits per member join
ALTER TABLE expert_contents 
ADD COLUMN IF NOT EXISTS fixed_sponsor_amount INTEGER DEFAULT 2500
  CHECK (fixed_sponsor_amount >= 0);

-- Add comment explaining the field
COMMENT ON COLUMN expert_contents.fixed_sponsor_amount IS 'Fixed HUF amount deducted from sponsor credits when a member claims a voucher';

-- 2. Create affiliate_links table for expert product recommendations
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES expert_contents(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  commission_rate NUMERIC(5,2) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  partner_name TEXT, -- e.g., 'Praktiker', 'Biobolt'
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on affiliate_links
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Policies for affiliate_links
CREATE POLICY "Experts can manage own affiliate links"
ON affiliate_links FOR ALL
USING (auth.uid() = expert_id)
WITH CHECK (auth.uid() = expert_id);

CREATE POLICY "Public can view active affiliate links"
ON affiliate_links FOR SELECT
USING (is_active = true);

-- 3. Add no_show tracking to vouchers
ALTER TABLE vouchers 
ADD COLUMN IF NOT EXISTS is_no_show BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_show_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS credit_status TEXT DEFAULT 'pending' CHECK (credit_status IN ('pending', 'deducted', 'consumed', 'returned'));

-- 4. Add sponsor_credit_deducted to track actual credit deduction
ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS sponsor_credit_deducted INTEGER DEFAULT 0;

-- 5. Create sponsor_activity_log for live impact feed
CREATE TABLE IF NOT EXISTS sponsor_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('claim', 'redeem', 'no_show', 'cancel', 'complete')),
  member_name TEXT,
  member_id UUID,
  content_id UUID REFERENCES expert_contents(id) ON DELETE SET NULL,
  content_title TEXT,
  credit_amount INTEGER DEFAULT 0,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on sponsor_activity_log
ALTER TABLE sponsor_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for sponsor_activity_log
CREATE POLICY "Sponsors can view own activity"
ON sponsor_activity_log FOR SELECT
USING (auth.uid() = sponsor_id);

CREATE POLICY "System can insert activity logs"
ON sponsor_activity_log FOR INSERT
WITH CHECK (true);

-- 6. Add revenue tracking fields to transactions table for 80/20 split visibility
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS gross_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS expert_share INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_share INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_percentage NUMERIC(5,2) DEFAULT 80.00;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_links_content ON affiliate_links(content_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_expert ON affiliate_links(expert_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_activity_sponsor ON sponsor_activity_log(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_sponsor_activity_created ON sponsor_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vouchers_credit_status ON vouchers(credit_status);

-- 8. Update existing vouchers to have 'pending' credit_status
UPDATE vouchers SET credit_status = 'pending' WHERE credit_status IS NULL;

-- 9. Function to calculate 80/20 split
CREATE OR REPLACE FUNCTION calculate_revenue_split(gross_amount INTEGER)
RETURNS TABLE(expert_share INTEGER, platform_share INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT 
    ROUND(gross_amount * 0.80)::INTEGER as expert_share,
    ROUND(gross_amount * 0.20)::INTEGER as platform_share;
END;
$$ LANGUAGE plpgsql IMMUTABLE;