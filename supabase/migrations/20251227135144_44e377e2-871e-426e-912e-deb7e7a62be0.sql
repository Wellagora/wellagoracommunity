-- Reviews Table
CREATE TABLE content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content_id UUID REFERENCES expert_contents(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- RLS for Reviews
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON content_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can insert own reviews"
ON content_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON content_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON content_reviews FOR DELETE
USING (auth.uid() = user_id);

-- Profile Enhancements (bio already exists, add expertise_areas)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_areas TEXT[];

-- Category field for content
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS category TEXT;

-- Helper Functions
CREATE OR REPLACE FUNCTION get_content_average_rating(p_content_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
  FROM content_reviews
  WHERE content_id = p_content_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_content_review_count(p_content_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::integer
  FROM content_reviews
  WHERE content_id = p_content_id;
$$ LANGUAGE sql STABLE;