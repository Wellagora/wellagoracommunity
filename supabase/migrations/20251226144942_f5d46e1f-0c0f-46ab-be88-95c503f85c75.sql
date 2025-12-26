-- Phase 1: Security & Stability - RLS Policy Hardening
-- Add 'authenticated' role requirement to all policies that should require authentication

-- 1. Organizations table - ensure proper visibility
DROP POLICY IF EXISTS "Authenticated users can view public organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated org members can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated org members can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated org admins can delete organization" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated business users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated project members can view project organizations" ON public.organizations;

-- Re-create with proper role restrictions
CREATE POLICY "Public can view public organizations" 
ON public.organizations 
FOR SELECT 
TO public
USING (is_public = true);

CREATE POLICY "Authenticated org members can view their organization" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated org members can update organization" 
ON public.organizations 
FOR UPDATE 
TO authenticated
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated org admins can delete organization" 
ON public.organizations 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role) OR 
       id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated business users can create organizations" 
ON public.organizations 
FOR INSERT 
TO authenticated
WITH CHECK (get_current_user_role() = ANY (ARRAY['business'::user_role, 'government'::user_role, 'ngo'::user_role]));

CREATE POLICY "Authenticated project members can view project organizations" 
ON public.organizations 
FOR SELECT 
TO authenticated
USING ((project_id IS NOT NULL) AND is_project_member(auth.uid(), project_id));

-- 2. Profiles table - ensure proper visibility
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated project members can view project profiles" ON public.profiles;

CREATE POLICY "Public can view public profiles" 
ON public.profiles 
FOR SELECT 
TO public
USING (is_public_profile = true);

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated project members can view project profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING ((project_id IS NULL) OR is_project_member(auth.uid(), project_id) OR (is_public_profile = true));

-- 3. Challenge completions - users can only see their own
DROP POLICY IF EXISTS "Authenticated users can view their own completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Authenticated users can insert completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Authenticated users can update their completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Authenticated users can delete their completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Authenticated org members can view org completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Authenticated project admins can view project completions" ON public.challenge_completions;

CREATE POLICY "Authenticated users can view their own completions" 
ON public.challenge_completions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert completions" 
ON public.challenge_completions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their completions" 
ON public.challenge_completions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their completions" 
ON public.challenge_completions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated org members can view org completions" 
ON public.challenge_completions 
FOR SELECT 
TO authenticated
USING ((organization_id IS NOT NULL) AND 
       organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authenticated project admins can view project completions" 
ON public.challenge_completions 
FOR SELECT 
TO authenticated
USING ((project_id IS NOT NULL) AND is_project_admin(auth.uid(), project_id));

-- 4. Projects table - only active or member access
DROP POLICY IF EXISTS "Authenticated users can view active projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated project admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated super admins can manage all projects" ON public.projects;

CREATE POLICY "Public can view active projects" 
ON public.projects 
FOR SELECT 
TO public
USING (is_active = true);

CREATE POLICY "Authenticated project admins can update projects" 
ON public.projects 
FOR UPDATE 
TO authenticated
USING (is_project_admin(auth.uid(), id));

CREATE POLICY "Authenticated super admins can manage all projects" 
ON public.projects 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 5. User roles table - restrict to authenticated
DROP POLICY IF EXISTS "Authenticated users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated super admins can delete roles" ON public.user_roles;

CREATE POLICY "Authenticated users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated super admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated super admins can insert roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated super admins can update roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated super admins can delete roles" 
ON public.user_roles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));