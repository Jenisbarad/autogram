const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /analytics  — overall summary
router.get('/', async (req, res) => {
    const { account_id } = req.query;

    // Per-account stats
    const accountStats = await query(
        `SELECT
       a.id,
       a.page_name,
       a.username,
       a.slug,
       a.category,
       COUNT(p.id) FILTER (WHERE p.status = 'published')  AS total_published,
       COUNT(p.id) FILTER (WHERE p.status = 'pending')    AS total_pending,
       COUNT(p.id) FILTER (WHERE p.status = 'rejected')   AS total_rejected,
       AVG(p.viral_score) FILTER (WHERE p.status = 'published') AS avg_viral_score,
       SUM(an.likes)       AS total_likes,
       SUM(an.comments)    AS total_comments,
       SUM(an.views)       AS total_views,
       SUM(an.shares)      AS total_shares,
       SUM(an.followers_gained) AS total_followers_gained
     FROM instagram_accounts a
     LEFT JOIN posts p      ON p.account_id = a.id
     LEFT JOIN analytics an ON an.account_id = a.id
     WHERE a.is_active = TRUE
     ${account_id ? 'AND a.id = $1' : ''}
     GROUP BY a.id, a.page_name, a.username, a.slug, a.category
     ORDER BY total_published DESC NULLS LAST`,
        account_id ? [account_id] : []
    );

    // Recent posts with performance
    const recentPosts = await query(
        `SELECT
       p.id,
       p.caption,
       p.thumbnail_url,
       p.viral_score,
       p.published_at,
       p.instagram_media_id,
       a.page_name,
       a.username,
       an.likes,
       an.comments,
       an.views
     FROM posts p
     JOIN instagram_accounts a ON a.id = p.account_id
     LEFT JOIN analytics an ON an.post_id = p.id
     WHERE p.status = 'published'
     ${account_id ? 'AND p.account_id = $1' : ''}
     ORDER BY p.published_at DESC NULLS LAST
     LIMIT 10`,
        account_id ? [account_id] : []
    );

    // Time series — published per day last 30 days
    const timeSeries = await query(
        `SELECT
       DATE(p.published_at) AS date,
       COUNT(*) AS count,
       a.page_name
     FROM posts p
     JOIN instagram_accounts a ON a.id = p.account_id
     WHERE p.status = 'published' AND p.published_at > NOW() - INTERVAL '30 days'
     ${account_id ? 'AND p.account_id = $1' : ''}
     GROUP BY DATE(p.published_at), a.page_name
     ORDER BY date ASC`,
        account_id ? [account_id] : []
    );

    res.json({
        accounts: accountStats.rows,
        recentPosts: recentPosts.rows,
        timeSeries: timeSeries.rows,
    });
});

// POST /analytics/record  — store analytics from IG Graph API refresh
router.post('/record', async (req, res) => {
    const { account_id, post_id, likes, comments, views, shares, saves, reach, impressions, followers_gained } = req.body;
    const result = await query(
        `INSERT INTO analytics (account_id, post_id, likes, comments, views, shares, saves, reach, impressions, followers_gained)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [account_id, post_id, likes || 0, comments || 0, views || 0, shares || 0, saves || 0, reach || 0, impressions || 0, followers_gained || 0]
    );
    res.json({ analytics: result.rows[0] });
});

module.exports = router;
