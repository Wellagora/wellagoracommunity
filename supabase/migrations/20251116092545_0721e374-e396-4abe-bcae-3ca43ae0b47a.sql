-- Security Migration: Fix Anonymous Access Across All Tables
-- This migration adds authentication requirements to all policies that currently allow anonymous access

-- =============================================================================
-- CHALLENGE COMPLETIONS
-- =============================================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Organization members can view their org completions" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can view completions in their projects" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON public.challenge_completions;

-- Create secure policies requiring authentication
CREATE POLICY "Authenticated users can view their own completions"
ON public.challenge_completions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated org members can view org completions"
ON public.challenge_completions
FOR SELECT
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Authenticated project admins can view project completions"
ON public.challenge_completions
FOR SELECT
TO authenticated
USING (
  project_id IS NOT NULL 
  AND is_project_admin(auth.uid(), project_id)
);

-- =============================================================================
-- CHALLENGE DEFINITIONS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view challenges in their projects" ON public.challenge_definitions;

CREATE POLICY "Authenticated users can view active challenges"
ON public.challenge_definitions
FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (project_id IS NULL OR is_project_member(auth.uid(), project_id))
);

-- =============================================================================
-- CHALLENGE SPONSORSHIPS
-- =============================================================================

DROP POLICY IF EXISTS "Everyone can view active sponsorships" ON public.challenge_sponsorships;
DROP POLICY IF EXISTS "Users can view sponsorships in their projects" ON public.challenge_sponsorships;

CREATE POLICY "Authenticated users can view active sponsorships"
ON public.challenge_sponsorships
FOR SELECT
TO authenticated
USING (
  status = 'active' 
  AND (project_id IS NULL OR is_project_member(auth.uid(), project_id))
);

-- =============================================================================
-- CREDIT PACKAGES
-- =============================================================================

DROP POLICY IF EXISTS "Everyone can view credit packages" ON public.credit_packages;

CREATE POLICY "Authenticated users can view credit packages"
ON public.credit_packages
FOR SELECT
TO authenticated
USING (true);

-- =============================================================================
-- MESSAGES
-- =============================================================================

-- Messages policies are already secure (recipient_user_id check)
-- Just add TO authenticated constraint for defense in depth

DROP POLICY IF EXISTS "Recipients can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Super admins can view all messages" ON public.messages;

CREATE POLICY "Authenticated recipients can view their messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Authenticated super admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

DROP POLICY IF EXISTS "Public organizations are viewable by everyone" ON public.organizations;
DROP POLICY IF EXISTS "Organization members can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations in their projects" ON public.organizations;

CREATE POLICY "Authenticated users can view public organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (is_public = true);

CREATE POLICY "Authenticated org members can view their organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Authenticated project members can view project organizations"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  project_id IS NOT NULL 
  AND is_project_member(auth.uid(), project_id)
);

-- =============================================================================
-- PROFILES
-- =============================================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their projects" ON public.profiles;

CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (is_public_profile = true);

CREATE POLICY "Authenticated users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Authenticated project members can view project profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  project_id IS NULL 
  OR is_project_member(auth.uid(), project_id) 
  OR is_public_profile = true
);

-- =============================================================================
-- PROJECT MEMBERS
-- =============================================================================

DROP POLICY IF EXISTS "Project members can view their project members" ON public.project_members;

CREATE POLICY "Authenticated project members can view members"
ON public.project_members
FOR SELECT
TO authenticated
USING (is_project_member(auth.uid(), project_id));

-- =============================================================================
-- PROJECTS
-- =============================================================================

DROP POLICY IF EXISTS "Active projects are viewable by everyone" ON public.projects;

CREATE POLICY "Authenticated users can view active projects"
ON public.projects
FOR SELECT
TO authenticated
USING (is_active = true);

-- =============================================================================
-- SPONSOR CREDITS
-- =============================================================================

-- Sponsor credits policies already secure (sponsor_user_id check)
-- Just add TO authenticated for defense in depth

DROP POLICY IF EXISTS "Sponsors can view their own credits" ON public.sponsor_credits;

CREATE POLICY "Authenticated sponsors can view their credits"
ON public.sponsor_credits
FOR SELECT
TO authenticated
USING (auth.uid() = sponsor_user_id);

-- =============================================================================
-- SUSTAINABILITY ACTIVITIES
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own activities" ON public.sustainability_activities;
DROP POLICY IF EXISTS "Users can view activities in their projects" ON public.sustainability_activities;
DROP POLICY IF EXISTS "Users can view organization activities if public" ON public.sustainability_activities;

CREATE POLICY "Authenticated users can view their own activities"
ON public.sustainability_activities
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated project admins can view project activities"
ON public.sustainability_activities
FOR SELECT
TO authenticated
USING (
  project_id IS NOT NULL 
  AND is_project_admin(auth.uid(), project_id)
);

CREATE POLICY "Authenticated users can view public org activities"
ON public.sustainability_activities
FOR SELECT
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT id FROM organizations WHERE is_public = true
  )
);

-- =============================================================================
-- SYSTEM SETTINGS
-- =============================================================================

-- System settings already properly secured (super_admin only)
-- Just add TO authenticated for consistency

DROP POLICY IF EXISTS "Super admins can view system settings" ON public.system_settings;

CREATE POLICY "Authenticated super admins can view settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- =============================================================================
-- TEAM INVITATIONS
-- =============================================================================

DROP POLICY IF EXISTS "Organization members can view their org invitations" ON public.team_invitations;

CREATE POLICY "Authenticated org members can view org invitations"
ON public.team_invitations
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- =============================================================================
-- USER ROLES
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;

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

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Fix storage.objects policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload their avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can update their avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated users can delete their avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix storage.objects policies for organization-logos bucket
DROP POLICY IF EXISTS "Organization logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Organization members can upload logos" ON storage.objects;

CREATE POLICY "Authenticated users can view org logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated org members can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Authenticated org members can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id::text = (storage.foldername(name))[1]
  )
);

-- Fix storage.objects policies for program-images bucket
DROP POLICY IF EXISTS "Program images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload program images" ON storage.objects;

CREATE POLICY "Authenticated users can view program images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'program-images');

CREATE POLICY "Authenticated admins can upload program images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-images' 
  AND has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Authenticated admins can update program images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'program-images' 
  AND has_role(auth.uid(), 'super_admin'::app_role)
);

-- =============================================================================
-- SUMMARY
-- =============================================================================

-- This migration adds 'TO authenticated' constraints to all policies
-- that previously allowed anonymous access. All data now requires
-- authentication while maintaining the same access control logic.
--
-- Key changes:
-- - All SELECT policies now require TO authenticated
-- - Storage buckets now require authentication for all operations
-- - Existing access control logic (user_id checks, project membership, etc.) preserved
-- - Defense in depth: authentication + authorization checks