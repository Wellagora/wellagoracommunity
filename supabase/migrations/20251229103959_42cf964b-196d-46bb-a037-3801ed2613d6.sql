-- Community creations (user-uploaded photos of their work)
CREATE TABLE IF NOT EXISTS community_creations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES expert_contents(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community questions
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES expert_contents(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community answers from experts
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES community_questions(id) ON DELETE CASCADE NOT NULL,
  expert_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local partners
CREATE TABLE IF NOT EXISTS local_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE community_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_partners ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_creations
CREATE POLICY "Public can view creations" ON community_creations
  FOR SELECT USING (true);
CREATE POLICY "Users can create own creations" ON community_creations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own creations" ON community_creations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for community_questions
CREATE POLICY "Public can view questions" ON community_questions
  FOR SELECT USING (true);
CREATE POLICY "Users can ask questions" ON community_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for community_answers
CREATE POLICY "Public can view answers" ON community_answers
  FOR SELECT USING (true);
CREATE POLICY "Experts can answer" ON community_answers
  FOR INSERT WITH CHECK (
    auth.uid() = expert_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('creator'))
  );

-- RLS policies for local_partners
CREATE POLICY "Public can view partners" ON local_partners
  FOR SELECT USING (is_active = true);

-- Storage bucket for community creations
INSERT INTO storage.buckets (id, name, public) 
VALUES ('community-creations', 'community-creations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view community creations storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-creations');

CREATE POLICY "Users can upload community creations storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-creations' 
    AND auth.role() = 'authenticated'
  );

-- Sample local partners data
INSERT INTO local_partners (name, description, category) VALUES
  ('Káli Pékség', 'Hagyományos kovászos pékség a medence szívében', 'bakery'),
  ('Balaton Bor Kft.', 'Helyi borászat fenntartható gazdálkodással', 'winery'),
  ('Kővágóörsi Asztalosműhely', 'Kézműves famunkák és restaurálás', 'workshop');