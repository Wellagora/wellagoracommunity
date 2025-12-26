-- Function to process referral rewards when invitee completes their FIRST challenge
CREATE OR REPLACE FUNCTION process_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  ref_record RECORD;
  invitee_completion_count INTEGER;
  reward_amount INTEGER := 100;
BEGIN
  -- Only process approved completions
  IF NEW.validation_status = 'approved' THEN
    
    -- Check if this is the user's FIRST approved completion
    SELECT COUNT(*) INTO invitee_completion_count
    FROM challenge_completions
    WHERE user_id = NEW.user_id
      AND validation_status = 'approved'
      AND id != NEW.id;
    
    -- Only proceed if this is their first completion
    IF invitee_completion_count = 0 THEN
      
      -- Find pending/joined referral for this user
      SELECT * INTO ref_record 
      FROM referrals 
      WHERE invitee_id = NEW.user_id 
        AND status IN ('pending', 'joined')
        AND (reward_claimed IS NULL OR reward_claimed = false)
      LIMIT 1;
      
      IF FOUND THEN
        -- Update referral status to rewarded
        UPDATE referrals 
        SET status = 'rewarded',
            completed_at = NOW(),
            reward_claimed = true,
            reward_points = reward_amount
        WHERE id = ref_record.id;
        
        -- Create notification for referrer
        INSERT INTO notifications (user_id, type, title, message, metadata)
        VALUES (
          ref_record.referrer_id,
          'referral_reward',
          'Referral jutalom!',
          'A barátod teljesítette az első kihívását! ' || reward_amount || ' pontot kaptál.',
          jsonb_build_object(
            'points', reward_amount, 
            'invitee_id', NEW.user_id,
            'challenge_id', NEW.challenge_id
          )
        );
        
        -- Add points as sustainability activity for referrer
        INSERT INTO sustainability_activities (
          user_id,
          activity_type,
          impact_amount,
          points_earned,
          description
        ) VALUES (
          ref_record.referrer_id,
          'referral_bonus',
          5.0,
          reward_amount,
          'Referral jutalom - barát első kihívása teljesítve'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for challenge completion referral rewards
DROP TRIGGER IF EXISTS on_challenge_completion_referral ON challenge_completions;
CREATE TRIGGER on_challenge_completion_referral
  AFTER INSERT OR UPDATE ON challenge_completions
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_reward();

-- Function to link referral when user signs up with matching email
CREATE OR REPLACE FUNCTION link_referral_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Link pending referral by email to the new user
  UPDATE referrals
  SET invitee_id = NEW.id,
      status = 'joined',
      joined_at = NOW()
  WHERE LOWER(invitee_email) = LOWER(NEW.email)
    AND status = 'pending'
    AND invitee_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile creation
DROP TRIGGER IF EXISTS on_profile_created_link_referral ON profiles;
CREATE TRIGGER on_profile_created_link_referral
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_referral_on_signup();