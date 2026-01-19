-- Add problem_solution metadata field for AI-readability and SEO indexing
ALTER TABLE public.expert_contents
ADD COLUMN IF NOT EXISTS problem_solution JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.expert_contents.problem_solution IS 
  'Structured field for AI indexing: {"problem": "What issue does this solve?", "solution": "How does this program address it?"}';

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_expert_contents_problem_solution 
ON public.expert_contents USING GIN (problem_solution);