require('dotenv').config();
const { pool } = require('./src/db');
const { publishToInstagram } = require('./src/publisher/instagramPublisher');
const { generateCaption } = require('./src/ai/captionGenerator');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);

const REEL_URL = 'https://www.instagram.com/reel/DSlz_WXCVIs/?igsh=b2hoYWgycHVhZ2Ru';
const SUBMITTER = 'jenis_barad';

async function run() {
  // Get cricketpulse1111 account
  const res = await pool.query(
    "SELECT * FROM instagram_accounts WHERE username ILIKE '%cricket%' OR page_name ILIKE '%cricket%' ORDER BY id LIMIT 1"
  );

  if (!res.rows.length) {
    const all = await pool.query("SELECT id, page_name, username FROM instagram_accounts");
    console.log('Available accounts:');
    console.table(all.rows);
    console.log('Please check the account_id manually above');
    await pool.end();
    return;
  }

  const account = res.rows[0];
  console.log(`✅ Account: ${account.page_name} (ID: ${account.id}) | IG User ID: ${account.instagram_user_id}`);
  console.log(`   Allowed Submitters: ${JSON.stringify(account.allowed_submitters)}`);
  console.log(`   Has Token: ${!!account.access_token}\n`);

  if (!account.access_token || !account.instagram_user_id) {
    console.error('❌ Missing access_token or instagram_user_id for this account!');
    await pool.end();
    return;
  }

  // Generate AI caption
  let caption = `🏏 Incredible cricket reel by @${SUBMITTER}! Don't miss this one! 🔥`;
  let hashtags = '#cricket #ipl #cricketlovers #virathkohli #reels #cricketshorts';
  try {
    const captionData = await generateCaption({ category: account.category, source: 'instagram', title: `Cricket reel by @${SUBMITTER}` });
    caption = captionData.caption || caption;
    hashtags = captionData.hashtags || hashtags;
    console.log('✅ Caption generated:', caption.slice(0, 80) + '...');
  } catch (e) {
    console.warn('⚠️  Caption fallback:', e.message);
  }

  // Download the reel 
  const outputId = uuidv4();
  const MEDIA_BASE = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
  const rawPath = path.join(MEDIA_BASE, 'raw', `${outputId}.mp4`);
  const procPath = path.join(MEDIA_BASE, 'processed', `${outputId}.mp4`);

  console.log('\n⬇️  Downloading reel from Instagram...');
  console.log('   URL:', REEL_URL);

  try {
    await execFileAsync('yt-dlp', [
      REEL_URL,
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '--postprocessor-args', 'ffmpeg:-c:v libx264 -c:a aac -movflags +faststart',
      '-o', rawPath,
      '--no-playlist',
      '--socket-timeout', '30',
      '--add-header', 'User-Agent:Mozilla/5.0',
    ], { timeout: 120000 });

    if (fs.existsSync(rawPath)) {
      fs.copyFileSync(rawPath, procPath);
      const size = fs.statSync(procPath).size;
      console.log(`✅ Downloaded: ${(size / 1024 / 1024).toFixed(2)} MB → ${procPath}`);
    } else {
      console.error('❌ Download step completed but no file found at:', rawPath);
      await pool.end();
      return;
    }
  } catch (err) {
    console.error('❌ Download FAILED:', err.message);
    fs.writeFileSync('test_submit_result.json', JSON.stringify({ error: 'download_failed', message: err.message }));
    await pool.end();
    return;
  }

  // Build public URL
  const publicBase = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
  const publicUrl = `${publicBase}/media/processed/${outputId}.mp4`;
  console.log('\n📤 Publishing to Instagram...');
  console.log('   Media URL:', publicUrl);

  try {
    const result = await publishToInstagram({
      access_token: account.access_token,
      instagram_user_id: account.instagram_user_id,
      media_url: publicUrl,
      caption: `${caption}\n\n${hashtags}`,
    });

    console.log('\n🎉 SUCCESS! Published to Instagram!');
    console.log('   Post ID:', result.instagram_post_id);
    console.log('   Permalink:', result.permalink);

    // Save to DB
    await pool.query(
      `INSERT INTO posts (account_id, category, media_url, caption, hashtags, source, source_url, status, instagram_media_id, published_at)
       VALUES ($1, $2, $3, $4, $5, 'instagram_submission', $6, 'published', $7, NOW())`,
      [account.id, account.category, publicUrl, caption, hashtags, REEL_URL, result.instagram_post_id]
    );
    console.log('   Saved to DB ✅');

    fs.writeFileSync('test_submit_result.json', JSON.stringify({ success: true, post_id: result.instagram_post_id, permalink: result.permalink }));
  } catch (err) {
    const errMsg = err.message || String(err);
    console.error('❌ Publish FAILED:', errMsg);
    fs.writeFileSync('test_submit_result.json', JSON.stringify({ error: 'publish_failed', message: errMsg }));
  }

  await pool.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
