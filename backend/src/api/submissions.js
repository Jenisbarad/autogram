const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { publishToInstagram } = require('../publisher/instagramPublisher');
const { generateCaption } = require('../ai/captionGenerator');
const { processVideo, generateRandomTransforms } = require('../processing/videoProcessor');
const { checkDuplicate } = require('../utils/duplicateDetector');
const { getYtDlpCommand, execYtDlp } = require('../utils/ytDlpPath');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const IG_GRAPH_API = 'https://graph.facebook.com/v25.0';

/**
 * POST /submissions/submit
 * Used to manually submit a reel from an allowed user.
 * Body: { account_id, submitter_username, reel_url }
 * 
 * Also works as a webhook target for external services.
 */
router.post('/submit', async (req, res) => {
    const { account_id, submitter_username, reel_url } = req.body;

    if (!account_id || !submitter_username || !reel_url) {
        return res.status(400).json({ error: 'account_id, submitter_username, and reel_url are required' });
    }

    // Get account
    const accountResult = await query('SELECT * FROM instagram_accounts WHERE id = $1 AND is_active = TRUE', [account_id]);
    if (!accountResult.rows.length) return res.status(404).json({ error: 'Account not found' });
    const account = accountResult.rows[0];

    // Verify submitter is allowed
    const submitters = Array.isArray(account.allowed_submitters) ? account.allowed_submitters : [];
    const usernameClean = submitter_username.toLowerCase().replace('@', '');
    if (!submitters.map(s => s.toLowerCase()).includes(usernameClean)) {
        return res.status(403).json({ error: `@${submitter_username} is not an allowed submitter for this account` });
    }

    // Enhanced duplicate check
    const dupeCheck = await checkDuplicate({ url: reel_url, accountId: account_id });
    if (dupeCheck.isDuplicate) {
        return res.status(409).json({
            error: 'Already submitted',
            message: `This reel was already submitted (match: ${dupeCheck.matchType}, Post ID: ${dupeCheck.existingPost.id})`
        });
    }

    // Start processing in background
    res.json({ success: true, message: `✅ Reel from @${submitter_username} accepted. It will be auto-published to ${account.page_name} shortly.` });

    // Process asynchronously
    processAndPublish({ account, reel_url, submitter_username: usernameClean }).catch(err => {
        console.error(`[Submissions] Failed to process reel from @${usernameClean}:`, err.message);
    });
});

/**
 * GET /submissions/status/:account_id
 * Shows recent auto-published submissions for an account.
 */
router.get('/status/:account_id', async (req, res) => {
    const posts = await query(
        "SELECT id, caption, source_url, status, created_at FROM posts WHERE account_id = $1 AND source LIKE 'instagram%' ORDER BY created_at DESC LIMIT 10",
        [req.params.account_id]
    );
    res.json({ posts: posts.rows });
});

/**
 * GET /submissions/accounts
 * Returns all accounts and their allowed submitters (for frontend display)
 */
router.get('/accounts', async (req, res) => {
    const accounts = await query(
        "SELECT id, page_name, username, category, allowed_submitters FROM instagram_accounts WHERE is_active = TRUE"
    );
    res.json({ accounts: accounts.rows });
});

async function processAndPublish({ account, reel_url, submitter_username }) {
    const { id: account_id, instagram_user_id, access_token, category, page_name, username, watermark_text } = account;

    console.log(`[Submissions] Processing reel from @${submitter_username} for ${page_name}: ${reel_url}`);

    const outputId = uuidv4();
    const MEDIA_BASE = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
    const rawPath = path.join(MEDIA_BASE, 'raw', `${outputId}.mp4`);

    // Step 1: Download the reel
    console.log(`[Submissions] Downloading reel...`);
    try {
        const ytDlp = getYtDlpCommand();
        console.log(`[Submissions] Using yt-dlp: ${ytDlp.display}`);
        await execYtDlp([
            reel_url,
            '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--merge-output-format', 'mp4',
            '--postprocessor-args', 'ffmpeg:-c:v libx264 -c:a aac -movflags +faststart',
            '-o', rawPath,
            '--no-playlist',
            '--socket-timeout', '30',
            '--retries', '3',
        ], { timeout: 120000 });
    } catch (err) {
        console.warn(`[Submissions] Download failed for ${reel_url}:`, err.message);
        throw new Error(`Failed to download reel: ${err.message}`);
    }

    if (!fs.existsSync(rawPath)) {
        throw new Error('Download completed but no file found');
    }
    console.log(`[Submissions] Downloaded: ${rawPath}`);

    // Step 2: Transform video with copyright avoidance
    console.log(`[Submissions] Applying transformations...`);
    const watermark = watermark_text || `@${username}`;
    const transforms = generateRandomTransforms();
    const processed = await processVideo(rawPath, outputId, watermark, { transforms });
    console.log(`[Submissions] Processed: ${processed.outputPath}`);

    // Clean up raw file
    try {
        fs.unlinkSync(rawPath);
    } catch (e) {
        console.warn(`⚠️  Failed to cleanup raw file: ${e.message}`);
    }

    // Step 3: Generate AI caption
    console.log(`[Submissions] Generating caption...`);
    let caption = `🎬 Amazing reel submitted by @${submitter_username}! 🔥\n\nFollow @${username} for more!`;
    let hashtags = `#reels #viral #trending #${category} #instagram`;
    try {
        const captionData = await generateCaption({ category, source: 'instagram', title: `Reel by @${submitter_username}`, username });
        caption = captionData.caption || caption;
        hashtags = captionData.hashtags || hashtags;
    } catch {
        console.warn('[Submissions] Caption generation fallback used.');
    }

    // Step 4: Publish to Instagram
    console.log(`[Submissions] Publishing to Instagram...`);
    const publicBase = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
    const publicUrl = `${publicBase}/media/processed/${outputId}_processed.mp4`;

    const result = await publishToInstagram({
        access_token,
        instagram_user_id,
        media_url: publicUrl,
        caption: `${caption}\n\n${hashtags}`,
    });

    // Step 5: Save to DB
    await query(
        `INSERT INTO posts (account_id, category, media_url, raw_media_url, caption, hashtags, source, source_url, status, instagram_media_id, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'instagram_submission', $7, 'published', $8, NOW())`,
        [account_id, category, publicUrl, reel_url, caption, hashtags, reel_url, result.instagram_post_id]
    );

    console.log(`🎉 [Submissions] Auto-published reel from @${submitter_username} to ${page_name}! Post ID: ${result.instagram_post_id}`);
}

module.exports = router;
