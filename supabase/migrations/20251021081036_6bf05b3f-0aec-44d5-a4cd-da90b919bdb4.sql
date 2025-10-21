-- Create challenge_sponsorships table
CREATE TABLE public.challenge_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL,
  sponsor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sponsor_organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('bronze', 'silver', 'gold', 'platinum')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  amount_paid NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, region, sponsor_user_id)
);

-- Enable RLS
ALTER TABLE public.challenge_sponsorships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active sponsorships"
  ON public.challenge_sponsorships
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Business users can create sponsorships"
  ON public.challenge_sponsorships
  FOR INSERT
  WITH CHECK (
    auth.uid() = sponsor_user_id AND
    get_current_user_role() IN ('business', 'government', 'ngo')
  );

CREATE POLICY "Sponsors can update their own sponsorships"
  ON public.challenge_sponsorships
  FOR UPDATE
  USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Sponsors can delete their own sponsorships"
  ON public.challenge_sponsorships
  FOR DELETE
  USING (auth.uid() = sponsor_user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_challenge_sponsorships_updated_at
  BEFORE UPDATE ON public.challenge_sponsorships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_challenge_sponsorships_region ON public.challenge_sponsorships(region);
CREATE INDEX idx_challenge_sponsorships_challenge_id ON public.challenge_sponsorships(challenge_id);
CREATE INDEX idx_challenge_sponsorships_sponsor ON public.challenge_sponsorships(sponsor_user_id);