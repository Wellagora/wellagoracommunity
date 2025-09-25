-- First, let's improve the existing profiles table for the stakeholder model
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS public_display_name TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS sustainability_goals TEXT[],
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create enum for clearer role management
CREATE TYPE public.user_role AS ENUM ('citizen', 'business', 'government', 'ngo');

-- Add new role column with enum type and migrate existing data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role public.user_role;

-- Update existing profiles to have a default role if they don't have one
UPDATE public.profiles SET user_role = 'citizen'::public.user_role WHERE user_role IS NULL;

-- Make user_role required
ALTER TABLE public.profiles ALTER COLUMN user_role SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN user_role SET DEFAULT 'citizen'::public.user_role;

-- Create organizations table for business/government/ngo entities
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.user_role NOT NULL CHECK (type IN ('business', 'government', 'ngo')),
  industry TEXT,
  website_url TEXT,
  description TEXT,
  logo_url TEXT,
  employee_count INTEGER,
  location TEXT,
  sustainability_score DECIMAL(5,2) DEFAULT 0,
  co2_reduction_total DECIMAL(10,2) DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Create sustainability activities table
CREATE TABLE IF NOT EXISTS public.sustainability_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'energy', 'transport', 'waste', 'food', 'water', 'home'
  impact_amount DECIMAL(10,2) NOT NULL, -- CO2 saved in kg
  points_earned INTEGER DEFAULT 0,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activities
ALTER TABLE public.sustainability_activities ENABLE ROW LEVEL SECURITY;

-- Update the handle_new_user function to support the new structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  insert into public.profiles (id, first_name, last_name, email, user_role, organization)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    COALESCE((new.raw_user_meta_data->>'user_role')::public.user_role, 'citizen'::public.user_role),
    new.raw_user_meta_data->>'organization'
  );
  return new;
end;
$$;

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT user_role FROM public.profiles WHERE id = auth.uid();
$$;

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- New RLS policies for stakeholder model
CREATE POLICY "Users can view public profiles" 
ON public.profiles FOR SELECT 
USING (is_public_profile = true OR auth.uid() = id);

CREATE POLICY "Users can view profiles in their organization" 
ON public.profiles FOR SELECT 
USING (
  organization_id IS NOT NULL AND 
  organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- RLS policies for organizations
CREATE POLICY "Public organizations are viewable by everyone" 
ON public.organizations FOR SELECT 
USING (is_public = true);

CREATE POLICY "Organization members can view their organization" 
ON public.organizations FOR SELECT 
USING (
  id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Business users can create organizations" 
ON public.organizations FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('business', 'government', 'ngo'));

CREATE POLICY "Organization members can update their organization" 
ON public.organizations FOR UPDATE 
USING (
  id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS policies for sustainability activities
CREATE POLICY "Users can view their own activities" 
ON public.sustainability_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view organization activities if public" 
ON public.sustainability_activities FOR SELECT 
USING (
  organization_id IS NOT NULL AND 
  organization_id IN (SELECT id FROM public.organizations WHERE is_public = true)
);

CREATE POLICY "Users can insert their own activities" 
ON public.sustainability_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.sustainability_activities FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.sustainability_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON public.sustainability_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON public.sustainability_activities(date);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);

-- Create a trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();