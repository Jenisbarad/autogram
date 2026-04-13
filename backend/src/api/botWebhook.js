/**
 * Bot Webhook Handler
 *
 * Supports:
 * 1. Telegram Bot (via webhooks)
 * 2. WhatsApp Business API (via webhooks)
 * 3. Discord Bot (via webhooks)
 *
 * Message Format:
 * "post @page_slug <instagram_url>"
 * OR
 * "@page_slug <instagram_url>" (post command assumed)
 *
 * Example:
 * "post @nature_page https://www.instagram.com/reel/xyz/"
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { query } = require('../db');

// Bot configuration from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const RAILWAY_DOMAIN = process.env.RAILWAY_PUBLIC_DOMAIN;
const PUBLIC_BASE_URL = process.env.PUBLIC_BACKEND_URL
    || (RAILWAY_DOMAIN ? `https://${RAILWAY_DOMAIN}` : null);
const INTERNAL_BASE_URL = `http://127.0.0.1:${process.env.PORT || process.env.BACKEND_PORT || 4000}`;

// Quick Submit API URL (prefer explicit/public URL; fallback to internal localhost)
const QUICK_SUBMIT_URL = process.env.PUBLIC_QUICK_SUBMIT_URL
    || (PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL}/api/quick-submit` : `${INTERNAL_BASE_URL}/api/quick-submit`);

// ─────────────────────────────────────────────────────────────
// TELEGRAM BOT WEBHOOK
// ─────────────────────────────────────────────────────────────

/**
 * Setup Telegram webhook
 * Call this once to register your webhook with Telegram
 *
 * GET /api/bot/webhook/telegram/setup?webhook_url=https://your-domain.com/api/bot/webhook/telegram
 */
router.get('/webhook/telegram/setup', async (req, res) => {
    const { webhook_url } = req.query;

    if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    }

    if (!webhook_url) {
        return res.status(400).json({ error: 'webhook_url parameter required' });
    }

    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
            {
                url: webhook_url,
                allowed_updates: ['message'],
            }
        );

        res.json({
            success: true,
            message: 'Telegram webhook registered',
            telegram_response: response.data
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to register Telegram webhook',
            details: err.response?.data || err.message
        });
    }
});

/**
 * Telegram webhook endpoint
 * POST /api/bot/webhook/telegram
 */
router.post('/webhook/telegram', async (req, res) => {
    const message = req.body.message;

    // Always respond quickly to Telegram
    res.sendStatus(200);

    if (!message || !message.text) {
        return;
    }

    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from.id;
    const username = message.from.username || userId.toString();

    console.log(`📩 [Telegram Bot] Message from @${username} (${chatId}): ${text}`);

    // Process message asynchronously
    processBotMessage(text, username, chatId, 'telegram').catch(err => {
        console.error(`[Telegram Bot] Error:`, err.message);
        sendTelegramMessage(chatId, `❌ Error: ${err.message}`);
    });
});

/**
 * Send message to Telegram chat
 */
async function sendTelegramMessage(chatId, text) {
    if (!TELEGRAM_BOT_TOKEN) return;

    try {
        await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            }
        );
    } catch (err) {
        console.error(`[Telegram] Failed to send message:`, err.message);
    }
}

// ─────────────────────────────────────────────────────────────
// WHATSAPP BUSINESS API WEBHOOK
// ─────────────────────────────────────────────────────────────

/**
 * WhatsApp webhook verification (Meta requirement)
 * GET /api/bot/webhook/whatsapp?hub.verify_token=YOUR_TOKEN
 */
