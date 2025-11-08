-- Create a settings table for default project configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage system settings
CREATE POLICY "Super admins can view system settings"
ON public.system_settings
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete system settings"
ON public.system_settings
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'));

-- Update the handle_new_user function to automatically add users to default project
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  default_project_id uuid;
  default_project_role text := 'member';
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name, email, user_role, organization)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'citizen'::public.user_role),
    NEW.raw_user_meta_data->>'organization'
  );

  -- Get default project ID from settings
  SELECT (value->>'project_id')::uuid 
  INTO default_project_id
  FROM public.system_settings 
  WHERE key = 'default_project';

  -- If default project exists, add user as member
  IF default_project_id IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, user_id, role)
    VALUES (default_project_id, NEW.id, default_project_role)
    ON CONFLICT DO NOTHING;

    -- Also update the profile with the project_id
    UPDATE public.profiles
    SET project_id = default_project_id
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;