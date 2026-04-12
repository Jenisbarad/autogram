/**
 * Quick Submission API
 *
 * Designed for external bots (WhatsApp, Telegram, etc.) to quickly submit reels.
 *
 * Usage:
 * POST /api/quick-submit
 * Body: { page_slug, reel_url, submitter_username }
 *
 * Example from WhatsApp bot:
 * User sends: "post @nature_page https://www.instagram.com/reel/xyz/"
 * Bot parses: page_slug="nature_page", reel_url="https://..."
 * Bot calls: POST /api/quick-submit with parsed data
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { processVideo } = require('../processing/videoProcessor');
const { generateCaption } = require('../ai/captionGenerator');
const { publishToInstagram } = require('../publisher/instagramPublisher');
const { checkDuplicate } = require('../utils/duplicateDetector');
const { getYtDlpCommand, execYtDlp } = require('../utils/ytDlpPath');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/quick-submit
 * Quick submission endpoint for external bots
 */
router.post('/', async (req, res) => {
    const { page_slug, reel_url, submitter_username } = req.body;

    // Validation
    if (!page_slug || !reel_url) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'page_slug and reel_url are required',
            example: { page_slug: 'nature_page', reel_url: 'https://www.instagram.com/reel/xyz/', submitter_username: 'your_instagram_username' }
        });
    }

    // Validate Instagram URL
    if (!isValidInstagramUrl(reel_url)) {
        return res.status(400).json({
            error: 'Invalid URL',
            message: 'Must be a valid Instagram reel URL'
        });
    }

    // Find account by slug
    const accountResult = await query(
        `SELECT * FROM instagram_accounts WHERE slug = $1 AND is_active = TRUE`,
        [page_slug]
    );

    if (!accountResult.rows.length) {
        return res.status(404).json({
            error: 'Account not found',
            message: `No active account found with slug: @${page_slug}`
        });
    }

    const account = accountResult.rows[0];

    // Check submitter permissions (if allowed_submitters is configured)
    if (account.allowed_submitters && account.allowed_submitters.length > 0) {
        const submitters = account.allowed_submitters.map(s => s.toLowerCase().replace('@', ''));
        const submitterClean = (submitter_username || 'bot').toLowerCase().replace('@', '');
        if (!submitters.includes(submitterClean)) {
            return res.status(403).json({
                error: 'Not authorized',
                message: `@${submitter_username} is not allowed to submit to @${page_slug}`
            });
        }
    }

    // Enhanced duplicate check
    const dupeCheck = await checkDuplicate({ url: reel_url, accountId: account.id });
    if (dupeCheck.isDuplicate) {
        return res.status(409).json({
            error: 'Already submitted',
            message: `This reel was already submitted (match: ${dupeCheck.matchType}, Post ID: ${dupeCheck.existingPost.id})`
        });
    }

    // Respond immediately - process in background
    res.json({
        success: true,
        message: `✅ Reel accepted for @${account.page_name}! Processing in background...`,
        page_name: account.page_name,
        category: account.category
    });

    // Process asynchronously
    processQuickSubmit({ account, reel_url, submitter_username }).catch(err => {
        console.error(`[QuickSubmit] Failed to process reel for ${page_slug}:`, err.message);
    });
});

/**
 * Validate if URL is from Instagram
 */
function isValidInstagramUrl(url) {
    return url &&
           (url.includes('instagram.com/reel') ||
            url.includes('instagram.com/reels') ||
            url.includes('instagram.com/p/')) &&
           url.startsWith('http');
}

/**
 * Process and publish the submitted reel
 */
