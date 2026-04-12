const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool } = require('../db/index');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: node create-admin.js <email> <password>');
        process.exit(1);
    }

    const email = args[0];
    const password = args[1];

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (email, password_hash, role, status)
            VALUES ($1, $2, 'admin', 'approved')
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                role = 'admin',
                status = 'approved'
            RETURNING id, email, role, status;
        `;
        
        const result = await pool.query(query, [email, hashedPassword]);
        console.log('✅ Admin user created/updated successfully!');
        console.log(result.rows[0]);
    } catch (err) {
        console.error('❌ Failed to create admin:', err);
    } finally {
        process.exit(0);
    }
}

createAdmin();
