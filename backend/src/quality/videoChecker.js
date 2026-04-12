const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const MIN_RESOLUTION = parseInt(process.env.MIN_RESOLUTION) || 480;
const MIN_DURATION = parseFloat(process.env.MIN_DURATION_SECONDS) || 3;
const MAX_DURATION = parseFloat(process.env.MAX_DURATION_SECONDS) || 90;

/**
 * Probe a video file with FFmpeg and return metadata.
 * @param {string} filePath
 * @returns {Promise<object>} { width, height, duration, codec, bitrate }
 */
function probeVideo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            const stream = metadata.streams?.find(s => s.codec_type === 'video');
            if (!stream) return reject(new Error('No video stream found'));
            resolve({
                width: stream.width,
                height: stream.height,
                duration: parseFloat(metadata.format?.duration || '0'),
                codec: stream.codec_name,
                bitrate: parseInt(metadata.format?.bit_rate || '0'),
                format: metadata.format?.format_name,
            });
        });
    });
}

/**
 * Check if video meets quality requirements.
 * Returns { pass, reason, metadata }
 */
async function checkQuality(filePath) {
    let meta;
    try {
        meta = await probeVideo(filePath);
    } catch (err) {
        return { pass: false, reason: `FFprobe error: ${err.message}`, metadata: null };
    }

    const { width, height, duration } = meta;
    const minDim = Math.min(width, height);

    if (!width || !height) {
        return { pass: false, reason: 'Could not read video dimensions', metadata: meta };
    }
    if (minDim < MIN_RESOLUTION) {
        return { pass: false, reason: `Resolution too low: ${width}x${height} (min ${MIN_RESOLUTION}p)`, metadata: meta };
    }
    if (duration < MIN_DURATION) {
        return { pass: false, reason: `Too short: ${duration.toFixed(1)}s (min ${MIN_DURATION}s)`, metadata: meta };
    }
    if (duration > MAX_DURATION) {
        return { pass: false, reason: `Too long: ${duration.toFixed(1)}s (max ${MAX_DURATION}s)`, metadata: meta };
    }

    return {
        pass: true,
        reason: 'OK',
        metadata: meta,
        resolution: `${width}x${height}`,
    };
}

module.exports = { checkQuality, probeVideo };
