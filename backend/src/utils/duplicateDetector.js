/**
 * Advanced Duplicate Detection
 *
 * Checks for duplicates at multiple levels:
 * 1. Source URL matching
 * 2. Extracted platform ID matching (Instagram shortcode, YouTube ID, Reddit post ID)
 * 3. File hash matching (SHA256)
 */

const { query } = require('../db');

/**
 * Extract platform-specific IDs from URLs
 */
function extractPlatformId(url) {
    if (!url) return null;

    // Instagram: instagram.com/reel/SHORTCODE/ or instagram.com/p/SHORTCODE/
    const instaMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/i);
    if (instaMatch) return { platform: 'instagram', id: instaMatch[1] };

    // YouTube: youtube.com/shorts/VIDEO_ID or youtube.com/watch?v=VIDEO_ID
    const ytMatch = url.match(/(?:youtube\.com\/(?:shorts|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]+)/i);
    if (ytMatch) return { platform: 'youtube', id: ytMatch[1] };

    // Reddit: reddit.com/r/SUB/comments/POST_ID/ or reddit.com/comments/POST_ID/
    const redditMatch = url.match(/reddit\.com\/(?:r\/\w+\/comments|comments)\/([A-Za-z0-9]+)/i);
    if (redditMatch) return { platform: 'reddit', id: redditMatch[1] };

    // TikTok: tiktok.com/@user/video/VIDEO_ID
    const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
    if (tiktokMatch) return { platform: 'tiktok', id: tiktokMatch[1] };

    return null;
}

/**
 * Normalize URL for comparison (removes tracking params, etc.)
 */
function normalizeUrl(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        // Remove tracking parameters
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'igshid'];
        trackingParams.forEach(param => parsed.searchParams.delete(param));
        return parsed.toString();
    } catch {
        return url;
    }
}

/**
 * Check if content already exists in database
 * @param {object} options - { url, hash, accountId }
 * @returns {Promise<object>} - { isDuplicate, existingPost, matchType }
 */
async function checkDuplicate(options = {}) {
    const { url, hash, accountId } = options;
    const checks = [];

    // Check 1: Exact URL match (with normalization)
    if (url) {
        const normalizedUrl = normalizeUrl(url);
        const platformId = extractPlatformId(url);

        if (platformId) {
            // Check by platform ID (more reliable than full URL)
            checks.push(query(
                `SELECT id, source_url, source, created_at
                 FROM posts
                 WHERE source_url LIKE $1
                 ${accountId ? 'AND account_id = $2' : ''}
                 LIMIT 1`,
                accountId
                    ? [`%${platformId.id}%`, accountId]
                    : [`%${platformId.id}%`]
            ).then(res => {
                if (res.rows.length > 0) {
                    return { isDuplicate: true, matchType: 'platform_id', existingPost: res.rows[0] };
                }
                return null;
            }));
        }

        // Check by normalized URL
        checks.push(query(
            `SELECT id, source_url, source, created_at
             FROM posts
             WHERE source_url = $1
             ${accountId ? 'OR source_url = $2' : ''}
             LIMIT 1`,
            accountId
                ? [normalizedUrl, normalizeUrl(url.replace(/^[^]+:\/\/www\./, 'https://'))]
                : [normalizedUrl]
        ).then(res => {
            if (res.rows.length > 0) {
                return { isDuplicate: true, matchType: 'url', existingPost: res.rows[0] };
            }
            return null;
        }));
    }

    // Check 2: File hash match
    if (hash) {
        checks.push(query(
            `SELECT id, source_url, source, created_at, file_hash
             FROM posts
             WHERE file_hash = $1
             ${accountId ? 'AND account_id = $2' : ''}
             LIMIT 1`,
            accountId ? [hash, accountId] : [hash]
        ).then(res => {
            if (res.rows.length > 0) {
                return { isDuplicate: true, matchType: 'hash', existingPost: res.rows[0] };
            }
            return null;
        }));
    }

    // Execute all checks in parallel
    const results = await Promise.all(checks);

    // Return first match found
    for (const result of results) {
        if (result && result.isDuplicate) {
            return result;
        }
    }

    return { isDuplicate: false };
}

/**
 * Batch check multiple URLs for duplicates
 * @param {string[]} urls - Array of URLs to check
 * @param {number} accountId - Optional account ID to scope the check
 * @returns {Promise<object>} - Map of URL -> { isDuplicate, existingPost }
 */
async function batchCheckDuplicates(urls, accountId) {
    const checks = urls.map(async url => {
        const result = await checkDuplicate({ url, accountId });
        return [url, result];
    });

    const results = await Promise.all(checks);
    return Object.fromEntries(results);
}

/**
 * Find recently posted similar content (same category, same source)
 * Useful for avoiding posting too similar content too frequently
 * @param {object} options - { accountId, category, source, hours = 24 }
 */
async function findRecentSimilar(options = {}) {
    const { accountId, category, source, hours = 24 } = options;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (accountId) {
        conditions.push(`account_id = $${paramIndex++}`);
        values.push(accountId);
    }

    if (category) {
        conditions.push(`category = $${paramIndex++}`);
        values.push(category);
    }

    if (source) {
        conditions.push(`source = $${paramIndex++}`);
        values.push(source);
    }

    conditions.push(`created_at > NOW() - INTERVAL '${hours} hours'`);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
        `SELECT id, source_url, caption, created_at
         FROM posts
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT 10`,
        values
    );

    return result.rows;
}

module.exports = {
    extractPlatformId,
    normalizeUrl,
    checkDuplicate,
    batchCheckDuplicates,
    findRecentSimilar,
};
