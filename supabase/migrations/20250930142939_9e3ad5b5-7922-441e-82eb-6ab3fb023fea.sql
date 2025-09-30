-- Create user roles system with proper security
-- Step 1: Create enum for roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'business', 'government', 'ngo', 'citizen');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 4: Create function to get user's primary role (for backward compatibility)
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'business' THEN 3
      WHEN 'government' THEN 4
      WHEN 'ngo' THEN 5
      WHEN 'citizen' THEN 6
    END
  LIMIT 1;
$$;

-- Step 5: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, user_role::text::app_role
FROM public.profiles
WHERE user_role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 6: Add RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));

-- Step 7: Add DELETE policies to tables
CREATE POLICY "Users can delete their own challenge completions"
ON public.challenge_completions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
ON public.sustainability_activities
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can delete their organization"
ON public.organizations
FOR DELETE
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);

-- Step 8: Add input validation trigger for challenge completions
CREATE OR REPLACE FUNCTION validate_challenge_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate completion_type
  IF NEW.completion_type NOT IN ('manual', 'photo', 'api_verified', 'peer_verified') THEN
    RAISE EXCEPTION 'Invalid completion_type. Must be one of: manual, photo, api_verified, peer_verified';
  END IF;

  -- Validate validation_status
  IF NEW.validation_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid validation_status. Must be one of: pending, approved, rejected';
  END IF;

  -- Validate points_earned is not negative
  IF NEW.points_earned < 0 THEN
    RAISE EXCEPTION 'points_earned cannot be negative';
  END IF;

  -- Validate validation_score is between 0 and 1
  IF NEW.validation_score < 0 OR NEW.validation_score > 1 THEN
    RAISE EXCEPTION 'validation_score must be between 0 and 1';
  END IF;

  -- Sanitize notes (limit length)
  IF NEW.notes IS NOT NULL AND LENGTH(NEW.notes) > 5000 THEN
    RAISE EXCEPTION 'notes cannot exceed 5000 characters';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_challenge_completion_trigger
BEFORE INSERT OR UPDATE ON public.challenge_completions
FOR EACH ROW
EXECUTE FUNCTION validate_challenge_completion();

-- Step 9: Add audit logging table
CREATE TABLE public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Step 10: Create trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.assigned_by, 'ROLE_ASSIGNED', 'user_roles', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'ROLE_REVOKED', 'user_roles', OLD.id, to_jsonb(OLD));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_role_changes
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION log_role_changes();