-- Add language support to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'de', 'hu', 'cs', 'sk', 'hr', 'ro', 'pl'));