const axios = require('axios');
const { query } = require('../db');
const { publishToInstagram } = require('../publisher/instagramPublisher');
const { generateCaption } = require('../ai/captionGenerator');
const { processVideo, generateRandomTransforms } = require('../processing/videoProcessor');
const { checkDuplicate } = require('../utils/duplicateDetector');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const IG_GRAPH_API = 'https://graph.facebook.com/v25.0';

/**
 * ─────────────────────────────────────────────────────────────
 * HOW THIS WORKS:
 *
 * When an allowed user (@jenis_barad) sends/shares a reel to your 
 * Instagram account or Tags you in a reel, we detect it via:
 *
 * 1. TAGS API  → GET /{ig-user-id}/tags
 *    Checks when allowed users TAG your page in their reels.
 *    Works without App Review — standard access.
 *
 * 2. MENTIONED MEDIA → GET /{ig-user-id}/mentioned_media
 *    Checks when your account is @mentioned in a caption.
 *    Works without App Review — standard access.
 *
 * NOTE: Direct Message (DM) reading requires Meta Advanced Access
 * which needs formal App Review. We use Tags + Mentions instead,
 * which achieve the same goal and work immediately.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Check for Reels WHERE allowed users have tagged the page.
 * Uses GET /{ig-user-id}/tags
 */
async function checkTaggedMedia(account) {
    const { id: account_id, instagram_user_id, access_token, allowed_submitters, page_name } = account;
    if (!access_token || !instagram_user_id) return;

    const submitters = Array.isArray(allowed_submitters) ? allowed_submitters : [];
    if (submitters.length === 0) return;

    console.log(`📩 [Submission Worker] Checking tags for ${page_name} (allowed: ${submitters.join(', ')})`);

    let taggedMedia = [];
    try {
        const resp = await axios.get(`${IG_GRAPH_API}/${instagram_user_id}/tags`, {
            params: {
                access_token,
                fields: 'id,media_type,media_url,permalink,username,timestamp,like_count,comments_count',
            },
            timeout: 15000,
        });
        taggedMedia = resp.data?.data || [];
    } catch (err) {
        const apiError = err.response?.data?.error?.message || err.message;
        console.warn(`[Submission Worker] Tags API error for ${page_name}: ${apiError}`);
        return;
    }

    for (const media of taggedMedia) {
        // Only process Reels/Videos
        if (media.media_type !== 'VIDEO') continue;
        const mediaUrl = media.media_url;
        const permalink = media.permalink;
        const senderUsername = media.username?.toLowerCase();

        // Check this media comes from an allowed submitter
        if (!senderUsername || !submitters.map(s => s.toLowerCase()).includes(senderUsername)) continue;

        // Enhanced duplicate check
        const dupeCheck = await checkDuplicate({ url: permalink, accountId: account_id });
        if (dupeCheck.isDuplicate) {
            console.log(`[Submission Worker] Skipping duplicate tagged reel from @${senderUsername} (match: ${dupeCheck.matchType})`);
            continue;
        }

        console.log(`✅ [Submission Worker] Found tagged Reel from @${senderUsername} → processing for ${page_name}`);

        try {
            await processAndPublishReel({ account, mediaUrl, sourceUrl: permalink, senderUsername });
        } catch (err) {
            console.error(`[Submission Worker] Error processing tagged reel from @${senderUsername}:`, err.message);
        }
    }
}

/**
 * Check for Reels WHERE your page is MENTIONED in the caption.
 * Uses GET /{ig-user-id}/mentioned_media
 */
async function checkMentionedMedia(account) {
    const { id: account_id, instagram_user_id, access_token, allowed_submitters, page_name } = account;
    if (!access_token || !instagram_user_id) return;

    const submitters = Array.isArray(allowed_submitters) ? allowed_submitters : [];
    if (submitters.length === 0) return;

    let mentionedMedia = [];
    try {
        const resp = await axios.get(`${IG_GRAPH_API}/${instagram_user_id}/mentioned_media`, {
            params: {
                access_token,
                fields: 'media_type,media_url,permalink,username,timestamp',
            },
            timeout: 15000,
        });
        mentionedMedia = resp.data?.data || [];
    } catch (err) {
        const apiError = err.response?.data?.error?.message || err.message;
        console.warn(`[Submission Worker] Mentioned Media API error for ${page_name}: ${apiError}`);
        return;
    }

    for (const media of mentionedMedia) {
        if (media.media_type !== 'VIDEO') continue;
        const senderUsername = media.username?.toLowerCase();

        if (!senderUsername || !submitters.map(s => s.toLowerCase()).includes(senderUsername)) continue;

        // Enhanced duplicate check
        const dupeCheck = await checkDuplicate({ url: media.permalink, accountId: account_id });
        if (dupeCheck.isDuplicate) {
            console.log(`[Submission Worker] Skipping duplicate mentioned reel (match: ${dupeCheck.matchType})`);
            continue;
        }

        console.log(`✅ [Submission Worker] Found mentioned Reel from @${senderUsername} → processing for ${page_name}`);
        try {
            await processAndPublishReel({ account, mediaUrl: media.media_url, sourceUrl: media.permalink, senderUsername });
        } catch (err) {
            console.error(`[Submission Worker] Error processing mentioned reel:`, err.message);
        }
    }
}

