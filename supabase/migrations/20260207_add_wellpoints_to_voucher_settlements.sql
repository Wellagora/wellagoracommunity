-- Add WellPoints discount tracking to voucher_settlements
ALTER TABLE voucher_settlements
  ADD COLUMN IF NOT EXISTS wellpoints_discount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wellpoints_used integer DEFAULT 0;
