-- Add tip column to content_milestones for master tips
ALTER TABLE content_milestones ADD COLUMN IF NOT EXISTS tip TEXT;

-- Add tools_needed column to expert_contents for required tools list
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS tools_needed TEXT;