const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { pool } = require('./index');

async function migrate() {
    console.log('🔄 Running database migrations...');
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        if (!file.endsWith('.sql')) continue;
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`  ▶ Running: ${file}`);
        try {
            await pool.query(sql);
            console.log(`  ✅ Done: ${file}`);
        } catch (err) {
            console.error(`  ❌ Failed: ${file}`, err.message);
            process.exit(1);
        }
    }

    console.log('✅ All migrations completed!');
    process.exit(0);
}

migrate();
