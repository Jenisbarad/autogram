/**
 * Advanced Video Processor with Copyright Avoidance
 *
 * Transformations applied to make content unique:
 * 1. Smart 9:16 crop with subtle zoom animation
 * 2. Watermark overlay (page branding)
 * 3. Mirror flip (50% chance)
 * 4. Speed change (1.05x - 1.15x)
 * 5. Color adjustment
 * 6. Optional: Clip mashup (combining multiple clips)
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { PROC_DIR, THUMB_DIR } = require('../downloader/mediaDownloader');

/**
 * Get font path for watermark (cross-platform)
 */
function getFontPath() {
    const fontPaths = [
        '/Windows/Fonts/arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/TTF/DejaVuSans.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        path.join(process.env.SYSTEMROOT || 'C:\\Windows', 'Fonts', 'arial.ttf'),
    ];

    for (const fontPath of fontPaths) {
        if (fs.existsSync(fontPath)) {
            return fontPath;
        }
    }

    console.warn('⚠️ No suitable font found for watermark, using default');
    return 'Arial';
}

/**
 * Generate random transformation parameters
 */
function generateRandomTransforms() {
    return {
        shouldMirror: Math.random() > 0.9,             // 10% chance only
        speedFactor: Math.random() > 0.8               // mostly keep original speed
            ? (1.005 + Math.random() * 0.015)          // 1.005 - 1.02x
            : 1.0,
        contrast: 1.0 + (Math.random() * 0.03 - 0.015), // 0.985 - 1.015
        brightness: Math.random() * 0.016 - 0.008,      // -0.008 - 0.008
        saturation: 1.0 + (Math.random() * 0.04 - 0.02), // 0.98 - 1.02
        zoomIntensity: 0,                                // disabled by default (keeps frame natural)
    };
}

/**
 * Process video with copyright-avoidance transformations
 * @param {string} inputPath - raw video path
 * @param {string} outputId - unique ID for output file
 * @param {string} watermarkText - e.g. "@naturepage"
 * @param {object} options - optional transformation overrides
 * @returns {Promise<{ outputPath, thumbnailPath, transforms }>}
 */
