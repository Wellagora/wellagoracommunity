-- Seed Sponsor Support Rule for Testing
-- This creates an active sponsor support rule for the HUF test program
-- Run this AFTER running seed_test_programs.sql

DO $$
DECLARE
  test_sponsor_id UUID;
  test_program_id UUID;
  support_rule_id UUID;
BEGIN
  -- Get or create a sponsor user
  SELECT id INTO test_sponsor_id 
  FROM profiles 
  WHERE user_role IN ('business', 'sponsor', 'government', 'ngo') 
  LIMIT 1;
  
  -- If no sponsor exists, create a test one
  IF test_sponsor_id IS NULL THEN
    INSERT INTO profiles (id, first_name, last_name, user_role, email)
    VALUES (
      gen_random_uuid(),
      'Test',
      'Sponsor',
      'business',
      'test.sponsor@example.com'
    )
    RETURNING id INTO test_sponsor_id;
  END IF;

  -- Get the HUF program (most recent published program with HUF currency)
  SELECT id INTO test_program_id
  FROM expert_contents
  WHERE currency = 'HUF' 
    AND is_published = true
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no HUF program found, error
  IF test_program_id IS NULL THEN
    RAISE EXCEPTION 'No HUF program found. Run seed_test_programs.sql first.';
  END IF;

  -- Generate UUID for support rule
  support_rule_id := gen_random_uuid();

  -- Create active support rule
  -- Support: 5,000 Ft per participant (50% of 10,000 Ft program)
  -- Budget: 50,000 Ft total (enough for 10 participants)
  INSERT INTO sponsor_support_rules (
    id,
    sponsor_id,
    scope_type,
    scope_id,
    amount_per_participant,
    currency,
    budget_total,
    budget_spent,
    max_participants,
    status,
    start_at,
    end_at,
    created_at,
    updated_at
  ) VALUES (
    support_rule_id,
    test_sponsor_id,
    'program',
    test_program_id,
    5000,
    'HUF',
    50000,
    0,
    10,
    'active',
    NOW(),
    NOW() + INTERVAL '30 days',
    NOW(),
    NOW()
  );

  -- Output the IDs for reference
  RAISE NOTICE 'Created Sponsor Support Rule ID: %', support_rule_id;
  RAISE NOTICE 'Sponsor ID: %', test_sponsor_id;
  RAISE NOTICE 'Program ID: %', test_program_id;
  RAISE NOTICE 'Support: 5,000 Ft per participant';
  RAISE NOTICE 'Budget: 50,000 Ft total';
  
END $$;

-- Verify the support rule was created
SELECT 
  ssr.id,
  ssr.scope_type,
  ssr.amount_per_participant,
  ssr.currency,
  ssr.budget_total,
  ssr.budget_spent,
  ssr.status,
  ec.title as program_title,
  p.first_name || ' ' || p.last_name as sponsor_name
FROM sponsor_support_rules ssr
JOIN expert_contents ec ON ssr.scope_id = ec.id
JOIN profiles p ON ssr.sponsor_id = p.id
WHERE ssr.status = 'active'
ORDER BY ssr.created_at DESC
LIMIT 5;
