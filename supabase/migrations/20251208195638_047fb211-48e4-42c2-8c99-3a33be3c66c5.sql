-- Create organization_invites table for invite code system
CREATE TABLE public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- Org members can view their organization's invites
CREATE POLICY "Org members can view their invites"
ON public.organization_invites
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Org members can create invites
CREATE POLICY "Org members can create invites"
ON public.organization_invites
FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
) AND created_by = auth.uid());

-- Org members can update their invites
CREATE POLICY "Org members can update invites"
ON public.organization_invites
FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE id = auth.uid()
));

-- Anyone can view active invites by code (for join page)
CREATE POLICY "Anyone can view active invites by code"
ON public.organization_invites
FOR SELECT
USING (is_active = true);

-- Create index for fast invite code lookup
CREATE INDEX idx_organization_invites_code ON public.organization_invites(invite_code);