require('dotenv').config();
const axios = require('axios');
const { pool } = require('./src/db');
const fs = require('fs');

const IG_GRAPH_API = 'https://graph.facebook.com/v25.0';
const output = {};

async function testDMWorker() {
  const result = await pool.query(
    "SELECT * FROM instagram_accounts WHERE is_active = TRUE AND allowed_submitters IS NOT NULL ORDER BY id LIMIT 1"
  );

  if (!result.rows.length) {
    output.error = 'No accounts with allowed_submitters found';
    return;
  }

  const account = result.rows[0];
  output.account = {
    page_name: account.page_name,
    username: account.username,
    instagram_user_id: account.instagram_user_id,
    has_token: !!account.access_token,
    allowed_submitters: account.allowed_submitters,
  };

  // Test Tags API
  try {
    const r = await axios.get(`${IG_GRAPH_API}/${account.instagram_user_id}/tags`, {
      params: { access_token: account.access_token, fields: 'id,media_type,username,permalink,timestamp' },
      timeout: 15000,
    });
    output.tags_api = { success: true, count: r.data?.data?.length, items: r.data?.data?.slice(0,3) };
  } catch (err) {
    output.tags_api = { success: false, error: err.response?.data?.error?.message || err.message, code: err.response?.data?.error?.code };
  }

  // Test Mentioned Media API
  try {
    const r = await axios.get(`${IG_GRAPH_API}/${account.instagram_user_id}/mentioned_media`, {
      params: { access_token: account.access_token, fields: 'media_type,username,permalink,timestamp' },
      timeout: 15000,
    });
    output.mentioned_api = { success: true, count: r.data?.data?.length, items: r.data?.data?.slice(0,3) };
  } catch (err) {
    output.mentioned_api = { success: false, error: err.response?.data?.error?.message || err.message, code: err.response?.data?.error?.code };
  }
}

testDMWorker()
  .catch(e => { output.fatal = e.message; })
  .finally(async () => {
    fs.writeFileSync('test_dm_result.json', JSON.stringify(output, null, 2));
    console.log('DONE - result saved to test_dm_result.json');
    await pool.end().catch(() => {});
  });
