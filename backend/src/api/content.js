const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { addJob, QUEUES } = require('../queue/jobQueue');

// POST /find-content
router.post('/find-content', async (req, res) => {
    const { account_id, platform = 'both' } = req.body;

    if (!account_id) {
        return res.status(400).json({ error: 'account_id is required' });
    }

    // Verify account exists
    const accountResult = await query(
        `SELECT * FROM instagram_accounts WHERE id = $1 AND is_active = TRUE`,
        [account_id]
    );
    if (!accountResult.rows.length) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    // Log job start
    await query(
        `INSERT INTO job_logs (job_name, account_id, status, message) VALUES ($1, $2, $3, $4)`,
        ['contentSearchJob', account_id, 'queued', `Starting content discovery for category: ${account.category} (Platform: ${platform})`]
    );

    // Add to BullMQ queue
    const job = await addJob(QUEUES.CONTENT_SEARCH, 'contentSearchJob', {
        account_id,
        category: account.category,
        page_name: account.page_name,
        username: account.username,
        slug: account.slug,
        watermark_text: account.watermark_text,
        access_token: account.access_token,
        instagram_user_id: account.instagram_user_id,
        platform,
    });

    res.json({
        success: true,
        message: `Content discovery started for "${account.page_name}"`,
        job_id: job.id,
        category: account.category,
    });
});

module.exports = router;
