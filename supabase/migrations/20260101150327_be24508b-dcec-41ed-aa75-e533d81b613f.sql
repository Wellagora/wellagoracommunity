-- Add sponsorship benefit fields to content_sponsorships
ALTER TABLE content_sponsorships 
ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'access',
ADD COLUMN IF NOT EXISTS discount_value TEXT,
ADD COLUMN IF NOT EXISTS discount_description TEXT,
ADD COLUMN IF NOT EXISTS redemption_location TEXT,
ADD COLUMN IF NOT EXISTS is_chain_partner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsorship_benefit TEXT;

-- Comment on the new columns
COMMENT ON COLUMN content_sponsorships.discount_type IS 'Type of discount: access, percentage, fixed_amount';
COMMENT ON COLUMN content_sponsorships.discount_value IS 'Display value of discount e.g. 15%';
COMMENT ON COLUMN content_sponsorships.discount_description IS 'Short description of the discount e.g. 15% off all wood products';
COMMENT ON COLUMN content_sponsorships.redemption_location IS 'Where the voucher can be redeemed';
COMMENT ON COLUMN content_sponsorships.is_chain_partner IS 'If true, voucher is valid at all partner locations';
COMMENT ON COLUMN content_sponsorships.sponsorship_benefit IS 'Detailed description of sponsorship benefits';