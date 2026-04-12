const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { publishToInstagram } = require('../publisher/instagramPublisher');

// POST /publish/publish-post
router.post('/publish-post', async (req, res) => {
    const { post_id } = req.body;
    if (!post_id) return res.status(400).json({ error: 'post_id is required' });

    // Fetch post + account
    const postResult = await query(
        `SELECT p.*, a.access_token, a.instagram_user_id, a.app_id, a.app_secret, a.username
     FROM posts p
     JOIN instagram_accounts a ON a.id = p.account_id
     WHERE p.id = $1`,
        [post_id]
    );
    if (!postResult.rows.length) return res.status(404).json({ error: 'Post not found' });

    const post = postResult.rows[0];

    if (post.status === 'published') {
        return res.status(400).json({ error: 'Post already published' });
    }
    if (post.status === 'rejected') {
        return res.status(400).json({ error: 'Cannot publish a rejected post' });
    }

    // Mark as processing
    await query(
        `UPDATE posts SET status = 'processing' WHERE id = $1`,
        [post_id]
    );

    try {
        console.log(`[PUBLISH] Starting publish for post ${post_id}`);
        
        let publicMediaUrl = post.media_url;
        if (publicMediaUrl.includes('localhost') && process.env.PUBLIC_BACKEND_URL) {
            publicMediaUrl = publicMediaUrl.replace(/http:\/\/localhost:\d+/, process.env.PUBLIC_BACKEND_URL);
        }

        console.log(`[PUBLISH] Account: ${post.username}, Media URL: ${publicMediaUrl}`);
        
        const captionFull = `${post.caption || ''}\n\n${post.hashtags || ''}`.trim();
        const result = await publishToInstagram({
            access_token: post.access_token,
            instagram_user_id: post.instagram_user_id,
            media_url: publicMediaUrl,
            caption: captionFull,
        });

        console.log(`[PUBLISH] Success! Media ID: ${result.instagram_post_id}`);
        await query(
            `UPDATE posts SET status = 'published', instagram_media_id = $1, published_at = NOW() WHERE id = $2`,
            [result.instagram_post_id, post_id]
        );

        res.json({ 
            success: true, 
            instagram_media_id: result.instagram_post_id,
            permalink: result.permalink,
            upload_status: result.upload_status
        });
    } catch (err) {
        console.error(`[PUBLISH] ERROR:`, err);
        await query(
            `UPDATE posts SET status = 'pending', error_message = $1 WHERE id = $2`,
            [err.message, post_id]
        );
        res.status(500).json({ error: `Failed to publish: ${err.message}` });
    }
});

// POST /publish/reject-post
router.post('/reject-post', async (req, res) => {
    const { post_id } = req.body;
    if (!post_id) return res.status(400).json({ error: 'post_id is required' });

    const result = await query(
        `UPDATE posts SET status = 'rejected' WHERE id = $1 AND status != 'published' RETURNING id`,
        [post_id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found or already published' });

    res.json({ success: true, message: 'Post rejected' });
});

module.exports = router;
