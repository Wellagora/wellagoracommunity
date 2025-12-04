-- Allow anyone to view active subscription plans (pricing should be public)
CREATE POLICY "Anyone can view active subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);