-- Add creator legal status and invoicing responsibility fields

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'creator_legal_status') THEN
    CREATE TYPE public.creator_legal_status AS ENUM ('individual', 'entrepreneur');
  END IF;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS creator_legal_status public.creator_legal_status NOT NULL DEFAULT 'individual';

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS invoice_issued_by TEXT CHECK (invoice_issued_by IN ('platform', 'creator'));
