const axios = require('axios');

const IG_GRAPH_API = 'https://graph.facebook.com/v25.0';

/**
 * Publish a Reel to Instagram using the Graph API
 *
 * Steps:
 * 1. Create container
 * 2. Poll until FINISHED
 * 3. Publish reel
 */

async function publishToInstagram({
    access_token,
    instagram_user_id,
    media_url,
    caption
}) {

    if (!access_token || !instagram_user_id) {
        throw new Error('Missing Instagram credentials');
    }

    if (!media_url || !media_url.startsWith('http')) {
        throw new Error('media_url must be a public HTTP/HTTPS URL');
    }

    console.log(`📤 STEP 1 — Creating media container...`);

    // STEP 1: Create container
    let containerResp;

    try {
        containerResp = await axios.post(
            `${IG_GRAPH_API}/${instagram_user_id}/media`,
            null,
            {
                params: {
                    access_token,
                    media_type: 'REELS',
                    video_url: media_url,
                    caption: caption || ''
                }
            }
        );
    } catch (err) {
        const metaError = err.response?.data?.error?.message || err.message;
        throw new Error(`Meta API Container Error: ${metaError}`);
    }

    const creation_id = containerResp.data?.id;

    if (!creation_id) {
        throw new Error('Failed to create media container');
    }

    console.log(`📦 Container created: ${creation_id}`);


    // STEP 2: Wait until FINISHED
    console.log(`⏳ STEP 2 — Waiting for media processing...`);

    const MAX_POLLS = 30; // 150 seconds
    const POLL_INTERVAL = 5000;

    let isFinished = false;

    for (let i = 0; i < MAX_POLLS; i++) {

        await sleep(POLL_INTERVAL);

        try {

            const statusResp = await axios.get(
                `${IG_GRAPH_API}/${creation_id}`,
                {
                    params: {
                        access_token,
                        fields: 'status_code,status'
                    }
                }
            );

            const statusCode = statusResp.data?.status_code;

            console.log(`🔄 Status check ${i + 1}/${MAX_POLLS}: ${statusCode}`);

            if (statusCode === 'FINISHED') {
                isFinished = true;
                break;
            }

            if (statusCode === 'ERROR' || statusCode === 'EXPIRED') {
                throw new Error(`Media processing failed: ${statusCode}`);
            }

        } catch (err) {
            console.log(`⚠️ Status check error: ${err.message}`);
        }
    }

    if (!isFinished) {
        throw new Error('Timeout waiting for media processing');
    }


    // STEP 3: Publish Reel
    console.log(`🚀 STEP 3 — Publishing reel...`);

    let publishResp;
    const PUBLISH_RETRIES = 3;

    for (let i = 0; i < PUBLISH_RETRIES; i++) {

        try {

            publishResp = await axios.post(
                `${IG_GRAPH_API}/${instagram_user_id}/media_publish`,
                null,
                {
                    params: {
                        access_token,
                        creation_id
                    }
                }
            );

            break;

        } catch (err) {

            if (i === PUBLISH_RETRIES - 1) {
                const metaError = err.response?.data?.error?.message || err.message;
                throw new Error(`Publish failed: ${metaError}`);
            }

            console.log(`⚠️ Publish retry ${i + 1}/${PUBLISH_RETRIES}`);
            await sleep(4000);
        }
    }

    const instagram_post_id = publishResp.data?.id;

    if (!instagram_post_id) {
        throw new Error('Publish succeeded but no post ID returned');
    }

    console.log(`✅ Reel published! Post ID: ${instagram_post_id}`);


    // STEP 4: Try fetching permalink
    let permalink = null;

    for (let i = 0; i < 5; i++) {

        try {

            const resp = await axios.get(
                `${IG_GRAPH_API}/${instagram_post_id}`,
                {
                    params: {
                        access_token,
                        fields: 'permalink'
                    }
                }
            );

            if (resp.data?.permalink) {
                permalink = resp.data.permalink;
                break;
            }

        } catch (err) {
            // ignore
        }

        await sleep(3000);
    }

    return {
        instagram_post_id,
        permalink,
        upload_status: 'SUCCESS'
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { publishToInstagram };