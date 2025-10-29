-- Create credit_packages table for tracking purchased credit packages
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_eur numeric NOT NULL,
  price_huf numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create sponsor_credits table for tracking sponsor credit balance
CREATE TABLE IF NOT EXISTS public.sponsor_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits integer NOT NULL DEFAULT 0,
  used_credits integer NOT NULL DEFAULT 0,
  available_credits integer GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(sponsor_user_id)
);

-- Create credit_transactions table for tracking all credit movements
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund')),
  credits integer NOT NULL,
  description text,
  related_sponsorship_id uuid REFERENCES public.challenge_sponsorships(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Add credit_cost column to challenge_sponsorships
ALTER TABLE public.challenge_sponsorships 
ADD COLUMN IF NOT EXISTS credit_cost integer,
ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond'));

-- Enable RLS
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_packages (everyone can view)
CREATE POLICY "Everyone can view credit packages"
  ON public.credit_packages FOR SELECT
  USING (true);

-- RLS Policies for sponsor_credits
CREATE POLICY "Sponsors can view their own credits"
  ON public.sponsor_credits FOR SELECT
  USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can insert their own credits"
  ON public.sponsor_credits FOR INSERT
  WITH CHECK (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can update their own credits"
  ON public.sponsor_credits FOR UPDATE
  USING (auth.uid() = sponsor_user_id);

-- RLS Policies for credit_transactions
CREATE POLICY "Sponsors can view their own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can insert their own transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = sponsor_user_id);

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price_eur, price_huf) VALUES
  ('Starter', 100, 149, 59000),
  ('Professional', 500, 599, 239000),
  ('Enterprise', 2000, 1999, 799000)
ON CONFLICT DO NOTHING;

-- Create trigger to update sponsor_credits.updated_at
CREATE OR REPLACE FUNCTION update_sponsor_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sponsor_credits_updated_at
  BEFORE UPDATE ON public.sponsor_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsor_credits_updated_at();