-- Add event scheduling and location fields to challenge_definitions
ALTER TABLE public.challenge_definitions
ADD COLUMN start_date timestamp with time zone,
ADD COLUMN end_date timestamp with time zone,
ADD COLUMN location text,
ADD COLUMN is_continuous boolean DEFAULT true;

-- Add comment to explain the fields
COMMENT ON COLUMN public.challenge_definitions.start_date IS 'Start date and time for concrete events (null for continuous programs)';
COMMENT ON COLUMN public.challenge_definitions.end_date IS 'End date and time for concrete events (null for continuous programs)';
COMMENT ON COLUMN public.challenge_definitions.location IS 'Physical location for concrete events';
COMMENT ON COLUMN public.challenge_definitions.is_continuous IS 'True for continuous programs, false for time-bound events';

-- Add index for querying active events
CREATE INDEX idx_challenge_definitions_dates ON public.challenge_definitions(start_date, end_date) WHERE is_continuous = false;