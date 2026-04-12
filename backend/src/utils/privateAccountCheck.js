/**
 * Private Account Detection
 *
 * IMPORTANT: We should NOT download or republish content from private accounts.
 * This is illegal and violates Instagram's Terms of Service.
 *
 * This utility attempts to detect private accounts and block such submissions.
 */

const axios = require('axios');

/**
 * Check if Instagram URL is from a private account
 * Note: This is a best-effort check - Instagram doesn't expose this directly
 *
 * @param {string} instagramUrl - Instagram reel/post URL
 * @returns {Promise<{isPrivate: boolean, username: string, error: string}>}
 */
async function checkPrivateAccount(instagramUrl) {
    try {
        // Extract username from URL
        const usernameMatch = instagramUrl.match(/instagram\.com\/([^\/]+)/);
        if (!usernameMatch) {
            return { isPrivate: false, username: null, canCheck: false };
        }

        const username = usernameMatch[1];
        if (username === 'reel' || username === 'reels' || username === 'p') {
            // These are endpoints, not usernames - can't extract
            return { isPrivate: false, username: null, canCheck: false };
        }

        // Try to check the profile (without auth)
        // Note: This won't work reliably, but provides some protection
        const profileUrl = `https://www.instagram.com/${username}/?__a=1&__d=dis`;

        try {
            const response = await axios.get(profileUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                timeout: 5000,
            });

            // Instagram returns specific data for private accounts
            const data = response.data;

            // Check for private account indicators
            if (data && data.graphql && data.graphql.user) {
                const user = data.graphql.user;
                if (user.is_private) {
                    return {
                        isPrivate: true,
                        username: username,
                        canCheck: true,
                        error: 'This account is private'
                    };
                }
            }

            return { isPrivate: false, username: username, canCheck: true };
        } catch (err) {
            // If we can't check, log it but don't block
            // Better to allow some false negatives than block legitimate content
            console.warn(`[PrivateCheck] Could not verify account @${username}: ${err.message}`);
            return { isPrivate: false, username: username, canCheck: false, error: err.message };
        }
    } catch (err) {
        return { isPrivate: false, username: null, canCheck: false, error: err.message };
    }
}

/**
 * Log private account submission attempt (for security monitoring)
 */
async function logPrivateAccountAttempt(accountId, reelUrl, username, attemptSource) {
    // TODO: Save to database for security monitoring
    console.warn(`⚠️  [SECURITY] Private account submission BLOCKED:
    - Account ID: ${accountId}
    - Source: ${attemptSource}
    - Reel URL: ${reelUrl}
    - Username: ${username}
    - Timestamp: ${new Date().toISOString()}
    `);
}

module.exports = {
    checkPrivateAccount,
    logPrivateAccountAttempt,
};
