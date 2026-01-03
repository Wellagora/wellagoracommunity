-- Update get_available_views to ensure Super Admins see ALL roles
CREATE OR REPLACE FUNCTION get_available_views(_user_id UUID)
RETURNS TEXT[] AS $$
DECLARE
  views TEXT[] := ARRAY['member'];
  is_super_admin BOOLEAN := FALSE;
  is_expert BOOLEAN := FALSE;
  is_sponsor BOOLEAN := FALSE;
BEGIN
  -- 1. SUPER ADMIN CHECK - They see ALL roles
  SELECT EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = 'super_admin'
  ) INTO is_super_admin;
  
  -- SUPER ADMIN SEES ALL!
  IF is_super_admin THEN
    RETURN ARRAY['member', 'expert', 'sponsor'];
  END IF;
  
  -- 2. EXPERT CHECK - Has published content OR is creator
  SELECT EXISTS(
    SELECT 1 FROM expert_contents WHERE creator_id = _user_id AND is_published = true
    UNION ALL
    SELECT 1 FROM profiles WHERE id = _user_id AND (
      user_role = 'creator' OR 
      is_verified_expert = true
    )
  ) INTO is_expert;
  
  IF is_expert THEN
    views := array_append(views, 'expert');
  END IF;
  
  -- 3. SPONSOR CHECK - Is business/gov/ngo OR has sponsor record
  SELECT EXISTS(
    SELECT 1 FROM sponsors WHERE user_id = _user_id
    UNION ALL
    SELECT 1 FROM profiles WHERE id = _user_id AND user_role IN ('business', 'government', 'ngo')
    UNION ALL
    SELECT 1 FROM user_roles WHERE user_id = _user_id AND role IN ('business', 'government', 'ngo')
  ) INTO is_sponsor;
  
  IF is_sponsor THEN
    views := array_append(views, 'sponsor');
  END IF;
  
  RETURN views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;