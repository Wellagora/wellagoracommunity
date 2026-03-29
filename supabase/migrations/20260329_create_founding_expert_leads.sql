-- Founding Expert Landing Page — lead collection table
CREATE TABLE IF NOT EXISTS public.founding_expert_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.founding_expert_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (the landing page form is public, no auth required)
CREATE POLICY "Allow anonymous inserts" ON public.founding_expert_leads
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to read leads
CREATE POLICY "Allow authenticated read" ON public.founding_expert_leads
  FOR SELECT USING (auth.role() = 'authenticated');
