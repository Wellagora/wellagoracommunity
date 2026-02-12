-- Share clicks tracking table for Expert Share Toolkit
-- Tracks UTM-based share click statistics per expert/program

CREATE TABLE IF NOT EXISTS share_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  program_id uuid REFERENCES expert_contents(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'direct', -- facebook, whatsapp, linkedin, email, qr, native, social_card, direct
  medium text DEFAULT 'share',
  campaign text DEFAULT NULL,
  clicked_at timestamptz DEFAULT now(),
  visitor_id text DEFAULT NULL, -- anonymous fingerprint or session id
  referrer text DEFAULT NULL,
  page_path text DEFAULT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_share_clicks_expert_id ON share_clicks(expert_id);
CREATE INDEX IF NOT EXISTS idx_share_clicks_program_id ON share_clicks(program_id);
CREATE INDEX IF NOT EXISTS idx_share_clicks_source ON share_clicks(source);
CREATE INDEX IF NOT EXISTS idx_share_clicks_clicked_at ON share_clicks(clicked_at);

-- RLS policies
ALTER TABLE share_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert share clicks"
  ON share_clicks FOR INSERT
  WITH CHECK (true);

-- Experts can read their own stats
CREATE POLICY "Experts can read own share clicks"
  ON share_clicks FOR SELECT
  USING (expert_id = auth.uid());

-- Admins can read all
CREATE POLICY "Admins can read all share clicks"
  ON share_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
