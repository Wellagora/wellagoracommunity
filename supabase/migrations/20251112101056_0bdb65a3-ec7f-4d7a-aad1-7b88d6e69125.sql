-- Add INSERT policy for edge functions to store messages
-- This allows the service role (used by edge functions) to insert messages
CREATE POLICY "Service role can insert messages"
ON public.messages
FOR INSERT
TO service_role
WITH CHECK (true);