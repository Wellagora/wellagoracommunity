-- Fix infinite recursion in user_permissions RLS policies
-- First, create a SECURITY DEFINER function to check super admin status without triggering RLS

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;

-- Create a SECURITY DEFINER function that bypasses RLS to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin_from_permissions(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = check_user_id 
    AND permission = 'super_admin'
  )
$$;

-- Create a simpler function for checking the current user
CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions
    WHERE user_id = auth.uid() 
    AND permission = 'super_admin'
  )
$$;

-- Recreate policies using the SECURITY DEFINER function (no recursion!)
CREATE POLICY "Users can view own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all permissions" 
ON public.user_permissions 
FOR SELECT 
USING (public.current_user_is_super_admin());

CREATE POLICY "Super admins can insert permissions" 
ON public.user_permissions 
FOR INSERT 
WITH CHECK (public.current_user_is_super_admin());

CREATE POLICY "Super admins can update permissions" 
ON public.user_permissions 
FOR UPDATE 
USING (public.current_user_is_super_admin());

CREATE POLICY "Super admins can delete permissions" 
ON public.user_permissions 
FOR DELETE 
USING (public.current_user_is_super_admin());