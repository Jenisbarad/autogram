require('dotenv').config({ path: '/d/insta-autogram-antigravity/backend/.env' });
const { pool } = require('./backend/src/db');
const fs = require('fs');
const path = require('path');

async function fix() {
  const del = await pool.query("DELETE FROM posts WHERE status = $1", ['pending']);
  console.log('Cleared', del.rowCount, 'stale pending posts');

  await pool.query("UPDATE posts SET file_hash = NULL");
  console.log('Cleared file_hash from all posts - duplicates can re-download');

  const remaining = await pool.query("SELECT status, COUNT(*) FROM posts GROUP BY status");
  console.table(remaining.rows);
  await pool.end();
}

fix().catch(e => { console.error('Error:', e.message); process.exit(1); });
