const jwt = require('jsonwebtoken');
const { pool } = require('../db/index');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_me_in_prod';

// Middleware to verify JWT token
const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.auth_token;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch fresh user from DB to ensure they still exist and check status
        const { rows } = await pool.query('SELECT id, email, role, status FROM users WHERE id = $1', [decoded.id]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'User no longer exists' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Middleware to ensure user is approved (must be chained after requireAuth)
const requireApproved = (req, res, next) => {
    if (!req.user || req.user.status !== 'approved') {
        return res.status(403).json({ error: 'Account pending approval or rejected' });
    }
    next();
};

// Middleware to ensure user is an admin (must be chained after requireAuth)
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};

module.exports = {
    requireAuth,
    requireApproved,
    requireAdmin,
    JWT_SECRET
};
