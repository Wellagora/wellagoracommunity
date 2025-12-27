-- Add premium subscription fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- Create content_access table for tracking purchased content
CREATE TABLE IF NOT EXISTS public.content_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.expert_contents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_paid INTEGER,
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_id, user_id)
);

-- Enable RLS on content_access
ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own access records
CREATE POLICY "Users can view own content access"
ON public.content_access FOR SELECT
USING (auth.uid() = user_id);

-- Super admins can view all access records
CREATE POLICY "Super admins can view all content access"
ON public.content_access FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- System can insert access records (via functions)
CREATE POLICY "System can insert content access"
ON public.content_access FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create check_content_access function
CREATE OR REPLACE FUNCTION public.check_content_access(p_content_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_level TEXT;
  v_has_access BOOLEAN := false;
  v_is_premium BOOLEAN := false;
  v_premium_until TIMESTAMPTZ;
BEGIN
  -- Get content access level
  SELECT access_level INTO v_access_level
  FROM expert_contents
  WHERE id = p_content_id AND is_published = true;

  IF v_access_level IS NULL THEN
    RETURN false;
  END IF;

  -- Free content is always accessible
  IF v_access_level = 'free' THEN
    RETURN true;
  END IF;

  -- No user = no access for non-free content
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Registered content requires login only
  IF v_access_level = 'registered' THEN
    RETURN true;
  END IF;

  -- Check user's global premium status
  SELECT is_premium, premium_until INTO v_is_premium, v_premium_until
  FROM profiles
  WHERE id = p_user_id;

  -- Premium subscribers get access to all 'premium' content
  IF v_access_level = 'premium' THEN
    IF v_is_premium = true AND (v_premium_until IS NULL OR v_premium_until > NOW()) THEN
      RETURN true;
    END IF;
  END IF;

  -- For 'one_time_purchase' or if premium check failed, check content_access table
  SELECT EXISTS(
    SELECT 1 FROM content_access
    WHERE content_id = p_content_id AND user_id = p_user_id
  ) INTO v_has_access;

  RETURN v_has_access;
END;
$$;

-- Create get_content_access_status function
CREATE OR REPLACE FUNCTION public.get_content_access_status(p_content_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_content RECORD;
  v_user RECORD;
  v_has_access BOOLEAN;
BEGIN
  -- Get content info
  SELECT access_level, price_huf, is_published INTO v_content
  FROM expert_contents
  WHERE id = p_content_id;

  IF v_content IS NULL OR v_content.is_published = false THEN
    RETURN json_build_object(
      'has_access', false,
      'reason', 'not_found',
      'access_level', null,
      'price', null
    );
  END IF;

  -- Free content
  IF v_content.access_level = 'free' THEN
    RETURN json_build_object(
      'has_access', true,
      'reason', 'free',
      'access_level', 'free',
      'price', 0
    );
  END IF;

  -- Not logged in
  IF p_user_id IS NULL THEN
    RETURN json_build_object(
      'has_access', false,
      'reason', 'login_required',
      'access_level', v_content.access_level,
      'price', v_content.price_huf
    );
  END IF;

  -- Registered content
  IF v_content.access_level = 'registered' THEN
    RETURN json_build_object(
      'has_access', true,
      'reason', 'registered',
      'access_level', 'registered',
      'price', 0
    );
  END IF;

  -- Get user premium status
  SELECT is_premium, premium_until INTO v_user
  FROM profiles
  WHERE id = p_user_id;

  -- Premium content
  IF v_content.access_level = 'premium' THEN
    IF v_user.is_premium = true AND (v_user.premium_until IS NULL OR v_user.premium_until > NOW()) THEN
      RETURN json_build_object(
        'has_access', true,
        'reason', 'premium_subscriber',
        'access_level', 'premium',
        'price', 0
      );
    ELSE
      RETURN json_build_object(
        'has_access', false,
        'reason', 'premium_required',
        'access_level', 'premium',
        'price', null
      );
    END IF;
  END IF;

  -- One-time purchase
  IF v_content.access_level = 'one_time_purchase' THEN
    SELECT EXISTS(
      SELECT 1 FROM content_access
      WHERE content_id = p_content_id AND user_id = p_user_id
    ) INTO v_has_access;

    IF v_has_access THEN
      RETURN json_build_object(
        'has_access', true,
        'reason', 'purchased',
        'access_level', 'one_time_purchase',
        'price', v_content.price_huf
      );
    ELSE
      RETURN json_build_object(
        'has_access', false,
        'reason', 'purchase_required',
        'access_level', 'one_time_purchase',
        'price', v_content.price_huf
      );
    END IF;
  END IF;

  -- Fallback
  RETURN json_build_object(
    'has_access', false,
    'reason', 'unknown',
    'access_level', v_content.access_level,
    'price', v_content.price_huf
  );
END;
$$;