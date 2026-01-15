-- Add expires_at column for voucher expiration (if not exists)
ALTER TABLE public.vouchers
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '1 year');

-- Create index for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_vouchers_user_content ON public.vouchers(user_id, content_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers(status);

-- Add unique constraint to prevent duplicate claims (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vouchers_user_content_unique'
  ) THEN
    ALTER TABLE public.vouchers ADD CONSTRAINT vouchers_user_content_unique UNIQUE (user_id, content_id);
  END IF;
END $$;