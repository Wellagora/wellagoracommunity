-- Fix search_path for function to address security linter warning
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_conversations
  SET 
    last_message_at = NEW.timestamp,
    message_count = message_count + 1
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;