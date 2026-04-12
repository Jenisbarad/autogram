const { execSync } = require('child_process');
const fs = require('fs');

// Find yt-dlp executable in common locations
function getYtDlpPath() {
    const possiblePaths = [
        '/root/.local/bin/yt-dlp',
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
        'yt-dlp' // fallback to PATH
    ];

    for (const path of possiblePaths) {
        if (path === 'yt-dlp') {
            // Check if yt-dlp is in PATH
            try {
                execSync('which yt-dlp', { stdio: 'ignore' });
                return 'yt-dlp';
            } catch {
                continue;
            }
        }

        if (fs.existsSync(path)) {
            return path;
        }
    }

    return 'yt-dlp'; // fallback
}

module.exports = { getYtDlpPath };
