const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /posts/:id
router.get('/:id', async (req, res) => {
    const result = await query(
        `SELECT p.*, a.page_name, a.username, a.slug
     FROM posts p
     JOIN instagram_accounts a ON a.id = p.account_id
     WHERE p.id = $1`,
        [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json({ post: result.rows[0] });
});

// GET /posts  (admin all posts view)
router.get('/', async (req, res) => {
    const { status, account_id, limit = 20, offset = 0 } = req.query;
    let conditions = [];
    let values = [];
    let i = 1;

    if (status) { conditions.push(`p.status = $${i++}`); values.push(status); }
    if (account_id) { conditions.push(`p.account_id = $${i++}`); values.push(account_id); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
        `SELECT p.*, a.page_name, a.username, a.slug
     FROM posts p
     JOIN instagram_accounts a ON a.id = p.account_id
     ${where}
     ORDER BY p.viral_score DESC, p.created_at DESC
     LIMIT $${i++} OFFSET $${i++}`,
        [...values, limit, offset]
    );
    res.json({ posts: result.rows });
});

// PATCH /posts/:id/caption  — update caption/hashtags
router.patch('/:id/caption', async (req, res) => {
    const { caption, hashtags } = req.body;
    const result = await query(
        `UPDATE posts SET caption=$1, hashtags=$2 WHERE id=$3 RETURNING *`,
        [caption, hashtags, req.params.id]
    );
    res.json({ post: result.rows[0] });
});

module.exports = router;
