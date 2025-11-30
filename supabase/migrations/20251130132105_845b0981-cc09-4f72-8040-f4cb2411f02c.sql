-- Create subscriptions table for managing organization subscription plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('business_starter', 'business_pro', 'government', 'ngo', 'enterprise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'past_due')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  price_paid NUMERIC(10,2),
  currency TEXT DEFAULT 'HUF',
  payment_reference TEXT,
  stripe_subscription_id TEXT,
  auto_renew BOOLEAN DEFAULT true,
  included_credits INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view their subscription
CREATE POLICY "Org members can view their subscription"
ON public.subscriptions FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Policy: Super admins can manage all subscriptions
CREATE POLICY "Super admins can manage all subscriptions"
ON public.subscriptions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));