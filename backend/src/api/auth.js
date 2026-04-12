const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/index');
const { requireAuth, JWT_SECRET } = require('../middleware/authMiddleware');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// GET /api/auth/me - Check current session
router.get('/me', requireAuth, async (req, res) => {
    res.json({ user: req.user });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password, invite_code } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        let userStatus = 'pending';
        let matchedInviteCodeId = null;

        // Process invite code if provided
        if (invite_code) {
            const inviteQ = await pool.query('SELECT * FROM invite_codes WHERE code = $1', [invite_code]);
            const invite = inviteQ.rows[0];

            if (!invite) {
                return res.status(400).json({ error: 'Invalid invite code' });
            }
            if (!invite.is_active) {
                return res.status(400).json({ error: 'This invite code is no longer active' });
            }
            if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
                return res.status(400).json({ error: 'This invite code has expired' });
            }

            // Check if this specific email has used this code already
            const usageQ = await pool.query('SELECT id FROM invite_usage WHERE code_id = $1 AND user_email = $2', [invite.id, email]);
            if (usageQ.rows.length > 0) {
                return res.status(400).json({ error: 'You have already used this invite code' });
            }

            matchedInviteCodeId = invite.id;
            userStatus = 'pending'; // Change to 'approved' if you want to auto-approve on invite
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(password, 10);
        const userResult = await pool.query(
            `INSERT INTO users (email, password_hash, status)
             VALUES ($1, $2, $3)
             RETURNING id, email, role, status`,
            [email, passwordHash, userStatus]
        );
        const newUser = userResult.rows[0];

        // Log invite usage if applicable
        if (matchedInviteCodeId) {
            await pool.query(
                'INSERT INTO invite_usage (code_id, user_email) VALUES ($1, $2)',
                [matchedInviteCodeId, email]
            );
        }

        res.status(201).json({
            message: userStatus === 'approved' ? 'Registration successful' : 'Registration successful. Waiting for admin approval.',
            user: newUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.status !== 'approved') {
            return res.status(403).json({ error: `Account status is ${user.status}. You cannot log in yet.` });
        }

        // Issue JWT token
        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

        res.cookie('auth_token', token, COOKIE_OPTIONS);
        
        // Remove password from returned user object
        delete user.password_hash;

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
