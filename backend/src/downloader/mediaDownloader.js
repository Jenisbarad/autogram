const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const MEDIA_DIR = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
const RAW_DIR = path.join(MEDIA_DIR, 'raw');
const PROC_DIR = path.join(MEDIA_DIR, 'processed');
const THUMB_DIR = path.join(MEDIA_DIR, 'thumbnails');

// Ensure directories exist
[MEDIA_DIR, RAW_DIR, PROC_DIR, THUMB_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Download media using yt-dlp at maximum quality.
 * Falls back to direct axios download for Pexels direct links.
 * @param {object} item - discovered content item
 * @param {string} outputId - unique output filename prefix
 * @returns {string} downloaded file path
 */
async function downloadMedia(item, outputId) {
    const outputTemplate = path.join(RAW_DIR, `${outputId}.%(ext)s`);

    // Direct download (Pexels etc.)
    if (item.direct_download && item.url?.startsWith('http')) {
        return directDownload(item.url, outputId);
    }

    // yt-dlp download with forced H.264+AAC (required by Instagram API)
    const args = [
        item.url,
        '-f', 'bestvideo[vcodec^=avc1]+bestaudio[acodec^=mp4a]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '--postprocessor-args', 'ffmpeg:-c:v libx264 -c:a aac -movflags +faststart',
        '-o', outputTemplate,
        '--no-playlist',
        '--no-warnings',
        '--socket-timeout', '30',
        '--retries', '3',
        '--max-filesize', `${process.env.MAX_FILE_SIZE_MB || 500}m`,
        '--quiet',
    ];

    console.log(`⬇️  Downloading (H.264+AAC forced): ${item.url}`);
    await execFileAsync('yt-dlp', args, { timeout: 120000 });

    // Find the downloaded file
    const files = fs.readdirSync(RAW_DIR).filter(f => f.startsWith(outputId));
    if (!files.length) throw new Error('yt-dlp: No file downloaded');

    const filePath = path.join(RAW_DIR, files[0]);
    console.log(`✅ Downloaded: ${filePath}`);
    return filePath;
}

/**
 * Direct HTTP download for CDN links (Pexels)
 */
async function directDownload(url, outputId) {
    const axios = require('axios');
    const filePath = path.join(RAW_DIR, `${outputId}.mp4`);
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 60000,
        headers: { 'User-Agent': 'InstaAutogram/1.0' },
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', () => { console.log(`✅ Direct downloaded: ${filePath}`); resolve(filePath); });
        writer.on('error', reject);
    });
}

module.exports = { downloadMedia, RAW_DIR, PROC_DIR, THUMB_DIR, MEDIA_DIR };
