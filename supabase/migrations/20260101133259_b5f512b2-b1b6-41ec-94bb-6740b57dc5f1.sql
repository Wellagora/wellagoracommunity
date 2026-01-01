-- 1. SZPONZOROK
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  location_city TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view sponsors" ON sponsors FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage sponsors" ON sponsors FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. SZPONZORÁCIÓK
CREATE TABLE IF NOT EXISTS content_sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES expert_contents(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  total_licenses INTEGER NOT NULL DEFAULT 100,
  used_licenses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, sponsor_id)
);

ALTER TABLE content_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active sponsorships" ON content_sponsorships FOR SELECT USING (is_active = true);

CREATE POLICY "Admin manage sponsorships" ON content_sponsorships FOR ALL USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. VÁRÓLISTA
CREATE TABLE IF NOT EXISTS content_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES expert_contents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE content_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own waitlist" ON content_waitlist FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Experts view content waitlist" ON content_waitlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM expert_contents WHERE id = content_id AND creator_id = auth.uid())
);

CREATE POLICY "Admin view all waitlist" ON content_waitlist FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES expert_contents(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  pickup_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, content_id)
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vouchers" ON vouchers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own vouchers" ON vouchers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Experts manage content vouchers" ON vouchers FOR ALL USING (
  EXISTS (SELECT 1 FROM expert_contents WHERE id = content_id AND creator_id = auth.uid())
);

-- 5. PRÉMIUM SZOLGÁLTATÁSOK
CREATE TABLE IF NOT EXISTS expert_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES expert_contents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT DEFAULT 'consultation',
  price_huf INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE expert_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view active services" ON expert_services FOR SELECT USING (is_active = true);

CREATE POLICY "Experts manage own services" ON expert_services FOR ALL USING (auth.uid() = expert_id);

-- 6. CONTENT_ACCESS BŐVÍTÉSE
ALTER TABLE content_access 
ADD COLUMN IF NOT EXISTS sponsorship_id UUID REFERENCES content_sponsorships(id);

-- 7. MINTAADATOK
INSERT INTO sponsors (name, slug, description, location_city, is_active, is_verified) VALUES
('Káli Panzió', 'kali-panzio', 'Családias panzió a Káli-medence szívében.', 'Kővágóörs', true, true),
('Balaton Bor', 'balaton-bor', 'Prémium borok a Balaton-felvidékről.', 'Szentbékkálla', true, true),
('Kék Tüzép', 'kek-tuzep', 'Építőanyagok és kerti eszközök.', 'Mindszentkálla', true, true)
ON CONFLICT (slug) DO NOTHING;