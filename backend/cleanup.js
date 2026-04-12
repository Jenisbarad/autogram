require('dotenv').config();
const { pool } = require('./src/db');

pool.query("DELETE FROM posts WHERE status = 'pending'")
  .then(r => {
    console.log('Cleared pending posts:', r.rowCount);
    return pool.query("UPDATE posts SET file_hash = NULL");
  })
  .then(r => {
    console.log('Reset file_hash for', r.rowCount, 'posts');
    pool.end();
  })
  .catch(e => {
    console.error(e.message);
    pool.end();
  });