async function processQuickSubmit({ account, reel_url, submitter_username }) {
    const {
        id: account_id,
        instagram_user_id,
        access_token,
        category,
        page_name,
        username,
        watermark_text
    } = account;

    console.log(`\n⚡ [QuickSubmit] Processing reel for @${page_name}`);
    console.log(`   URL: ${reel_url}`);
    console.log(`   Submitter: ${submitter_username || 'N/A'}`);

    const outputId = uuidv4();
    const MEDIA_BASE = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
    const rawPath = path.join(MEDIA_BASE, 'raw', `${outputId}.mp4`);
    const processedPath = path.join(MEDIA_BASE, 'processed', `${outputId}_processed.mp4`);

    try {
        // Step 1: Download reel
        console.log(`📥 [QuickSubmit] Downloading reel...`);
        const ytDlp = getYtDlpCommand();
        console.log(`📂 [QuickSubmit] Using yt-dlp: ${ytDlp.display}`);
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

        if (!fs.existsSync(rawPath)) {
            throw new Error('Download failed - no file created');
        }
        console.log(`✅ [QuickSubmit] Downloaded: ${rawPath}`);

        // Step 2: Transform video (crop, watermark, effects)
        console.log(`🎬 [QuickSubmit] Applying transformations...`);
        const watermark = watermark_text || `@${username}`;
        const processed = await processVideo(rawPath, outputId, watermark);
        console.log(`✅ [QuickSubmit] Processed: ${processed.outputPath}`);

        // Step 3: Generate AI caption
        console.log(`🤖 [QuickSubmit] Generating caption...`);
        let caption = `🎬 Amazing content! 🔥\n\nCredits: Original Creator\nFollow @${username} for more!`;
        let hashtags = `#reels #viral #trending #${category} #instagram #fyp`;
        try {
            const captionData = await generateCaption({
                category,
                topic: `Instagram reel shared by @${submitter_username || 'fan'}`,
                username,
            });
            caption = captionData.caption || caption;
            hashtags = captionData.hashtags || hashtags;
        } catch (err) {
            console.warn(`⚠️  [QuickSubmit] Caption generation failed, using fallback`);
        }

        // Step 4: Publish to Instagram
        console.log(`📤 [QuickSubmit] Publishing to Instagram...`);
        const BACKEND_URL = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
        const publicUrl = `${BACKEND_URL}/media/processed/${path.basename(processed.outputPath)}`;

        const result = await publishToInstagram({
            access_token,
            instagram_user_id,
            media_url: publicUrl,
            caption: `${caption}\n\n${hashtags}`,
        });

        // Step 5: Save to database
        await query(
            `INSERT INTO posts (
                account_id, category, media_url, raw_media_url, caption, hashtags,
                source, source_url, status, instagram_media_id, published_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
            [account_id, category, publicUrl, reel_url, caption, hashtags,
             'quick_submit', reel_url, 'published', result.instagram_post_id]
        );

        console.log(`🎉 [QuickSubmit] Successfully published!`);
        console.log(`   Post ID: ${result.instagram_post_id}`);
        console.log(`   Permalink: ${result.permalink || 'Pending'}`);

        // Clean up raw file
        try {
            if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
        } catch (e) {
            console.warn(`⚠️  Failed to cleanup raw file: ${e.message}`);
        }

    } catch (err) {
        console.error(`❌ [QuickSubmit] Processing failed:`, err.message);

        // Clean up files on error
        try {
            if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
            if (fs.existsSync(processedPath)) fs.unlinkSync(processedPath);
        } catch (e) {}

        // Log failure to database
        await query(
            `INSERT INTO job_logs (job_name, account_id, status, message)
             VALUES ($1, $2, $3, $4)`,
            ['quick_submit_failed', account_id, 'failed', err.message]
        );
    }
}

/**
 * GET /api/quick-submit/accounts
 * Returns list of active accounts for bot reference
 */
router.get('/accounts', async (req, res) => {
    const accounts = await query(
        `SELECT id, page_name, username, slug, category, allowed_submitters
         FROM instagram_accounts
         WHERE is_active = TRUE
         ORDER BY page_name`
    );

    res.json({
        accounts: accounts.rows.map(acc => ({
            slug: acc.slug,
            page_name: acc.page_name,
            username: acc.username,
            category: acc.category,
            submit_command: `post @${acc.slug} <instagram_reel_url>`
        }))
    });
});

/**
 * GET /api/quick-submit/status/:slug
 * Returns recent submissions for an account
 */
router.get('/status/:slug', async (req, res) => {
    const posts = await query(
        `SELECT p.id, p.caption, p.source_url, p.status, p.instagram_media_id, p.published_at, p.created_at
         FROM posts p
         JOIN instagram_accounts a ON a.id = p.account_id
         WHERE a.slug = $1 AND p.source = 'quick_submit'
         ORDER BY p.created_at DESC
         LIMIT 20`,
        [req.params.slug]
    );

    res.json({ posts: posts.rows });
});

module.exports = router;
