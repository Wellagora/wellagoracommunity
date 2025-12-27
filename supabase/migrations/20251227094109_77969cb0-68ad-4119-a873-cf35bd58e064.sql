-- Add 'creator' value to user_role enum
-- Note: This needs to be run outside a transaction in some PostgreSQL versions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'creator' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'creator';
    END IF;
END $$;