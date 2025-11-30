-- Create subscription_plans table for configurable pricing plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_huf NUMERIC(10,2) NOT NULL,
  price_eur NUMERIC(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'yearly' CHECK (billing_period IN ('monthly', 'yearly')),
  included_credits INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  target_user_role TEXT CHECK (target_user_role IN ('business', 'government', 'ngo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view active plans
CREATE POLICY "Authenticated users can view active plans"
ON public.subscription_plans FOR SELECT TO authenticated
USING (is_active = true);

-- Policy: Super admins can manage plans
CREATE POLICY "Super admins can manage plans"
ON public.subscription_plans FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_key, name, description, price_huf, price_eur, included_credits, features, target_user_role, display_order) VALUES
('business_starter', 'Business Starter', 'Kisvállalkozásoknak', 50000, 130, 1, '["Szervezeti profil", "1 kredit/év", "Email támogatás"]', 'business', 1),
('business_pro', 'Business Pro', 'Növekvő vállalkozásoknak', 150000, 400, 5, '["Szervezeti profil", "5 kredit/év", "Analytics dashboard", "Prioritás támogatás"]', 'business', 2),
('government', 'Önkormányzat', 'Önkormányzatoknak', 100000, 270, 3, '["Szervezeti profil", "3 kredit/év", "Éves riport", "Dedikált kapcsolattartó"]', 'government', 3),
('ngo', 'Civil Szervezet', 'NGO-knak kedvezményesen', 25000, 70, 2, '["Szervezeti profil", "2 kredit/év", "Impact riport"]', 'ngo', 4),
('enterprise', 'Enterprise', 'Nagyvállalatok számára', 500000, 1300, 20, '["Minden funkció", "20 kredit/év", "API hozzáférés", "Custom fejlesztések", "SLA garancia"]', 'business', 5);