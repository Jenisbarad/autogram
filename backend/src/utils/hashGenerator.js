const crypto = require('crypto');
const fs = require('fs');
const { query } = require('../db');

/**
 * Generate SHA256 hash of a file
 * @param {string} filePath
 * @returns {string} hex hash
 */
function hashFile(filePath) {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Check if a file with this hash already exists in the DB
 * @param {string} hash
 * @returns {boolean}
 */
async function isDuplicate(hash) {
    const result = await query(
        `SELECT id FROM posts WHERE file_hash = $1 LIMIT 1`,
        [hash]
    );
    return result.rows.length > 0;
}

module.exports = { hashFile, isDuplicate };
