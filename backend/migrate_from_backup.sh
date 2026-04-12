#!/bin/bash
# Migration script to import backup data to Railway database

# The backup data to import
cat > /tmp/backup_data.sql << 'EOF'
--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: instagram_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.instagram_accounts (id, page_name, username, slug, category, instagram_user_id, access_token, app_id, app_secret, posting_mode, auto_viral_threshold, watermark_text, is_active, created_at, updated_at, allowed_submitters) FROM stdin;
1	Nature Page	naturepage	nature-page	nature					manual	0.7000	@naturepage	t	2026-03-11 11:31:20.065881+05:30	2026-03-11 11:31:20.065881+05:30	[]
2	cricketpulse1111	cricketpulse1111	cricketpulse1111	cricket	17841442673804407	EAASrCSjE6GEBQ4jdQsgd2B76JOTj8o8ZClhB6rQcD7muXyh1fidjgh518hYKLTQAkJV3WvLoIhZBZBexSAMKV2HEORiPBQKyHvJ09bfmZADBlUuEkqgALHtLZBZChqR2DWZBjo4bW8mFM6IOyZA4frofsWKAYUgp2J9RsUBEuH0SQ06NBgMBxsKvXhZBZCZAvQA9Iz5	947831814486600	feaa0fbd8ad725889bf558675c8733aa	manual	0.7000	@cricketpulse1111	t	2026-03-11 12:30:51.027884+05:30	2026-04-12 03:34:08.589333+05:30	\N
\.
EOF

# Import the data
echo "Importing data to Railway database..."
PGPASSWORD=${PGPASSWORD:-fkLbQoOgdCFMllvLdpFECsXfdXDpQjoq} psql -h postgres.railway.internal -U postgres -d railway < /tmp/backup_data.sql

echo "✅ Import completed!"
