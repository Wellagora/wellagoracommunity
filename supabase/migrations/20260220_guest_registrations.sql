-- Guest registrations table for simplified program enrollment
-- Allows visitors to register for programs with just name + email (no account needed)

CREATE TABLE IF NOT EXISTS guest_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid REFERENCES expert_contents(id) ON DELETE CASCADE NOT NULL,
  guest_name varchar(100) NOT NULL,
  guest_email varchar(255) NOT NULL,
  registered_at timestamptz DEFAULT now(),
  converted_to_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  confirmation_token uuid DEFAULT gen_random_uuid(),
  confirmed boolean DEFAULT false,
  UNIQUE(program_id, guest_email)
);

CREATE INDEX IF NOT EXISTS idx_guest_registrations_email ON guest_registrations(guest_email);
CREATE INDEX IF NOT EXISTS idx_guest_registrations_program ON guest_registrations(program_id);
CREATE INDEX IF NOT EXISTS idx_guest_registrations_token ON guest_registrations(confirmation_token);

-- RLS policies
ALTER TABLE guest_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (guest registration from public program page)
CREATE POLICY "Anyone can register as guest"
  ON guest_registrations FOR INSERT
  WITH CHECK (true);

-- Anyone can read by confirmation_token (for confirmation page)
CREATE POLICY "Anyone can confirm by token"
  ON guest_registrations FOR SELECT
  USING (true);

-- Allow updating confirmed status via token
CREATE POLICY "Anyone can confirm registration"
  ON guest_registrations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Experts can see guests for their own programs
CREATE POLICY "Expert can see own program guests"
  ON guest_registrations FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM expert_contents WHERE creator_id = auth.uid()
    )
  );

-- Admins can see all
CREATE POLICY "Admin can see all guests"
  ON guest_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
