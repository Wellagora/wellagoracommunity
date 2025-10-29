-- 1. Extend app_role enum with project_admin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_admin';

-- 2. Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  region_name TEXT NOT NULL,
  villages TEXT[] DEFAULT '{}',
  description TEXT,
  branding JSONB DEFAULT '{"primaryColor": "#10b981", "logo": null}'::jsonb,
  settings JSONB DEFAULT '{"allowPublicView": true, "requireApproval": false}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. Add project_id to existing tables
ALTER TABLE public.profiles ADD COLUMN project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.challenge_completions ADD COLUMN project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.challenge_sponsorships ADD COLUMN project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.sustainability_activities ADD COLUMN project_id UUID REFERENCES public.projects(id);
ALTER TABLE public.organizations ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- 4. Create project_members table for project admins and members
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 5. Create security definer functions for project access
CREATE OR REPLACE FUNCTION public.is_project_admin(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE user_id = _user_id
      AND project_id = _project_id
      AND role = 'admin'
  ) OR public.has_role(_user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_members
    WHERE user_id = _user_id
      AND project_id = _project_id
  ) OR public.has_role(_user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_projects(_user_id uuid)
RETURNS TABLE(project_id uuid, project_name text, project_slug text, user_role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pm.project_id,
    p.name,
    p.slug,
    pm.role
  FROM public.project_members pm
  JOIN public.projects p ON p.id = pm.project_id
  WHERE pm.user_id = _user_id AND p.is_active = true;
$$;

-- 6. RLS Policies for projects table
CREATE POLICY "Active projects are viewable by everyone"
ON public.projects
FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage all projects"
ON public.projects
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Project admins can update their projects"
ON public.projects
FOR UPDATE
USING (public.is_project_admin(auth.uid(), id));

-- 7. RLS Policies for project_members
CREATE POLICY "Project members can view their project members"
ON public.project_members
FOR SELECT
USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Project admins can manage members"
ON public.project_members
FOR ALL
USING (public.is_project_admin(auth.uid(), project_id));

-- 8. Update existing RLS policies to include project isolation
-- Profiles: users can see profiles in their projects
CREATE POLICY "Users can view profiles in their projects"
ON public.profiles
FOR SELECT
USING (
  project_id IS NULL OR 
  public.is_project_member(auth.uid(), project_id) OR
  is_public_profile = true
);

-- Challenge completions: project-scoped
CREATE POLICY "Users can view completions in their projects"
ON public.challenge_completions
FOR SELECT
USING (
  auth.uid() = user_id OR
  (project_id IS NOT NULL AND public.is_project_admin(auth.uid(), project_id))
);

-- Challenge sponsorships: project-scoped
CREATE POLICY "Users can view sponsorships in their projects"
ON public.challenge_sponsorships
FOR SELECT
USING (
  status = 'active' AND (
    project_id IS NULL OR
    public.is_project_member(auth.uid(), project_id)
  )
);

-- Sustainability activities: project-scoped
CREATE POLICY "Users can view activities in their projects"
ON public.sustainability_activities
FOR SELECT
USING (
  auth.uid() = user_id OR
  (project_id IS NOT NULL AND public.is_project_admin(auth.uid(), project_id))
);

-- Organizations: project-scoped
CREATE POLICY "Users can view organizations in their projects"
ON public.organizations
FOR SELECT
USING (
  is_public = true OR
  (project_id IS NOT NULL AND public.is_project_member(auth.uid(), project_id))
);

-- 9. Create initial project: Káli medence közösségépítés
INSERT INTO public.projects (name, slug, region_name, villages, description, is_active)
VALUES (
  'Káli medence közösségépítés',
  'kali-medence',
  'Káli medence',
  ARRAY['Kővágóörs', 'Mindszentkálla', 'Kékkút', 'Szentbékkálla'],
  'Fenntartható közösségépítési program a Káli medence négy falujában',
  true
);

-- 10. Trigger for updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();