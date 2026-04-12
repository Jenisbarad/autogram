const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool } = require('../db/index');

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/003_add_auth.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Applied 003_add_auth.sql successfully!');
    } catch (err) {
        console.error('❌ Failed to apply migration:', err);
    } finally {
        process.exit(0);
    }
}
run();
