-- Add policy for experts to update vouchers for their own programs
-- Drop existing policy if it has wrong permissions and recreate
DROP POLICY IF EXISTS "Experts can update vouchers for their content" ON public.vouchers;

CREATE POLICY "Experts can redeem vouchers for their content" 
ON public.vouchers 
FOR UPDATE 
USING (
  content_id IN (
    SELECT id FROM public.expert_contents 
    WHERE creator_id = auth.uid()
  )
)
WITH CHECK (
  content_id IN (
    SELECT id FROM public.expert_contents 
    WHERE creator_id = auth.uid()
  )
  AND status IN ('active', 'used')
);