async function processVideo(inputPath, outputId, watermarkText = '@page', options = {}) {
    // Use forward slashes for FFmpeg compatibility on Windows
    const outputPath = path.join(PROC_DIR, `${outputId}_processed.mp4`).replace(/\\/g, '/');
    const thumbnailPath = path.join(THUMB_DIR, `${outputId}_thumb.jpg`);

    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input video file not found: ${inputPath}`);
    }

    // Generate or use provided transforms
    const transforms = options.transforms || generateRandomTransforms();

    console.log(`🎬 [VideoProcessor] Applying transformations:`);
    console.log(`   Mirror: ${transforms.shouldMirror ? 'Yes' : 'No'}`);
    console.log(`   Speed: ${transforms.speedFactor.toFixed(3)}x`);
    console.log(`   Zoom: ${(transforms.zoomIntensity * 100).toFixed(1)}%`);

    // Build filter complex
    const filters = [];

    // Filter 1: Mirror flip (if enabled)
    if (transforms.shouldMirror && !options.disableMirror) {
        filters.push('hflip');
    }

    // Filter 2: Scale + center crop to stable vertical framing.
    // This avoids tiny-strip/black-frame artifacts from dynamic expressions.
    filters.push('scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos');

    // Filter 3: Crop to exact 9:16
    filters.push('crop=1080:1920');

    // Filter 4: Subtle zoom animation (pan effect)
    if (transforms.zoomIntensity > 0 && !options.disableZoom) {
        // Create a subtle zoom-in effect over the video duration (escape colons for Windows)
        const zValue = transforms.zoomIntensity.toFixed(4);
        filters.push(`zoompan=z=min(zoom+${zValue}\\,1.08):d=1:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=1080x1920:fps=30`);
    }

    // Filter 5: Color adjustments
    if (!options.disableColorAdjust) {
        filters.push(`eq=contrast=${transforms.contrast.toFixed(3)}:brightness=${transforms.brightness.toFixed(3)}:saturation=${transforms.saturation.toFixed(3)}`);
        // Light sharpening keeps details crisp after scaling/compression.
        filters.push('unsharp=5:5:0.35:3:3:0.0');
    }

    // Filter 6: Watermark overlay (bottom-right with shadow)
    // Note: fontfile parameter causes issues on Windows FFmpeg, using default font
    const escapedText = watermarkText.replace(/'/g, "\\'").replace(/:/g, '\\:').replace(/\\/g, '\\\\');

    filters.push(`drawtext=text='${escapedText}':fontsize=42:fontcolor=white@0.85:x=w-tw-40:y=h-th-60:shadowcolor=black@0.7:shadowx=2:shadowy=2`);

    // Keep all transforms in a single video filter graph.
    if (Math.abs(transforms.speedFactor - 1.0) > 0.01 && !options.disableSpeed) {
        filters.push(`setpts=${(1 / transforms.speedFactor).toFixed(4)}*PTS`);
    }

    return new Promise((resolve, reject) => {
        const command = ffmpeg(inputPath)
            .videoFilters(filters.join(','))
            .audioCodec('aac')
            .videoCodec('libx264')
            .outputOptions([
                '-preset', 'medium',
                '-crf', '17',
                '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p',
                '-profile:v', 'high',
                '-level', '4.1',
                '-maxrate', '12M',
                '-bufsize', '24M',
                '-r', '30',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-map_metadata', '-1',
            ]);

        // Apply speed change
        if (Math.abs(transforms.speedFactor - 1.0) > 0.01 && !options.disableSpeed) {
            // For audio, use atempo (can only do 0.5x to 2x, so chain multiple if needed)
            if (transforms.speedFactor >= 0.5 && transforms.speedFactor <= 2.0) {
                command.audioFilters(`atempo=${transforms.speedFactor.toFixed(3)}`);
            } else if (transforms.speedFactor > 2.0) {
                // Chain two atempo filters for >2x speed
                command.audioFilters(`atempo=2.0,atempo=${(transforms.speedFactor / 2).toFixed(3)}`);
            }
        }

        command
            .outputOptions('-y')  // Overwrite output file without asking
            .output(outputPath)
            .on('start', cmd => {
                console.log(`🎬 FFmpeg processing: ${outputId}`);
                console.log(`🎬 Full FFmpeg command:`, cmd);
                console.log(`🎬 Output path:`, outputPath);
            })
            .on('end', async () => {
                console.log(`✅ Video processed: ${outputPath}`);
                try {
                    await generateThumbnail(inputPath, thumbnailPath);
                } catch (e) {
                    console.warn('Thumbnail generation failed:', e.message);
                }
                resolve({ outputPath, thumbnailPath, transforms });
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err.message);
                if (fs.existsSync(outputPath)) {
                    try {
                        fs.unlinkSync(outputPath);
                    } catch (e) {
                        console.warn('Failed to cleanup partial file:', e.message);
                    }
                }
                reject(new Error(`Video processing failed: ${err.message}`));
            });

        command.run();
    });
}

/**
 * Generate a JPEG thumbnail from video at 1 second mark
 */
function generateThumbnail(inputPath, thumbnailPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .screenshots({
                timestamps: ['1'],
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: '540x960',
            })
            .on('end', resolve)
            .on('error', reject);
    });
}

/**
 * Create a mashup of multiple clips into one reel
 * @param {string[]} inputPaths - Array of video file paths
 * @param {string} outputId - unique ID for output file
 * @param {string} watermarkText - watermark text
 * @returns {Promise<{ outputPath, thumbnailPath }>}
 */
async function createMashup(inputPaths, outputId, watermarkText = '@page') {
    const outputPath = path.join(PROC_DIR, `${outputId}_mashup.mp4`);
    const thumbnailPath = path.join(THUMB_DIR, `${outputId}_thumb.jpg`);

    if (inputPaths.length < 2) {
        throw new Error('Mashup requires at least 2 input videos');
    }

    // Verify all input files exist
    for (const inputPath of inputPaths) {
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input video file not found: ${inputPath}`);
        }
    }

    console.log(`🎬 [VideoProcessor] Creating mashup from ${inputPaths.length} clips`);

    // First, process each clip individually
    const processedClips = [];
    for (let i = 0; i < inputPaths.length; i++) {
        const clipId = `${outputId}_clip_${i}`;
        const processed = await processVideo(
            inputPaths[i],
            clipId,
            watermarkText,
            { disableZoom: true, disableMirror: i > 0 } // Only mirror first clip
        );
        processedClips.push(processed.outputPath);
    }

    // Concatenate clips
    return new Promise((resolve, reject) => {
        const command = ffmpeg();

        // Add all processed clips as inputs
        processedClips.forEach(clip => {
            command.addInput(clip);
        });

        // Filter for concatenation
        // First, scale all to same size, then concat
        const filterComplex = processedClips.map((_, i) =>
            `[${i}:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}];`
        ).join('') + processedClips.map((_, i) => `[${i}:a]aresample=async=1:first_pts=0[a${i}];`).join('');

        const concatInputs = processedClips.map((_, i) => `[v${i}][a${i}]`).join('');
        filterComplex += `${concatInputs}concat=n=${processedClips.length}:v=1:a=1[outv][outa]`;

        command
            .complexFilter(filterComplex)
            .map('[outv]')
            .videoCodec('libx264')
            .map('[outa]')
            .audioCodec('aac')
            .outputOptions([
                '-preset', 'fast',
                '-crf', '23',
                '-movflags', '+faststart',
            ])
            .output(outputPath)
            .on('start', cmd => console.log(`🎬 FFmpeg mashup: ${outputId}`))
            .on('end', async () => {
                console.log(`✅ Mashup created: ${outputPath}`);
                // Clean up intermediate clips
                for (const clip of processedClips) {
                    try {
                        if (fs.existsSync(clip)) fs.unlinkSync(clip);
                    } catch (e) {
                        console.warn(`Failed to cleanup intermediate clip: ${e.message}`);
                    }
                }
                try {
                    await generateThumbnail(outputPath, thumbnailPath);
                } catch (e) {
                    console.warn('Thumbnail generation failed:', e.message);
                }
                resolve({ outputPath, thumbnailPath });
            })
            .on('error', (err) => {
                console.error('FFmpeg mashup error:', err.message);
                if (fs.existsSync(outputPath)) {
                    try {
                        fs.unlinkSync(outputPath);
                    } catch (e) {}
                }
                reject(new Error(`Mashup failed: ${err.message}`));
            })
            .run();
    });
}

module.exports = {
    processVideo,
    createMashup,
    generateThumbnail,
    generateRandomTransforms,
    getFontPath
};
