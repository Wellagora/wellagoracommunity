-- Add UPDATE policy for transactions table
-- This allows buyers to update their own transactions (e.g., from pending to completed)

CREATE POLICY "Buyers can update own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = buyer_id)
WITH CHECK (auth.uid() = buyer_id);
