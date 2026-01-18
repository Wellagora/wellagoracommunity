-- Assign the verified expert Hanna Weber to all programs without a creator
UPDATE public.expert_contents 
SET creator_id = 'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
    updated_at = now()
WHERE creator_id IS NULL;