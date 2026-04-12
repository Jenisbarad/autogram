const { execSync, execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');

const execFileAsync = promisify(execFile);

function commandExists(command) {
    try {
        const lookupCommand = process.platform === 'win32' ? `where ${command}` : `command -v ${command}`;
        execSync(lookupCommand, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function getYtDlpCommand() {
    const envPath = process.env.YT_DLP_PATH;
    if (envPath && fs.existsSync(envPath)) {
        return {
            command: envPath,
            prefixArgs: [],
            display: envPath,
        };
    }

    const binaryCandidates = [
        '/root/.local/bin/yt-dlp',
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
    ];

    for (const filePath of binaryCandidates) {
        if (fs.existsSync(filePath)) {
            return {
                command: filePath,
                prefixArgs: [],
                display: filePath,
            };
        }
    }

    if (commandExists('yt-dlp')) {
        return {
            command: 'yt-dlp',
            prefixArgs: [],
            display: 'yt-dlp (PATH)',
        };
    }

    const pythonCandidates = ['python3', 'python'];
    for (const pythonCmd of pythonCandidates) {
        if (!commandExists(pythonCmd)) continue;
        try {
            execSync(`${pythonCmd} -m yt_dlp --version`, { stdio: 'ignore' });
            return {
                command: pythonCmd,
                prefixArgs: ['-m', 'yt_dlp'],
                display: `${pythonCmd} -m yt_dlp`,
            };
        } catch {
            // Try next python candidate
        }
    }

    throw new Error(
        'yt-dlp is not installed. Install it in runtime image (Railway/Nixpacks: add "yt-dlp" to nixPkgs) or set YT_DLP_PATH.'
    );
}

async function execYtDlp(args, options = {}) {
    const ytDlp = getYtDlpCommand();
    return execFileAsync(ytDlp.command, [...ytDlp.prefixArgs, ...args], options);
}

module.exports = { getYtDlpCommand, execYtDlp };