router.get('/webhook/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
        console.log('✅ [WhatsApp] Webhook verified');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

/**
 * WhatsApp webhook endpoint
 * POST /api/bot/webhook/whatsapp
 */
router.post('/webhook/whatsapp', async (req, res) => {
    // Always respond quickly
    res.sendStatus(200);

    const entry = req.body.entry?.[0];
    if (!entry) return;

    const changes = entry.changes?.[0];
    if (!changes || changes.field !== 'messages') return;

    const value = changes.value;
    const message = value.messages?.[0];
    if (!message || message.type !== 'text') return;

    const phone = message.from;
    const text = message.text.body;
    const contact = value.contacts?.[0];
    const username = contact?.profile?.name || phone;

    console.log(`📩 [WhatsApp Bot] Message from ${username} (${phone}): ${text}`);

    // Process message asynchronously
    processBotMessage(text, username, phone, 'whatsapp').catch(err => {
        console.error(`[WhatsApp Bot] Error:`, err.message);
        sendWhatsAppMessage(phone, `❌ Error: ${err.message}`);
    });
});

/**
 * Send message to WhatsApp number
 */
async function sendWhatsAppMessage(to, text) {
    const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!WHATSAPP_PHONE_ID || !WHATSAPP_ACCESS_TOKEN) return;

    try {
        await axios.post(
            `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to.replace('+', ''),
                text: { body: text }
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (err) {
        console.error(`[WhatsApp] Failed to send message:`, err.message);
    }
}

// ─────────────────────────────────────────────────────────────
// CORE MESSAGE PROCESSING
// ─────────────────────────────────────────────────────────────

/**
 * Parse and process bot message
 * @param {string} text - Message text
 * @param {string} username - Sender username
 * @param {string} chatId - Chat/channel ID
 * @param {string} platform - 'telegram' | 'whatsapp'
 */
async function processBotMessage(text, username, chatId, platform) {
    // Normalize text
    const cleanText = text.trim();

    // Handle /help command
    if (cleanText === '/help' || cleanText === '/start') {
        const helpMessage = `
🤖 <b>Instagram Auto-Upload Bot</b>

<b>Commands:</b>
/post @page_slug <instagram_url>
  Example: /post @nature_page https://www.instagram.com/reel/xyz/

@page_slug <instagram_url>
  Example: @quotes_page https://www.instagram.com/reel/abc/

/accounts
  List all available pages

<b>How to use:</b>
1. Find a reel on Instagram
2. Copy the link (Share → Copy Link)
3. Send to this bot with @page_name
4. Bot will auto-upload to that page!

<i>Made with ❤️</i>
        `.trim();

        if (platform === 'telegram') {
            await sendTelegramMessage(chatId, helpMessage);
        } else if (platform === 'whatsapp') {
            await sendWhatsAppMessage(chatId, helpMessage.replace(/<[^>]*>/g, '')); // Remove HTML for WhatsApp
        }
        return;
    }

    // Handle /accounts command
    if (cleanText === '/accounts' || cleanText === 'list') {
        const result = await query(
            `SELECT page_name, username, slug, category FROM instagram_accounts WHERE is_active = TRUE ORDER BY page_name`
        );

        let accountsList = '\n📄 <b>Available Pages:</b>\n\n';
        result.rows.forEach(acc => {
            accountsList += `• @${acc.slug} - ${acc.page_name} (${acc.category})\n`;
        });

        if (platform === 'telegram') {
            await sendTelegramMessage(chatId, accountsList);
        } else if (platform === 'whatsapp') {
            await sendWhatsAppMessage(chatId, accountsList.replace(/<[^>]*>/g, ''));
        }
        return;
    }

    // Parse submission message
    // Formats:
    // /post @page_slug url
    // post @page_slug url
    // @page_slug url
    const postRegex = /^(?:\/post\s+|post\s+)?@([\w.]+)\s+(https?:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p)\/[A-Za-z0-9_-]+(?:\/?(?:\?[^\s]+)?)?)/i;
    const match = cleanText.match(postRegex);

    if (!match) {
        const errorMessage = `❌ Invalid format.\n\nUse: /post @page_slug <instagram_url>\n\nExample: /post @nature_page https://www.instagram.com/reel/xyz/`;
        if (platform === 'telegram') {
            await sendTelegramMessage(chatId, errorMessage);
        } else if (platform === 'whatsapp') {
            await sendWhatsAppMessage(chatId, errorMessage);
        }
        return;
    }

    const pageSlug = match[1];
    const reelUrl = match[2];

    console.log(`[Bot] Processing: page=${pageSlug}, url=${reelUrl}, user=${username}`);

    // Send processing message
    const processingMsg = `⏳ Processing reel for @${pageSlug}...\n\nThis will take 30-60 seconds. You'll be notified when it's uploaded! 🚀`;
    if (platform === 'telegram') {
        await sendTelegramMessage(chatId, processingMsg);
    } else if (platform === 'whatsapp') {
        await sendWhatsAppMessage(chatId, processingMsg.replace(/⏳|🚀/g, ''));
    }

    try {
        // Call quick submit API
        const response = await axios.post(
            QUICK_SUBMIT_URL,
            {
                page_slug: pageSlug,
                reel_url: reelUrl,
                submitter_username: username
            },
            {
                timeout: 5000 // Don't wait too long for response
            }
        );

        if (response.data.success) {
            const successMsg = `✅ <b>Reel accepted!</b>\n\n📄 Page: ${response.data.page_name}\n📂 Category: ${response.data.category}\n\n⏰ Upload will complete in 30-60 seconds.\n\n💬 You'll get a confirmation when it's live!`;
            if (platform === 'telegram') {
                await sendTelegramMessage(chatId, successMsg);
            } else if (platform === 'whatsapp') {
                await sendWhatsAppMessage(chatId, successMsg.replace(/<[^>]*>/g, ''));
            }
        } else {
            throw new Error(response.data.error || 'Unknown error');
        }
    } catch (err) {
        const errorData = err.response?.data;
        const errorMsg = `❌ <b>Failed to submit reel</b>\n\n${errorData?.error || err.message}\n\nPlease check:\n• Page slug is correct\n• Instagram URL is valid\n• Bot has permission`;

        if (platform === 'telegram') {
            await sendTelegramMessage(chatId, errorMsg);
        } else if (platform === 'whatsapp') {
            await sendWhatsAppMessage(chatId, errorMsg.replace(/<[^>]*>/g, ''));
        }
    }
}

// ─────────────────────────────────────────────────────────────
// STATUS & HEALTH CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Get bot status and configuration
 */
router.get('/status', (req, res) => {
    const dynamicBaseUrl = PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    res.json({
        telegram: {
            configured: !!TELEGRAM_BOT_TOKEN,
            webhook_url: `${dynamicBaseUrl}/api/bot/webhook/telegram`
        },
        whatsapp: {
            configured: !!(WHATSAPP_VERIFY_TOKEN && process.env.WHATSAPP_ACCESS_TOKEN),
            webhook_url: `${dynamicBaseUrl}/api/bot/webhook/whatsapp`
        },
        quick_submit_url: QUICK_SUBMIT_URL
    });
});

module.exports = router;
