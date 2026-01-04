-- 1. Create vouchers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.expert_contents(id) ON DELETE SET NULL,
  sponsorship_id UUID REFERENCES public.content_sponsorships(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  redeemed_by UUID REFERENCES public.profiles(id),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- RLS policies for vouchers
CREATE POLICY "Users can view their own vouchers" ON public.vouchers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own vouchers" ON public.vouchers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Experts can view vouchers for their content" ON public.vouchers
  FOR SELECT USING (
    content_id IN (SELECT id FROM public.expert_contents WHERE creator_id = auth.uid())
  );

CREATE POLICY "Experts can update vouchers for their content" ON public.vouchers
  FOR UPDATE USING (
    content_id IN (SELECT id FROM public.expert_contents WHERE creator_id = auth.uid())
  );

CREATE POLICY "Super admins can manage all vouchers" ON public.vouchers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- 2. Add region and SEO columns to tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_region TEXT DEFAULT 'Káli-medence';

-- 3. Update super admin profile
UPDATE public.profiles 
SET user_role = 'sponsor', 
    is_super_admin = true, 
    organization_name = 'WellAgora Központ',
    primary_region = 'Káli-medence'
WHERE email = 'attila.kelemen@proself.org';