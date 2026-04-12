-- Add allowed_submitters as a JSONB array to instagram_accounts
-- If the column exists, this will do nothing (idempotent for easy reruns)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'instagram_accounts'
        AND column_name = 'allowed_submitters'
    ) THEN
        ALTER TABLE instagram_accounts
        ADD COLUMN allowed_submitters JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
