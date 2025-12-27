-- Add is_verified_expert and suspended_at to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_expert BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Add content moderation fields to expert_contents
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.expert_contents ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create RPC function to get admin platform stats
CREATE OR REPLACE FUNCTION public.get_admin_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_creators', (SELECT COUNT(*) FROM profiles WHERE user_role = 'creator'),
    'verified_creators', (SELECT COUNT(*) FROM profiles WHERE user_role = 'creator' AND is_verified_expert = true),
    'active_creators', (
      SELECT COUNT(DISTINCT ec.creator_id) 
      FROM expert_contents ec 
      JOIN profiles p ON ec.creator_id = p.id 
      WHERE p.user_role = 'creator' AND ec.is_published = true
    ),
    'pending_content_count', (SELECT COUNT(*) FROM expert_contents WHERE is_published = false AND rejected_at IS NULL),
    'stripe_connected_count', (SELECT COUNT(*) FROM profiles WHERE stripe_onboarding_complete = true),
    'total_carbon_handprint', (SELECT COALESCE(SUM(impact_kg_co2), 0) FROM carbon_handprint_entries)
  ) INTO result;
  
  RETURN result;
END;
$$;