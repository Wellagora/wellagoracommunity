-- Add organization_id to challenge_completions for tracking company employee participation
ALTER TABLE public.challenge_completions 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX idx_challenge_completions_organization_id 
ON public.challenge_completions(organization_id);

-- Create index for efficient company-challenge queries
CREATE INDEX idx_challenge_completions_org_challenge 
ON public.challenge_completions(organization_id, challenge_id);

-- Update RLS policy to allow organization members to view their org's completions
CREATE POLICY "Organization members can view their org completions"
ON public.challenge_completions
FOR SELECT
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

COMMENT ON COLUMN public.challenge_completions.organization_id IS 'Links completion to organization for company participation tracking';