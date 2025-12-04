-- =====================================================
-- SUBSCRIPTION SYSTEM FOR SPONSORS
-- =====================================================

-- 1. Create subscription_plans table (if not exists, extend existing)
-- First check if subscription_plans needs new columns
DO $$
BEGIN
  -- Add billing_interval column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscription_plans' AND column_name = 'billing_interval') THEN
    ALTER TABLE public.subscription_plans ADD COLUMN billing_interval text DEFAULT 'monthly';
  END IF;
  
  -- Add monthly_credits column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscription_plans' AND column_name = 'monthly_credits') THEN
    ALTER TABLE public.subscription_plans ADD COLUMN monthly_credits integer DEFAULT 1;
  END IF;
  
  -- Add yearly_bonus_credits column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'subscription_plans' AND column_name = 'yearly_bonus_credits') THEN
    ALTER TABLE public.subscription_plans ADD COLUMN yearly_bonus_credits integer DEFAULT 0;
  END IF;
END $$;

-- 2. Create organization_subscriptions table
CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired', 'past_due')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamp with time zone,
  stripe_subscription_id text,
  stripe_customer_id text,
  payment_method text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, status) -- Only one active subscription per org
);

-- 3. Extend sponsor_credits table
DO $$
BEGIN
  -- Add organization_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sponsor_credits' AND column_name = 'organization_id') THEN
    ALTER TABLE public.sponsor_credits ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
  END IF;
  
  -- Add subscription_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sponsor_credits' AND column_name = 'subscription_id') THEN
    ALTER TABLE public.sponsor_credits ADD COLUMN subscription_id uuid REFERENCES public.organization_subscriptions(id);
  END IF;
  
  -- Add credits_never_expire column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'sponsor_credits' AND column_name = 'credits_never_expire') THEN
    ALTER TABLE public.sponsor_credits ADD COLUMN credits_never_expire boolean DEFAULT true;
  END IF;
END $$;

-- 4. Extend credit_transactions table
DO $$
BEGIN
  -- Add subscription_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'subscription_id') THEN
    ALTER TABLE public.credit_transactions ADD COLUMN subscription_id uuid REFERENCES public.organization_subscriptions(id);
  END IF;
  
  -- Add organization_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'organization_id') THEN
    ALTER TABLE public.credit_transactions ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
  END IF;
END $$;

-- 5. Insert subscription plans (8 packages: Bronze/Silver/Gold/Diamond × monthly/yearly)
INSERT INTO public.subscription_plans (plan_key, name, description, price_huf, price_eur, billing_period, monthly_credits, yearly_bonus_credits, included_credits, features, is_active, display_order)
VALUES 
  -- Bronze Monthly
  ('bronze_monthly', 'Bronze Havi', 'Havi bronz előfizetés 1 kredittel', 29900, 80, 'monthly', 1, 0, 1, 
   '["1 kredit havonta", "Alap branding", "Email támogatás", "Impact riportok"]'::jsonb, true, 1),
  -- Bronze Yearly
  ('bronze_yearly', 'Bronze Éves', 'Éves bronz előfizetés 12+2 kredittel', 299000, 800, 'yearly', 1, 2, 14, 
   '["12 kredit évente + 2 bónusz", "Alap branding", "Email támogatás", "Impact riportok", "2 hónap megtakarítás"]'::jsonb, true, 2),
  -- Silver Monthly
  ('silver_monthly', 'Silver Havi', 'Havi ezüst előfizetés 2 kredittel', 49900, 135, 'monthly', 2, 0, 2, 
   '["2 kredit havonta", "Kiterjesztett branding", "Prioritás támogatás", "Social media említés"]'::jsonb, true, 3),
  -- Silver Yearly
  ('silver_yearly', 'Silver Éves', 'Éves ezüst előfizetés 24+4 kredittel', 499000, 1350, 'yearly', 2, 4, 28, 
   '["24 kredit évente + 4 bónusz", "Kiterjesztett branding", "Prioritás támogatás", "Social media említés", "2 hónap megtakarítás"]'::jsonb, true, 4),
  -- Gold Monthly
  ('gold_monthly', 'Gold Havi', 'Havi arany előfizetés 4 kredittel', 99900, 270, 'monthly', 4, 0, 4, 
   '["4 kredit havonta", "Prémium branding", "Dedikált account manager", "Co-branded programok", "Haladó analytics"]'::jsonb, true, 5),
  -- Gold Yearly
  ('gold_yearly', 'Gold Éves', 'Éves arany előfizetés 48+8 kredittel', 999000, 2700, 'yearly', 4, 8, 56, 
   '["48 kredit évente + 8 bónusz", "Prémium branding", "Dedikált account manager", "Co-branded programok", "Haladó analytics", "2 hónap megtakarítás"]'::jsonb, true, 6),
  -- Diamond Monthly
  ('diamond_monthly', 'Diamond Havi', 'Havi gyémánt előfizetés 8 kredittel', 199900, 540, 'monthly', 8, 0, 8, 
   '["8 kredit havonta", "Teljes márka integráció", "Dedikált success team", "API hozzáférés", "White-label opciók", "Egyedi fejlesztések"]'::jsonb, true, 7),
  -- Diamond Yearly
  ('diamond_yearly', 'Diamond Éves', 'Éves gyémánt előfizetés 96+16 kredittel', 1999000, 5400, 'yearly', 8, 16, 112, 
   '["96 kredit évente + 16 bónusz", "Teljes márka integráció", "Dedikált success team", "API hozzáférés", "White-label opciók", "Egyedi fejlesztések", "2 hónap megtakarítás"]'::jsonb, true, 8)