/**
 * Download, transform, generate caption, and publish a discovered reel immediately.
 */
async function processAndPublishReel({ account, mediaUrl, sourceUrl, senderUsername }) {
    const { id: account_id, instagram_user_id, access_token, category, page_name, username, watermark_text } = account;

    console.log(`\n⚡ [Submission Worker] Processing reel from @${senderUsername} for @${page_name}`);

    const outputId = uuidv4();
    const MEDIA_BASE = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
    const rawPath = path.join(MEDIA_BASE, 'raw', `${outputId}.mp4`);

    // Step 1: Download the reel
    console.log(`📥 [Submission Worker] Downloading reel...`);
    const { getYtDlpPath } = require('../utils/ytDlpPath');
    const { execFile } = require('child_process');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    try {
        const ytDlpPath = getYtDlpPath();
        await execFileAsync(ytDlpPath, [
            mediaUrl || sourceUrl,
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--postprocessor-args', 'ffmpeg:-c:v libx264 -c:a aac -movflags +faststart',
            '-o', rawPath,
            '--no-playlist',
            '--socket-timeout', '30',
            '--retries', '3',
        ], { timeout: 120000 });
    } catch (downloadErr) {
        console.warn(`[Submission Worker] Download failed for ${sourceUrl}:`, downloadErr.message);
        throw new Error(`Failed to download reel: ${downloadErr.message}`);
    }

    if (!fs.existsSync(rawPath)) {
        throw new Error('Download completed but no file found');
    }
    console.log(`✅ [Submission Worker] Downloaded: ${rawPath}`);

    // Step 2: Transform video with copyright avoidance
    console.log(`🎬 [Submission Worker] Applying transformations...`);
    const watermark = watermark_text || `@${username}`;
    const transforms = generateRandomTransforms();
    const processed = await processVideo(rawPath, outputId, watermark, { transforms });
    console.log(`✅ [Submission Worker] Processed: ${processed.outputPath}`);

    // Clean up raw file
    try {
        fs.unlinkSync(rawPath);
    } catch (e) {
        console.warn(`⚠️  Failed to cleanup raw file: ${e.message}`);
    }

    // Step 3: Generate AI caption
    console.log(`🤖 [Submission Worker] Generating caption...`);
    let caption = `🎬 Amazing reel shared by @${senderUsername}! Check this out 🔥\n\nFollow @${username} for more!`;
    let hashtags = `#reels #viral #trending #${category} #instagram`;
    try {
        const captionData = await generateCaption({
            category,
            source: 'instagram',
            title: `Viral reel submission by @${senderUsername}`,
            username,
        });
        caption = captionData.caption || caption;
        hashtags = captionData.hashtags || hashtags;
    } catch {
        console.warn('[Submission Worker] Caption generation fell back to default.');
    }

    // Step 4: Publish to Instagram
    console.log(`📤 [Submission Worker] Publishing to Instagram...`);
    const publicBaseUrl = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const publicUrl = `${publicBaseUrl}/media/processed/${path.basename(processed.outputPath)}`;

    const result = await publishToInstagram({
        access_token,
        instagram_user_id,
        media_url: publicUrl,
        caption: `${caption}\n\n${hashtags}`,
    });

    // Step 5: Log to DB as published
    await query(
        `INSERT INTO posts
         (account_id, category, media_url, raw_media_url, caption, hashtags, source, source_url, status, instagram_media_id, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'instagram_submission', $7, 'published', $8, NOW())`,
        [account_id, category, publicUrl, sourceUrl, caption, hashtags, sourceUrl, result.instagram_post_id]
    );

    console.log(`🎉 [Submission Worker] Auto-published reel from @${senderUsername}!`);
    console.log(`   Post ID: ${result.instagram_post_id}`);
    console.log(`   Permalink: ${result.permalink || 'Pending'}`);
}

/**
 * Run submission checks (Tags + Mentions) for ALL active accounts.
 */
async function runAllDMChecks() {
    console.log('📩 [Submission Worker] Starting check cycle (Tags + Mentions)...');
    try {
        const result = await query(
            `SELECT * FROM instagram_accounts
             WHERE is_active = TRUE
             AND allowed_submitters IS NOT NULL
             AND jsonb_array_length(allowed_submitters) > 0`
        );

        if (result.rows.length === 0) {
            console.log('[Submission Worker] No accounts with allowed submitters configured.');
            return;
        }

        for (const account of result.rows) {
            try {
                await checkTaggedMedia(account);
                await checkMentionedMedia(account);
            } catch (err) {
                console.error(`[Submission Worker] Error for account ${account.page_name}:`, err.message);
            }
        }
    } catch (err) {
        console.error('[Submission Worker] Failed to fetch accounts:', err.message);
    }
}

module.exports = { runAllDMChecks, checkTaggedMedia, checkMentionedMedia };
