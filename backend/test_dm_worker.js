require('dotenv').config();
const axios = require('axios');
const { pool } = require('./src/db');

const IG_GRAPH_API = 'https://graph.facebook.com/v25.0';

async function testSubmissionWorker() {
  console.log('=== Instagram Submission Worker Test ===\n');

  // Get account from DB
  const result = await pool.query(
    "SELECT * FROM instagram_accounts WHERE is_active = TRUE AND allowed_submitters IS NOT NULL AND jsonb_array_length(allowed_submitters) > 0 LIMIT 1"
  );

  if (!result.rows.length) {
    console.log('❌ No accounts with allowed_submitters configured found in DB.');
    console.log('   Go to "Add Account" on the website and fill in "Allowed Submitters" field.');
    await pool.end();
    return;
  }

  const account = result.rows[0];
  console.log('✅ Account found:', account.page_name, '(@' + account.username + ')');
  console.log('   Allowed Submitters:', JSON.stringify(account.allowed_submitters));
  console.log('   Instagram User ID:', account.instagram_user_id);
  console.log('   Has Access Token:', !!account.access_token, '\n');

  if (!account.access_token || !account.instagram_user_id) {
    console.log('❌ Missing credentials. Please set access_token and instagram_user_id for this account.');
    await pool.end();
    return;
  }

  // Test 1: Tags API
  console.log('--- Test 1: GET /{ig-user-id}/tags ---');
  try {
    const tagsResp = await axios.get(`${IG_GRAPH_API}/${account.instagram_user_id}/tags`, {
      params: {
        access_token: account.access_token,
        fields: 'id,media_type,media_url,permalink,username,timestamp',
      },
      timeout: 15000,
    });
    const tagged = tagsResp.data?.data || [];
    console.log('✅ Tags API works! Found', tagged.length, 'tagged media items.');
    if (tagged.length > 0) {
      tagged.slice(0, 3).forEach(m => {
        console.log('  -', m.media_type, 'from @' + (m.username || 'unknown'), '-', m.permalink);
      });
    } else {
      console.log('   (No one has tagged this account in media yet)');
    }
  } catch (err) {
    const apiError = err.response?.data?.error;
    console.log('❌ Tags API FAILED:', apiError?.message || err.message);
    console.log('   Code:', apiError?.code, '| Type:', apiError?.type);
  }

  // Test 2: Mentioned Media API
  console.log('\n--- Test 2: GET /{ig-user-id}/mentioned_media ---');
  try {
    const mentionResp = await axios.get(`${IG_GRAPH_API}/${account.instagram_user_id}/mentioned_media`, {
      params: {
        access_token: account.access_token,
        fields: 'media_type,media_url,permalink,username,timestamp',
      },
      timeout: 15000,
    });
    const mentioned = mentionResp.data?.data || [];
    console.log('✅ Mentioned Media API works! Found', mentioned.length, 'mentions.');
    if (mentioned.length > 0) {
      mentioned.slice(0, 3).forEach(m => {
        console.log('  -', m.media_type, 'from @' + (m.username || 'unknown'), '-', m.permalink);
      });
    } else {
      console.log('   (No one has @mentioned this account in media captions yet)');
    }
  } catch (err) {
    const apiError = err.response?.data?.error;
    console.log('❌ Mentioned Media API FAILED:', apiError?.message || err.message);
    console.log('   Code:', apiError?.code, '| Type:', apiError?.type);
  }

  console.log('\n=== Summary ===');
  console.log('For the worker to auto-publish when jenis_barad sends a reel:');
  console.log('  Option 1: jenis_barad should TAG @' + account.username + ' in the reel (tag in video)');
  console.log('  Option 2: jenis_barad should MENTION @' + account.username + ' in the caption');
  console.log('The worker checks every 5 minutes and auto-publishes matching reels.');

  await pool.end();
}

testSubmissionWorker().catch(e => { console.error('Fatal error:', e.message); process.exit(1); });
