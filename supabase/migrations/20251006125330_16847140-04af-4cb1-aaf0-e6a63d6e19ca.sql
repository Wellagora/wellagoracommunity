-- Grant super_admin role to the initial administrator
-- This migration sets up the first super admin based on email
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT au.id, 'super_admin'::app_role, au.id
FROM auth.users au
WHERE au.email = 'attila.kelemen@proself.org'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add comment explaining the security model
COMMENT ON TABLE public.user_roles IS 'Stores user roles separately from profiles for security. Only super_admins can assign roles.';

-- Create a view to easily check current user roles
CREATE OR REPLACE VIEW public.my_roles AS
SELECT role 
FROM public.user_roles 
WHERE user_id = auth.uid();

-- Grant access to authenticated users to view their own roles
GRANT SELECT ON public.my_roles TO authenticated;