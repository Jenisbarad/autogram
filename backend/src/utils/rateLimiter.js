/**
 * Rate Limiter Utility
 *
 * Simple in-memory rate limiter for API calls.
 * For production with multiple instances, use Redis-based rate limiting.
 */

class RateLimiter {
    constructor(options = {}) {
        this.maxRequests = options.maxRequests || 10;
        this.windowMs = options.windowMs || 60000; // 1 minute default
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
    }

    /**
     * Check if a request is allowed for the given key
     * @param {string} key - Identifier (e.g., API name, IP, etc.)
     * @returns {object} - { allowed: boolean, remaining: number, resetTime: number }
     */
    check(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Get or initialize request tracking for this key
        let tracker = this.requests.get(key);
        if (!tracker) {
            tracker = { count: 0, resetAt: now + this.windowMs };
            this.requests.set(key, tracker);
        }

        // Reset if window has passed
        if (now > tracker.resetAt) {
            tracker.count = 0;
            tracker.resetAt = now + this.windowMs;
        }

        // Check if under limit
        const allowed = tracker.count < this.maxRequests;
        if (allowed) {
            tracker.count++;
        }

        return {
            allowed,
            remaining: Math.max(0, this.maxRequests - tracker.count),
            resetAt: tracker.resetAt,
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, tracker] of this.requests.entries()) {
            if (now > tracker.resetAt + this.windowMs) {
                this.requests.delete(key);
            }
        }
    }

    /**
     * Reset all rate limits (useful for testing)
     */
    reset() {
        this.requests.clear();
    }

    /**
     * Get current stats for a key
     */
    getStats(key) {
        const tracker = this.requests.get(key);
        if (!tracker) {
            return { count: 0, remaining: this.maxRequests, resetAt: Date.now() + this.windowMs };
        }
        return {
            count: tracker.count,
            remaining: Math.max(0, this.maxRequests - tracker.count),
            resetAt: tracker.resetAt,
        };
    }
}

// Pre-configured limiters for common APIs
const limiters = {
    youtube: new RateLimiter({ maxRequests: 100, windowMs: 86400000 }), // 100/day
    reddit: new RateLimiter({ maxRequests: 60, windowMs: 60000 }), // 60/minute
    instagram: new RateLimiter({ maxRequests: 200, windowMs: 3600000 }), // 200/hour
    pexels: new RateLimiter({ maxRequests: 200, windowMs: 3600000 }), // 200/hour
    general: new RateLimiter({ maxRequests: 10, windowMs: 60000 }), // 10/minute
};

/**
 * Wait for rate limit to reset if needed
 * @param {string} apiName - API key from limiters object
 * @param {number} maxWaitMs - Maximum time to wait (default: 5 minutes)
 */
async function waitForRateLimit(apiName, maxWaitMs = 300000) {
    const limiter = limiters[apiName] || limiters.general;
    const check = limiter.check(apiName);

    if (!check.allowed) {
        const waitTime = Math.min(check.resetAt - Date.now(), maxWaitMs);
        if (waitTime > 0) {
            console.log(`⏳ [RateLimiter] Rate limit reached for ${apiName}. Waiting ${Math.ceil(waitTime / 1000)}s...`);
            await sleep(waitTime);
            return limiter.check(apiName);
        }
    }

    return check;
}

/**
 * Check rate limit without waiting
 */
function checkRateLimit(apiName) {
    const limiter = limiters[apiName] || limiters.general;
    return limiter.check(apiName);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    RateLimiter,
    limiters,
    waitForRateLimit,
    checkRateLimit,
};
