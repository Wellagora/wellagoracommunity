-- Create transactions table for tracking purchases
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.expert_contents(id) NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  creator_revenue INTEGER NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Creators can view their own sales
CREATE POLICY "Creators can view own sales" 
ON public.transactions FOR SELECT 
USING (auth.uid() = creator_id);

-- Buyers can view their own purchases
CREATE POLICY "Buyers can view own purchases" 
ON public.transactions FOR SELECT 
USING (auth.uid() = buyer_id);

-- System can insert transactions (buyer inserts)
CREATE POLICY "System can insert transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);