ON CONFLICT (plan_key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_huf = EXCLUDED.price_huf,
  price_eur = EXCLUDED.price_eur,
  billing_period = EXCLUDED.billing_period,
  included_credits = EXCLUDED.included_credits,
  features = EXCLUDED.features,
  display_order = EXCLUDED.display_order;

-- 6. Enable RLS on organization_subscriptions
ALTER TABLE public.organization_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for organization_subscriptions
DROP POLICY IF EXISTS "Org members can view their subscriptions" ON public.organization_subscriptions;
CREATE POLICY "Org members can view their subscriptions"
  ON public.organization_subscriptions
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Super admins can manage all subscriptions" ON public.organization_subscriptions;
CREATE POLICY "Super admins can manage all subscriptions"
  ON public.organization_subscriptions
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 8. Helper function to get organization's active subscription
CREATE OR REPLACE FUNCTION public.get_organization_subscription(_organization_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  plan_key text,
  plan_name text,
  status text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  monthly_credits integer,
  included_credits integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    os.id as subscription_id,
    os.plan_id,
    sp.plan_key,
    sp.name as plan_name,
    os.status,
    os.current_period_start,
    os.current_period_end,
    sp.monthly_credits,
    sp.included_credits
  FROM public.organization_subscriptions os
  JOIN public.subscription_plans sp ON sp.id = os.plan_id
  WHERE os.organization_id = _organization_id
    AND os.status = 'active'
  LIMIT 1;
$$;

-- 9. Function to credit organization based on subscription
CREATE OR REPLACE FUNCTION public.credit_organization_for_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_credits integer;
  bonus_credits integer;
  org_sponsor_user_id uuid;
BEGIN
  -- Only process when subscription becomes active
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    -- Get the plan credits
    SELECT sp.included_credits, COALESCE(sp.yearly_bonus_credits, 0)
    INTO plan_credits, bonus_credits
    FROM public.subscription_plans sp
    WHERE sp.id = NEW.plan_id;
    
    -- Find a sponsor user from the organization to attribute credits
    SELECT p.id INTO org_sponsor_user_id
    FROM public.profiles p
    WHERE p.organization_id = NEW.organization_id
    LIMIT 1;
    
    IF org_sponsor_user_id IS NOT NULL THEN
      -- Insert or update sponsor_credits
      INSERT INTO public.sponsor_credits (sponsor_user_id, organization_id, subscription_id, total_credits, available_credits, used_credits, credits_never_expire)
      VALUES (org_sponsor_user_id, NEW.organization_id, NEW.id, plan_credits, plan_credits, 0, true)
      ON CONFLICT (sponsor_user_id) DO UPDATE SET
        organization_id = NEW.organization_id,
        subscription_id = NEW.id,
        total_credits = public.sponsor_credits.total_credits + plan_credits,
        available_credits = public.sponsor_credits.available_credits + plan_credits,
        updated_at = now();
      
      -- Record the transaction
      INSERT INTO public.credit_transactions (sponsor_user_id, organization_id, subscription_id, credits, transaction_type, description)
      VALUES (org_sponsor_user_id, NEW.organization_id, NEW.id, plan_credits, 'subscription', 'Credits from subscription activation');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 10. Create trigger for subscription activation
DROP TRIGGER IF EXISTS on_subscription_activated ON public.organization_subscriptions;
CREATE TRIGGER on_subscription_activated
  AFTER INSERT OR UPDATE ON public.organization_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_organization_for_subscription();

-- 11. Add index for performance
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_org_id ON public.organization_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_status ON public.organization_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_sponsor_credits_org_id ON public.sponsor_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_org_id ON public.credit_transactions(organization_id);