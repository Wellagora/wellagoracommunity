-- Community Posts System Migration
-- Creates tables for community wall posts, likes, and comments

CREATE TABLE community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'question', 'success_story', 'tip', 'announcement')),
  related_program_id UUID REFERENCES expert_contents(id),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE community_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for community_post_likes
CREATE POLICY "Anyone can read likes" ON community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON community_post_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for community_post_comments
CREATE POLICY "Anyone can read comments" ON community_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON community_post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own comments" ON community_post_comments FOR DELETE USING (auth.uid() = author_id);

-- Trigger function to auto-update likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON community_post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger function to auto-update comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON community_post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Create indexes for performance
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_community_post_likes_post ON community_post_likes(post_id);
CREATE INDEX idx_community_post_likes_user ON community_post_likes(user_id);
CREATE INDEX idx_community_post_comments_post ON community_post_comments(post_id);
CREATE INDEX idx_community_post_comments_author ON community_post_comments(author_id);
