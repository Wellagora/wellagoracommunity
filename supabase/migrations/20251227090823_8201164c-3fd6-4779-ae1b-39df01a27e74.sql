-- Task 4: Events System Enhancement
-- Add status column to events if not exists
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled'));

-- Task 5: Creator Gated Content Foundation
-- Create content access level enum
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_access_level') THEN
    CREATE TYPE content_access_level AS ENUM ('free', 'registered', 'premium', 'one_time_purchase');
  END IF;
END $$;

-- Create expert_contents table
CREATE TABLE IF NOT EXISTS public.expert_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  content_url TEXT,
  access_level TEXT DEFAULT 'premium' CHECK (access_level IN ('free', 'registered', 'premium', 'one_time_purchase')),
  price_huf INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on expert_contents
ALTER TABLE public.expert_contents ENABLE ROW LEVEL SECURITY;

-- Create policies for expert_contents
CREATE POLICY "Public view published metadata" ON public.expert_contents 
  FOR SELECT USING (is_published = true);

CREATE POLICY "Creators manage own content" ON public.expert_contents 
  FOR ALL TO authenticated 
  USING (creator_id = auth.uid()) 
  WITH CHECK (creator_id = auth.uid());

-- Task 6: Stripe Connect + Wise Preparation
-- Add payout fields to profiles (stripe_account_id and stripe_onboarding_complete already exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_connect_id TEXT,
ADD COLUMN IF NOT EXISTS wise_email TEXT,
ADD COLUMN IF NOT EXISTS wise_iban TEXT,
ADD COLUMN IF NOT EXISTS payout_preference TEXT DEFAULT 'stripe' CHECK (payout_preference IN ('stripe', 'wise', 'bank_transfer'));

-- Create updated_at trigger for expert_contents
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_expert_contents_updated_at ON public.expert_contents;
CREATE TRIGGER update_expert_contents_updated_at
  BEFORE UPDATE ON public.expert_contents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();