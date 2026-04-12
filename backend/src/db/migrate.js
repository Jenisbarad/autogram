const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create pool directly to avoid circular dependency
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

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
            // Ignore "already exists" errors
            if (err.message.includes('already exists')) {
                console.log(`  ⚠️ Skipped: ${file} (already exists)`);
            } else {
                console.error(`  ❌ Failed: ${file}`, err.message);
                throw err;
            }
        }
    }

    console.log('✅ All migrations completed!');
    await pool.end();
}

module.exports = { migrate };
