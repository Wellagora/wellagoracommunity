-- Security Migration Part 2: Fix Remaining Non-SELECT Policies
-- Add TO authenticated constraint to all INSERT, UPDATE, DELETE policies

-- =============================================================================
-- CHALLENGE COMPLETIONS
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can update their own challenge completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can delete their own challenge completions" ON public.challenge_completions;

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

-- =============================================================================
-- CHALLENGE DEFINITIONS
-- =============================================================================

DROP POLICY IF EXISTS "Project admins can create challenges" ON public.challenge_definitions;
DROP POLICY IF EXISTS "Project admins can update challenges" ON public.challenge_definitions;
DROP POLICY IF EXISTS "Project admins can delete challenges" ON public.challenge_definitions;

CREATE POLICY "Authenticated project admins can create challenges"
ON public.challenge_definitions
FOR INSERT
TO authenticated
WITH CHECK (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Authenticated project admins can update challenges"
ON public.challenge_definitions
FOR UPDATE
TO authenticated
USING (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Authenticated project admins can delete challenges"
ON public.challenge_definitions
FOR DELETE
TO authenticated
USING (
  is_project_admin(auth.uid(), project_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- =============================================================================
-- CHALLENGE SPONSORSHIPS
-- =============================================================================

DROP POLICY IF EXISTS "Business users can create sponsorships" ON public.challenge_sponsorships;
DROP POLICY IF EXISTS "Sponsors can update their own sponsorships" ON public.challenge_sponsorships;
DROP POLICY IF EXISTS "Sponsors can delete their own sponsorships" ON public.challenge_sponsorships;

CREATE POLICY "Authenticated business users can create sponsorships"
ON public.challenge_sponsorships
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sponsor_user_id 
  AND get_current_user_role() = ANY (ARRAY['business'::user_role, 'government'::user_role, 'ngo'::user_role])
);

CREATE POLICY "Authenticated sponsors can update sponsorships"
ON public.challenge_sponsorships
FOR UPDATE
TO authenticated
USING (auth.uid() = sponsor_user_id);

CREATE POLICY "Authenticated sponsors can delete sponsorships"
ON public.challenge_sponsorships
FOR DELETE
TO authenticated
USING (auth.uid() = sponsor_user_id);

-- =============================================================================
-- CREDIT TRANSACTIONS
-- =============================================================================

DROP POLICY IF EXISTS "Sponsors can insert their own transactions" ON public.credit_transactions;

CREATE POLICY "Authenticated sponsors can insert transactions"
ON public.credit_transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sponsor_user_id);

-- =============================================================================
-- MESSAGES
-- =============================================================================

DROP POLICY IF EXISTS "Service role can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Super admins can update messages" ON public.messages;

-- Keep service role for system-generated messages, add authenticated for user messages
CREATE POLICY "Authenticated users or service can insert messages"
ON public.messages
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Authenticated super admins can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

DROP POLICY IF EXISTS "Business users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization members can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Organization admins can delete their organization" ON public.organizations;

CREATE POLICY "Authenticated business users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (
  get_current_user_role() = ANY (ARRAY['business'::user_role, 'government'::user_role, 'ngo'::user_role])
);

CREATE POLICY "Authenticated org members can update organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Authenticated org admins can delete organization"
ON public.organizations
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'super_admin'::app_role) 
  OR id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
);

-- =============================================================================
-- PROFILES
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- =============================================================================
-- PROJECT MEMBERS
-- =============================================================================

DROP POLICY IF EXISTS "Users can join projects" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can manage members" ON public.project_members;

CREATE POLICY "Authenticated users can join projects"
ON public.project_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated project admins can manage members"
ON public.project_members
FOR ALL
TO authenticated
USING (is_project_admin(auth.uid(), project_id));

-- =============================================================================
-- PROJECTS
-- =============================================================================

DROP POLICY IF EXISTS "Project admins can update their projects" ON public.projects;
DROP POLICY IF EXISTS "Super admins can manage all projects" ON public.projects;

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

-- =============================================================================
-- SPONSOR CREDITS
-- =============================================================================

DROP POLICY IF EXISTS "Sponsors can insert their own credits" ON public.sponsor_credits;
DROP POLICY IF EXISTS "Sponsors can update their own credits" ON public.sponsor_credits;

CREATE POLICY "Authenticated sponsors can insert credits"
ON public.sponsor_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sponsor_user_id);

CREATE POLICY "Authenticated sponsors can update credits"
ON public.sponsor_credits
FOR UPDATE
TO authenticated
USING (auth.uid() = sponsor_user_id);

-- =============================================================================
-- SUSTAINABILITY ACTIVITIES
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert their own activities" ON public.sustainability_activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.sustainability_activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.sustainability_activities;

CREATE POLICY "Authenticated users can insert activities"
ON public.sustainability_activities
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update activities"
ON public.sustainability_activities
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete activities"
ON public.sustainability_activities
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================================================
-- SYSTEM SETTINGS
-- =============================================================================

DROP POLICY IF EXISTS "Super admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Super admins can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Super admins can delete system settings" ON public.system_settings;

CREATE POLICY "Authenticated super admins can insert settings"
ON public.system_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated super admins can update settings"
ON public.system_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated super admins can delete settings"
ON public.system_settings
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- =============================================================================
-- TEAM INVITATIONS
-- =============================================================================

DROP POLICY IF EXISTS "Organization members can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Inviters can update their invitations" ON public.team_invitations;

CREATE POLICY "Authenticated org members can create invitations"
ON public.team_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  AND inviter_user_id = auth.uid()
);

CREATE POLICY "Authenticated inviters can update invitations"
ON public.team_invitations
FOR UPDATE
TO authenticated
USING (inviter_user_id = auth.uid());

-- =============================================================================
-- USER ROLES
-- =============================================================================

DROP POLICY IF EXISTS "Super admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;

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

-- =============================================================================
-- STORAGE OBJECTS - Add missing DELETE policies
-- =============================================================================

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can delete their logo" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can update their logo" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete program images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update program images" ON storage.objects;

-- Organization logos DELETE
CREATE POLICY "Authenticated org members can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id::text = (storage.foldername(name))[1]
  )
);

-- Program images DELETE
CREATE POLICY "Authenticated admins can delete program images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-images' 
  AND has_role(auth.uid(), 'super_admin'::app_role)
);