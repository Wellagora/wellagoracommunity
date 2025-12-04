-- Delete all plans that are NOT the 8 tier-based plans
DELETE FROM subscription_plans 
WHERE plan_key NOT IN (
  'bronze_monthly', 'bronze_yearly', 
  'silver_monthly', 'silver_yearly', 
  'gold_monthly', 'gold_yearly', 
  'diamond_monthly', 'diamond_yearly'
);

-- Update display_order to ensure correct ordering
UPDATE subscription_plans SET display_order = 1 WHERE plan_key = 'bronze_monthly';
UPDATE subscription_plans SET display_order = 2 WHERE plan_key = 'bronze_yearly';
UPDATE subscription_plans SET display_order = 3 WHERE plan_key = 'silver_monthly';
UPDATE subscription_plans SET display_order = 4 WHERE plan_key = 'silver_yearly';
UPDATE subscription_plans SET display_order = 5 WHERE plan_key = 'gold_monthly';
UPDATE subscription_plans SET display_order = 6 WHERE plan_key = 'gold_yearly';
UPDATE subscription_plans SET display_order = 7 WHERE plan_key = 'diamond_monthly';
UPDATE subscription_plans SET display_order = 8 WHERE plan_key = 'diamond_yearly';