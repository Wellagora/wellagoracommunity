-- Add new columns to expert_contents for marketplace functionality
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'free' CHECK (access_type IN ('free', 'paid', 'sponsored'));
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS total_licenses INTEGER DEFAULT 0;
ALTER TABLE expert_contents ADD COLUMN IF NOT EXISTS used_licenses INTEGER DEFAULT 0;

-- Update existing access_level values to new access_type
UPDATE expert_contents SET access_type = 'free' WHERE access_level = 'free';
UPDATE expert_contents SET access_type = 'paid' WHERE access_level IN ('premium', 'one_time_purchase');

-- Add columns to transactions table for marketplace 
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_creator INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_platform INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS license_count INTEGER DEFAULT 1;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_type TEXT CHECK (transaction_type IN ('purchase', 'sponsorship'));

-- Update content_access table - add access_type if missing
ALTER TABLE content_access ADD COLUMN IF NOT EXISTS access_type TEXT CHECK (access_type IN ('purchase', 'sponsored'));

-- RLS Policies for content_access
DROP POLICY IF EXISTS "Users see own access" ON content_access;
CREATE POLICY "Users see own access" ON content_access
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can get access" ON content_access;
CREATE POLICY "Users can get access" ON content_access
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for transactions - users see their own transactions
DROP POLICY IF EXISTS "Users see own transactions" ON transactions;
CREATE POLICY "Users see own transactions" ON transactions
  FOR SELECT USING (
    creator_id = auth.uid() 
    OR buyer_id = auth.uid() 
    OR sponsor_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid() 
    OR sponsor_id = auth.uid()
  );

-- Allow sponsors to update expert_contents when sponsoring (use existing user_role enum values)
DROP POLICY IF EXISTS "Sponsors can sponsor content" ON expert_contents;
CREATE POLICY "Sponsors can sponsor content" ON expert_contents
  FOR UPDATE USING (
    is_published = true AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role IN ('business', 'government', 'ngo'))
  );