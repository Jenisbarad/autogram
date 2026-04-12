const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db/index');
const { requireAuth, requireApproved, requireAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(requireAuth, requireApproved, requireAdmin);

// ─── USER MANAGEMENT ──────────────────────────────

// GET /api/admin/users
// Returns users grouped by status or filtered
router.get('/users', async (req, res) => {
    try {
        const status = req.query.status;
        let query = 'SELECT id, email, role, status, created_at FROM users';
        let params = [];
        
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        const { rows } = await pool.query(query, params);
        res.json({ users: rows });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/admin/users/:id/approve
router.post('/users/:id/approve', async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            "UPDATE users SET status = 'approved' WHERE id = $1",
            [req.params.id]
        );
        if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User approved securely' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// POST /api/admin/users/:id/reject
router.post('/users/:id/reject', async (req, res) => {
    try {
        const { rowCount } = await pool.query(
            "UPDATE users SET status = 'rejected' WHERE id = $1 AND role != 'admin'",
            [req.params.id]
        );
        if (rowCount === 0) return res.status(404).json({ error: 'User not found or is admin' });
        res.json({ message: 'User rejected' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject user' });
    }
});


// ─── INVITE MANAGEMENT ────────────────────────────

// GET /api/admin/invites
// Returns all invite codes with their usage history
router.get('/invites', async (req, res) => {
    try {
        const { rows: invites } = await pool.query('SELECT * FROM invite_codes ORDER BY created_at DESC');
        const { rows: usages } = await pool.query('SELECT * FROM invite_usage ORDER BY used_at DESC');
        
        // Attach usages to their respective invite codes
        const usagesByCode = {};
        for(let u of usages) {
            if(!usagesByCode[u.code_id]) usagesByCode[u.code_id] = [];
            usagesByCode[u.code_id].push({ email: u.user_email, used_at: u.used_at });
        }
        
        const mappedInvites = invites.map(i => ({
            ...i,
            usages: usagesByCode[i.id] || []
        }));

        res.json({ invites: mappedInvites });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch invites' });
    }
});

// POST /api/admin/invites/generate
// Invalidates all previous codes and creates one new active code
router.post('/invites/generate', async (req, res) => {
    try {
        // 1. Invalidate old codes
        await pool.query('UPDATE invite_codes SET is_active = false WHERE is_active = true');
        
        // 2. Generate new code
        const code = crypto.randomBytes(8).toString('hex').toUpperCase(); // Secure random string
        
        const { rows } = await pool.query(
            `INSERT INTO invite_codes (code, is_active, created_by)
             VALUES ($1, true, $2)
             RETURNING *`,
            [code, req.user.id]
        );

        res.json({ message: 'New invite code generated. Previous codes invalidated.', invite: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate invite code' });
    }
});

// POST /api/admin/invites/:id/toggle
router.post('/invites/:id/toggle', async (req, res) => {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: 'is_active boolean is required' });
    }
    
    try {
        const { rows } = await pool.query(
            'UPDATE invite_codes SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Invite not found' });
        res.json({ message: 'Invite status updated', invite: rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update invite code' });
    }
});

module.exports = router;
