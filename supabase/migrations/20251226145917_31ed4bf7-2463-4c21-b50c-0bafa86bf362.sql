-- RPC Function for server-side aggregation of community impact stats
CREATE OR REPLACE FUNCTION get_community_impact_stats(p_project_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_members', (
      SELECT COUNT(DISTINCT user_id) 
      FROM project_members 
      WHERE (p_project_id IS NULL OR project_id = p_project_id)
    ),
    'total_completions', (
      SELECT COUNT(*) 
      FROM challenge_completions 
      WHERE validation_status = 'approved'
      AND (p_project_id IS NULL OR project_id = p_project_id)
    ),
    'total_points', (
      SELECT COALESCE(SUM(points_earned), 0) 
      FROM challenge_completions 
      WHERE validation_status = 'approved'
      AND (p_project_id IS NULL OR project_id = p_project_id)
    ),
    'active_challenges', (
      SELECT COUNT(*) 
      FROM challenge_definitions 
      WHERE is_active = true
      AND (p_project_id IS NULL OR project_id = p_project_id)
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Performance indexes for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_challenge_completions_project ON challenge_completions(project_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_org ON challenge_completions(organization_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_validation ON challenge_completions(validation_status);
CREATE INDEX IF NOT EXISTS idx_challenge_definitions_project ON challenge_definitions(project_id);
CREATE INDEX IF NOT EXISTS idx_challenge_definitions_active ON challenge_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_project ON profiles(project_id);