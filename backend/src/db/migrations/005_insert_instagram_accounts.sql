-- Insert Instagram accounts (retry with correct data types)
-- This fixes the failed 004 migration

-- Insert or update the accounts
INSERT INTO instagram_accounts (id, page_name, username, slug, category, instagram_user_id, access_token, app_id, app_secret, posting_mode, auto_viral_threshold, watermark_text, is_active, created_at, updated_at, allowed_submitters)
VALUES
    (1, 'Nature Page', 'naturepage', 'nature-page', 'nature', NULL, NULL, NULL, NULL, 'manual', 0.7000, '@naturepage', true, '2026-03-11 11:31:20.065881+05:30', '2026-03-11 11:31:20.065881+05:30', NULL),
    (2, 'cricketpulse1111', 'cricketpulse1111', 'cricketpulse1111', 'cricket', '17841442673804407', 'EAASrCSjE6GEBQ4jdQsgd2B76JOTj8o8ZClhB6rQcD7muXyh1fidjgh518hYKLTQAkJV3WvLoIhZBZBexSAMKV2HEORiPBQKyHvJ09bfmZADBlUuEkqgALHtLZBZChqR2DWZBjo4bW8mFM6IOyZA4frofsWKAYUgp2J9RsUBEuH0SQ06NBgMBxsKvXhZBZCZAvQA9Iz5', '947831814486600', 'feaa0fbd8ad725889bf558675c8733aa', 'manual', 0.7000, '@cricketpulse1111', true, '2026-03-11 12:30:51.027884+05:30', '2026-04-12 03:34:08.589333+05:30', NULL)
ON CONFLICT (id) DO UPDATE SET
    access_token = EXCLUDED.access_token,
    updated_at = EXCLUDED.updated_at;
