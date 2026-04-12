const express = require('express');
const router = express.Router();
const { query } = require('../db');
const slugify = require('slug');

// POST /accounts/add
router.post('/add', async (req, res) => {
    const {
        page_name,
        username,
        category,
        instagram_user_id,
        access_token,
        app_id,
        app_secret,
        posting_mode = 'manual',
        auto_viral_threshold = 0.70,
        watermark_text,
        allowed_submitters = '',
    } = req.body;

    if (!page_name || !username || !category) {
        return res.status(400).json({ error: 'page_name, username, and category are required' });
    }

    const slug = slugify(page_name, { lower: true });
    const submitters = allowed_submitters
        ? allowed_submitters.split(',').map(s => s.trim().replace(/^@/, '')).filter(Boolean)
        : [];

    const result = await query(
        `INSERT INTO instagram_accounts
      (page_name, username, slug, category, instagram_user_id, access_token, app_id, app_secret, posting_mode, auto_viral_threshold, watermark_text, allowed_submitters)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
        [page_name, username, slugStr, category, instagram_user_id, access_token, app_id, app_secret, posting_mode, auto_viral_threshold, watermark_text || `@${username}`, JSON.stringify(submitters)]
    );

    res.status(201).json({ success: true, account: result.rows[0] });
});

// GET /accounts
router.get('/', async (req, res) => {
    const result = await query(
        `SELECT 
       a.*,
       COUNT(p.id) FILTER (WHERE p.status = 'pending')   AS pending_count,
       COUNT(p.id) FILTER (WHERE p.status = 'published')  AS published_count,
       COUNT(p.id) FILTER (WHERE p.status = 'rejected')   AS rejected_count
     FROM instagram_accounts a
     LEFT JOIN posts p ON p.account_id = a.id
     WHERE a.is_active = TRUE
     GROUP BY a.id
     ORDER BY a.created_at DESC`
    );
    res.json({ accounts: result.rows });
});

// GET /accounts/:id
router.get('/:id', async (req, res) => {
    const result = await query(
        `SELECT * FROM instagram_accounts WHERE id = $1 AND is_active = TRUE`,
        [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ account: result.rows[0] });
});

// GET /accounts/slug/:slug
router.get('/slug/:slug', async (req, res) => {
    const result = await query(
        `SELECT * FROM instagram_accounts WHERE slug = $1 AND is_active = TRUE`,
        [req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ account: result.rows[0] });
});

// GET /accounts/:id/posts
router.get('/:id/posts', async (req, res) => {
    const { status = 'pending', limit = 20, offset = 0 } = req.query;
    const result = await query(
        `SELECT * FROM posts
     WHERE account_id = $1 AND status = $2
     ORDER BY viral_score DESC, created_at DESC
     LIMIT $3 OFFSET $4`,
        [req.params.id, status, limit, offset]
    );
    const count = await query(
        `SELECT COUNT(*) FROM posts WHERE account_id = $1 AND status = $2`,
        [req.params.id, status]
    );
    res.json({ posts: result.rows, total: parseInt(count.rows[0].count) });
});

// PUT /accounts/:id
router.put('/:id', async (req, res) => {
    const { page_name, category, posting_mode, auto_viral_threshold, watermark_text, access_token, app_id, app_secret, instagram_user_id, allowed_submitters = '' } = req.body;
    const submitters = allowed_submitters
        ? allowed_submitters.split(',').map(s => s.trim().replace(/^@/, '')).filter(Boolean)
        : [];
    const result = await query(
        `UPDATE instagram_accounts
     SET page_name=$1, category=$2, posting_mode=$3, auto_viral_threshold=$4, watermark_text=$5,
         access_token=$6, app_id=$7, app_secret=$8, instagram_user_id=$9, allowed_submitters=$10
     WHERE id=$11 RETURNING *`,
        [page_name, category, posting_mode, auto_viral_threshold, watermark_text, access_token, app_id, app_secret, instagram_user_id, JSON.stringify(submitters), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Account not found' });
    res.json({ account: result.rows[0] });
});

// DELETE /accounts/:id
router.delete('/:id', async (req, res) => {
    await query(`UPDATE instagram_accounts SET is_active = FALSE WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
});

module.exports = router;
