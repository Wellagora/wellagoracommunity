-- Add content_type and max_capacity columns to expert_contents for the 3-tier content model
ALTER TABLE public.expert_contents 
ADD COLUMN IF NOT EXISTS content_type text DEFAULT 'in_person' CHECK (content_type IN ('recorded', 'online_live', 'in_person'));

ALTER TABLE public.expert_contents 
ADD COLUMN IF NOT EXISTS max_capacity integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.expert_contents.content_type IS 'Content delivery type: recorded (video), online_live (webinar), in_person (workshop)';
COMMENT ON COLUMN public.expert_contents.max_capacity IS 'Physical capacity limit for in_person events, NULL for unlimited';