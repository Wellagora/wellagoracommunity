-- Create user_view_state table to persist active UI view (separate from permissions)
CREATE TABLE IF NOT EXISTS public.user_view_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_view text NOT NULL DEFAULT 'member',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_view CHECK (active_view IN ('member', 'expert', 'sponsor'))
);

-- Enable RLS
ALTER TABLE public.user_view_state ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user can use a specific view based on their actual permissions
CREATE OR REPLACE FUNCTION public.can_use_view(_user_id uuid, _view text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _view = 'member' THEN true
    WHEN _view = 'expert' THEN EXISTS (
      SELECT 1 FROM profiles WHERE id = _user_id AND user_role = 'creator'
    )
    WHEN _view = 'sponsor' THEN EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = _user_id 
      AND role IN ('business', 'government', 'ngo')
    ) OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = _user_id 
      AND user_role IN ('business', 'government', 'ngo')
    )
    ELSE false
  END
$$;

-- RLS Policies for user_view_state
CREATE POLICY "Users can view their own view state"
ON public.user_view_state
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own view state"
ON public.user_view_state
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND can_use_view(auth.uid(), active_view)
);

CREATE POLICY "Users can update their own view state"
ON public.user_view_state
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (can_use_view(auth.uid(), active_view));

-- Create function to get user's available views
CREATE OR REPLACE FUNCTION public.get_available_views(_user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_REMOVE(ARRAY[
    'member',
    CASE WHEN can_use_view(_user_id, 'expert') THEN 'expert' ELSE NULL END,
    CASE WHEN can_use_view(_user_id, 'sponsor') THEN 'sponsor' ELSE NULL END
  ], NULL)::text[]
$$;