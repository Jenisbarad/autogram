const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { QUEUES, REDIS_CONNECTION, addJob } = require('./jobQueue');
const { query } = require('../db');
const { discoverContent } = require('../crawler/contentDiscovery');
const { downloadMedia, PROC_DIR, THUMB_DIR } = require('../downloader/mediaDownloader');
const { checkQuality } = require('../quality/videoChecker');
const { hashFile, isDuplicate } = require('../utils/hashGenerator');
const { calculateViralScore, estimateViralScoreFromMetadata } = require('../utils/viralScore');
const { processVideo } = require('../processing/videoProcessor');
const { generateCaption } = require('../ai/captionGenerator');
const { publishToInstagram } = require('../publisher/instagramPublisher');

const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY) || 2;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
// Low threshold so content from all sources is accepted (especially YouTube/Reddit with no engagement data)
const VIRAL_THRESHOLD = parseFloat(process.env.VIRAL_SCORE_THRESHOLD) || 0.05;

function startWorkers() {
    // ── 1. Content Search ─────────────────────────────────
    new Worker(QUEUES.CONTENT_SEARCH, async (job) => {
        const { account_id, category, page_name, slug, access_token, instagram_user_id, platform } = job.data;
        job.updateProgress(5);
        console.log(`\n🔍 [contentSearch] Account: ${page_name} | Category: ${category} | Platform: ${platform || 'both'}`);

        const items = await discoverContent(category, { access_token, instagram_user_id, platform });
        console.log(`  Found ${items.length} items`);
        job.updateProgress(50);

        // Enqueue download job for each item
        for (const item of items) {
            await addJob(QUEUES.MEDIA_DOWNLOAD, 'mediaDownloadJob', {
                ...job.data,
                item,
            });
        }
        job.updateProgress(100);
        return { discovered: items.length };
    }, { connection: REDIS_CONNECTION, concurrency: CONCURRENCY });

    // ── 2. Media Download ─────────────────────────────────
    new Worker(QUEUES.MEDIA_DOWNLOAD, async (job) => {
        const { item, account_id, category, page_name, username, watermark_text } = job.data;
        const outputId = uuidv4();
        job.updateProgress(5);

        let filePath;
        try {
            filePath = await downloadMedia(item, outputId);
        } catch (err) {
            console.warn(`  ⬇️  Download failed: ${err.message}`);
            return { skipped: true, reason: err.message };
        }
        job.updateProgress(60);

        await addJob(QUEUES.QUALITY_CHECK, 'qualityCheckJob', {
            ...job.data,
            filePath,
            outputId,
            item,
        });
        job.updateProgress(100);
        return { filePath };
    }, { connection: REDIS_CONNECTION, concurrency: CONCURRENCY });
































        // ── 3. Quality Check ──────────────────────────────────
    new Worker(QUEUES.QUALITY_CHECK, async (job) => {
        const { filePath, outputId, item, account_id } = job.data;
        job.updateProgress(10);

        // Check if file exists first
        if (!filePath || !fs.existsSync(filePath)) {
            console.log(`  ❌ File not found: ${filePath}`);
            return { skipped: true, reason: 'File not found' };
        }

        try {
            const { pass, reason, metadata, resolution } = await checkQuality(filePath);
            if (!pass) {
                // Clean up file
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.warn(`  ⚠️  Failed to cleanup file: ${e.message}`);
                }
                console.log(`  ❌ Quality rejected: ${reason}`);
                return { skipped: true, reason };
            }

            // Duplicate check
            const hash = hashFile(filePath);
            if (await isDuplicate(hash)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.warn(`  ⚠️  Failed to cleanup duplicate file: ${e.message}`);
                }
                console.log('  ⚠️  Duplicate detected, skipping');
                return { skipped: true, reason: 'duplicate' };
            }
            job.updateProgress(70);

            await addJob(QUEUES.VIRAL_SCORE, 'viralScoreJob', {
                ...job.data,
                filePath,
                outputId,
                metadata,
                resolution,
                hash,
            });
            job.updateProgress(100);
            return { pass: true, resolution };
        } catch (err) {
            // Clean up on any error
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {}
            }
            throw err;
        }
    }, { connection: REDIS_CONNECTION, concurrency: CONCURRENCY });

        // ── 4. Viral Score ────────────────────────────────────
    new Worker(QUEUES.VIRAL_SCORE, async (job) => {
        const { item, metadata, account_id, filePath } = job.data;
        job.updateProgress(10);

        try {
            let viral_score;
            if (item.viral_score_input?.views || item.viral_score_input?.likes) {
                viral_score = calculateViralScore(item.viral_score_input);
            } else {
                viral_score = estimateViralScoreFromMetadata({
                    duration: metadata.duration,
                    width: metadata.width,
                    height: metadata.height,
                    downloads: item.downloads || 0,
                });
            }

            // Safety floor: real platform content (YouTube/Reddit/Instagram) always gets at least 0.15
            const isRealPlatform = ['youtube', 'reddit', 'instagram'].includes(item.source);
            if (isRealPlatform && viral_score < 0.15) viral_score = 0.15;

            if (viral_score < VIRAL_THRESHOLD) {
                if (filePath && fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (e) {
                        console.warn(`  ⚠️  Failed to cleanup file: ${e.message}`);
                    }
                }
                console.log(`  📉 Viral score too low (${viral_score.toFixed(3)}), skipping`);
                return { skipped: true, reason: `viral_score too low: ${viral_score}` };
            }
            job.updateProgress(80);

            await addJob(QUEUES.MEDIA_PROCESSING, 'mediaProcessingJob', {
                ...job.data,
                viral_score,
            });
            job.updateProgress(100);
            return { viral_score };
        } catch (err) {
            // Clean up on error
            if (filePath && fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {}
            }
            throw err;
        }
    }, { connection: REDIS_CONNECTION, concurrency: CONCURRENCY });

        // ── 5. Media Processing ───────────────────────────────
    new Worker(QUEUES.MEDIA_PROCESSING, async (job) => {
        const { filePath, outputId, watermark_text, username } = job.data;
        job.updateProgress(10);

        // Check if input file exists
        if (!filePath || !fs.existsSync(filePath)) {
            console.warn(`  ⚠️  Input file not found: ${filePath}`);
            return { skipped: true, reason: 'Input file not found' };
        }

        const wm = watermark_text || `@${username}`;
        let processed;
        try {
            processed = await processVideo(filePath, outputId, wm);
        } catch (err) {
            console.warn(`  🎬 Video processing failed: ${err.message}, using raw file`);
            // Fallback to raw file
            processed = { outputPath: filePath, thumbnailPath: null };
        }
        job.updateProgress(80);

        await addJob(QUEUES.CAPTION_GENERATION, 'captionGenerationJob', {
            ...job.data,
            processedPath: processed.outputPath,
            thumbnailPath: processed.thumbnailPath,
        });
        job.updateProgress(100);
        return { processedPath: processed.outputPath };
    }, { connection: REDIS_CONNECTION, concurrency: 1 }); // 1 — FFmpeg is CPU heavy

        // ── 6. Caption Generation ─────────────────────────────
    new Worker(QUEUES.CAPTION_GENERATION, async (job) => {
        const { account_id, category, username, page_name, item, processedPath, thumbnailPath, metadata, resolution, hash, viral_score } = job.data;
        job.updateProgress(10);

        try {
            let caption = `Amazing ${category} content! 🌟\nFollow @${username} for more!`;
            let hashtags = `#${category} #viral #trending #reels #explore`;

            try {
                const result = await generateCaption({
                    category,
                    topic: item.title || `${category} video`,
                    username,
                });
                caption = result.caption;
                hashtags = result.hashtags;
            } catch (err) {
                console.warn('  🤖 Caption generation failed, using fallback:', err.message);
            }
            job.updateProgress(70);

            // Save post to database
            const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
            const publicMediaUrl = processedPath?.includes('http')
                ? processedPath
                : `${BACKEND_URL}/media/processed/${path.basename(processedPath)}`;

            const insertResult = await query(
                `INSERT INTO posts (
                    account_id, category, media_url, raw_media_url, thumbnail_url,
                    caption, hashtags, resolution, width, height, duration,
                    source, source_url, file_hash, viral_score, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id`,
                [
                    account_id, category, publicMediaUrl, item.url, thumbnailPath,
                    caption, hashtags, resolution, metadata?.width, metadata?.height, metadata?.duration,
                    item.source, item.source_url, hash, viral_score, 'approved'
                ]
            );
            const postId = insertResult.rows[0].id;
            console.log(`✅ Post saved to DB: ID=${postId}, score=${viral_score.toFixed(3)}`);

            // Auto-post if enabled
            const account = await query(`SELECT * FROM instagram_accounts WHERE id=$1`, [account_id]);
            const acc = account.rows[0];
            if (acc?.posting_mode === 'auto' && viral_score >= (acc.auto_viral_threshold || 0.7)) {
                await addJob(QUEUES.INSTAGRAM_POST, 'instagramPostJob', { post_id: postId });
            }

            job.updateProgress(100);
            return { post_id: postId };
        } catch (err) {
            console.error(`  ❌ Caption generation failed: ${err.message}`);
            // Clean up files
            if (processedPath && fs.existsSync(processedPath)) {
                try {
                    fs.unlinkSync(processedPath);
                } catch (e) {}
            }
            if (thumbnailPath && fs.existsSync(thumbnailPath)) {
                try {
                    fs.unlinkSync(thumbnailPath);
                } catch (e) {}
            }
            throw err;
        }
    }, { connection: REDIS_CONNECTION, concurrency: CONCURRENCY });

    // ── 7. Instagram Post ─────────────────────────────────
    new Worker(QUEUES.INSTAGRAM_POST, async (job) => {
        const { post_id } = job.data;
        job.updateProgress(10);

        const res = await query(
            `SELECT p.*, a.access_token, a.instagram_user_id FROM posts p JOIN instagram_accounts a ON a.id=p.account_id WHERE p.id=$1`,
            [post_id]
        );
        if (!res.rows.length) throw new Error(`Post ${post_id} not found`);
        const post = res.rows[0];
        job.updateProgress(20);

        const postUrl = `${process.env.PUBLIC_BACKEND_URL || BACKEND_URL}/media/processed/${path.basename(post.media_url)}`;
        const captionFull = `${post.caption}\n\n${post.hashtags}`.trim();
        const result = await publishToInstagram({
            access_token: post.access_token,
            instagram_user_id: post.instagram_user_id,
            media_url: post.media_url.includes('localhost') ? postUrl : post.media_url,
            caption: captionFull,
        });

        await query(
            `UPDATE posts SET status='published', instagram_media_id=$1, published_at=NOW() WHERE id=$2`,
            [result.instagram_post_id, post_id]
        );
        job.updateProgress(100);
        return { mediaId: result.instagram_post_id };
    }, { connection: REDIS_CONNECTION, concurrency: 1 });

        console.log('✅ All 7 BullMQ workers registered');
}

module.exports = { startWorkers };
