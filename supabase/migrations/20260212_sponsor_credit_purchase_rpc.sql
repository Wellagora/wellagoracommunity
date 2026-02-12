-- Atomic sponsor credit purchase RPC
-- Wraps credit_transactions INSERT + sponsor_credits UPSERT in a single transaction
CREATE OR REPLACE FUNCTION public.purchase_sponsor_credits(
  p_sponsor_user_id UUID,
  p_total_credits INTEGER,
  p_package_type TEXT,
  p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx_id UUID;
  v_credits_row RECORD;
BEGIN
  -- 1. Insert credit transaction
  INSERT INTO credit_transactions (sponsor_user_id, credits, transaction_type, description)
  VALUES (p_sponsor_user_id, p_total_credits, 'purchase', p_description)
  RETURNING id INTO v_tx_id;

  -- 2. Upsert sponsor_credits
  SELECT * INTO v_credits_row
  FROM sponsor_credits
  WHERE sponsor_user_id = p_sponsor_user_id;

  IF v_credits_row IS NOT NULL THEN
    UPDATE sponsor_credits
    SET total_credits = v_credits_row.total_credits + p_total_credits,
        available_credits = v_credits_row.available_credits + p_total_credits,
        package_type = p_package_type,
        updated_at = NOW()
    WHERE sponsor_user_id = p_sponsor_user_id;
  ELSE
    INSERT INTO sponsor_credits (sponsor_user_id, total_credits, available_credits, used_credits, package_type)
    VALUES (p_sponsor_user_id, p_total_credits, p_total_credits, 0, p_package_type);
  END IF;

  -- 3. Record package history (best-effort, don't fail if table doesn't exist)
  BEGIN
    INSERT INTO credit_package_history (sponsor_user_id, package_type, initial_credits, remaining_credits, action)
    VALUES (p_sponsor_user_id, p_package_type, p_total_credits, p_total_credits, 'purchase');
  EXCEPTION WHEN undefined_table THEN
    -- credit_package_history table may not exist yet
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'total_credits', p_total_credits
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.purchase_sponsor_credits TO authenticated;
