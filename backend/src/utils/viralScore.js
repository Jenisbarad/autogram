/**
 * Viral Score Engine
 *
 * Calculates a normalized score between 0 and 1 based on
 * engagement signals from the source platform.
 */

const DEFAULT_WEIGHTS = {
    engagement_rate: 0.40,
    likes_ratio: 0.30,
    comments_ratio: 0.20,
    shares_ratio: 0.10,
};

/**
 * Normalize a value against a baseline (soft max).
 * @param {number} value
 * @param {number} baseline — expected high-end value
 * @returns {number} 0-1 normalized
 */
function normalize(value, baseline = 1000000) {
    if (!value || value <= 0) return 0;
    return Math.min(value / baseline, 1);
}

/**
 * Calculate engagement rate.
 * @param {object} metrics
 * @returns {number} 0-1
 */
function calcEngagementRate({ likes = 0, comments = 0, shares = 0, views = 1 }) {
    if (views <= 0) return 0;
    const engagement = likes + comments * 2 + shares * 3;
    return Math.min(engagement / views, 1);
}

/**
 * Main viral score calculator.
 * @param {object} metrics - { likes, comments, shares, views, saves }
 * @param {object} weights - optional weight overrides
 * @returns {number} viral_score between 0 and 1
 */
function calculateViralScore(metrics = {}, weights = DEFAULT_WEIGHTS) {
    const { likes = 0, comments = 0, shares = 0, views = 1, saves = 0 } = metrics;

    const engagementRate = calcEngagementRate({ likes, comments, shares, views });
    const likesRatio = normalize(likes, 5_000_000);
    const commentsRatio = normalize(comments, 500_000);
    const sharesRatio = normalize(shares, 1_000_000);

    const score =
        weights.engagement_rate * engagementRate +
        weights.likes_ratio * likesRatio +
        weights.comments_ratio * commentsRatio +
        weights.shares_ratio * sharesRatio;

    return Math.min(Math.max(parseFloat(score.toFixed(4)), 0), 1);
}

/**
 * Estimate viral score from Pexels metadata (no engagement data).
 * Uses duration/resolution heuristics.
 * @param {object} video
 * @returns {number}
 */
function estimateViralScoreFromMetadata({ duration = 30, width = 1920, height = 1080, downloads = 0 }) {
    const durationScore = duration >= 15 && duration <= 60 ? 0.5 : 0.2;
    const resScore = width >= 1920 ? 0.3 : 0.1;
    const dlScore = normalize(downloads, 100_000) * 0.2;
    return parseFloat((durationScore + resScore + dlScore).toFixed(4));
}

module.exports = { calculateViralScore, estimateViralScoreFromMetadata, normalize };
