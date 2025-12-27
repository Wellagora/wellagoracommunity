-- Add sponsor fields to expert_contents for content sponsorship
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id);
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_name TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT false;

-- Create index for sponsored content queries
CREATE INDEX IF NOT EXISTS idx_expert_contents_is_sponsored ON expert_contents(is_sponsored) WHERE is_sponsored = true;