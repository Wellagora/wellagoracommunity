-- 1. Add governance columns to profiles (skip project_id as it exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' 
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sponsor_status TEXT DEFAULT 'active' 
  CHECK (sponsor_status IN ('active', 'suspended', 'pending_payment'));

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0;

-- 2. Add publication_status and sponsor_id to challenge_definitions (programs)
ALTER TABLE challenge_definitions 
ADD COLUMN IF NOT EXISTS publication_status TEXT DEFAULT 'draft' 
  CHECK (publication_status IN ('draft', 'pending_review', 'published', 'rejected', 'archived'));

ALTER TABLE challenge_definitions 
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES profiles(id);

-- 3. Create admin_task_queue view for governance dashboard
CREATE OR REPLACE VIEW admin_task_queue AS
SELECT 'expert_verification' as task_type, 
       COUNT(*) as count,
       'Szakértők hitelesítése' as label_hu,
       'Expert Verification' as label_en
FROM profiles 
WHERE user_role = 'creator' AND (verification_status = 'pending' OR is_verified_expert = false)
UNION ALL
SELECT 'program_review' as task_type, 
       COUNT(*) as count,
       'Programok jóváhagyása' as label_hu,
       'Program Review' as label_en
FROM challenge_definitions 
WHERE publication_status = 'pending_review' OR is_active = false
UNION ALL
SELECT 'sponsor_activation' as task_type, 
       COUNT(*) as count,
       'Szponzor aktiválás' as label_hu,
       'Sponsor Activation' as label_en
FROM profiles 
WHERE user_role IN ('business', 'government', 'ngo') AND sponsor_status = 'pending_payment'
UNION ALL
SELECT 'pending_feedback' as task_type, 
       COUNT(*) as count,
       'Visszajelzések' as label_hu,
       'Pending Feedback' as label_en
FROM feedback 
WHERE status = 'new';

-- 4. Grant access to the view
GRANT SELECT ON admin_task_queue TO authenticated;