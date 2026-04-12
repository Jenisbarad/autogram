# 🤖 Complete Setup Guide - Instagram Auto-Upload Bots

This guide covers setting up BOTH Telegram Bot and iOS Shortcut for automatic Instagram reel uploads.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Telegram Bot Setup](#telegram-bot-setup)
3. [WhatsApp Bot Setup](#whatsapp-bot-setup)
4. [iOS Shortcut Setup](#ios-shortcut-setup)
5. [Testing Your Setup](#testing-your-setup)
6. [Troubleshooting](#troubleshooting)

---

## 📝 Prerequisites

### **Before Starting:**

1. **Backend Running**: Your backend must be running and accessible from internet
2. **Public URL**: You need a public URL (use ngrok/localtunnel for local dev)
3. **Database Configured**: At least one Instagram account configured in database

### **Required Environment Variables:**

Add to your `.env` file:

```env
# PUBLIC URL (REQUIRED)
PUBLIC_BACKEND_URL=https://your-domain.com

# TELEGRAM BOT (for Telegram setup)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# WHATSAPP (for WhatsApp setup)
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_id
```

---

## 📱 Telegram Bot Setup

### **Step 1: Create Telegram Bot**

1. Open Telegram and search for **@BotFather**
2. Send command: `/newbot`
3. Follow prompts:
   - Choose a name: `Instagram Auto-Upload Bot`
   - Choose a username: `your_bot_name_bot` (must end in `_bot`)
4. **Copy the token** BotFather gives you

### **Step 2: Configure Environment Variable**

Add to `.env`:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### **Step 3: Setup Webhook**

Replace `YOUR_PUBLIC_URL` with your actual domain:

```bash
curl -X GET "https://your-domain.com/api/bot/webhook/telegram/setup?webhook_url=https://your-domain.com/api/bot/webhook/telegram"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Telegram webhook registered"
}
```

### **Step 4: Test Your Bot**

1. Open your Telegram bot
2. Send: `/start`
3. You should see the help menu

### **Step 5: Submit Your First Reel**

1. Find any Instagram reel
2. Copy the link
3. Send to bot: `post @nature_page https://www.instagram.com/reel/xyz/`
4. Wait for confirmation

---

## 💬 WhatsApp Bot Setup

### **Step 1: Create Meta App**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app: **Business** type
3. Add product: **WhatsApp**
4. Complete setup wizard

### **Step 2: Get WhatsApp Credentials**

From your WhatsApp Dashboard:

1. **Phone Number ID**: From your WhatsApp phone number setup
2. **Access Token**: Create a system user with WhatsApp permissions
3. **Webhook Verify Token**: Create your own (any string, keep it secret)

### **Step 3: Configure Environment Variables**

Add to `.env`:
```env
WHATSAPP_VERIFY_TOKEN=your_secret_verify_token
WHATSAPP_ACCESS_TOKEN=your_access_token_from_meta
WHATSAPP_PHONE_ID=your_phone_number_id_from_meta
```

### **Step 4: Configure Webhook in Meta Dashboard**

1. Go to your app → WhatsApp → Configuration
2. Edit webhook:
   - **Webhook URL**: `https://your-domain.com/api/bot/webhook/whatsapp`
   - **Verify Token**: Same as `WHATSAPP_VERIFY_TOKEN`
3. Subscribe to webhook fields:
   - ✅ `messages`
4. Click "Verify and Save"

### **Step 5: Link WhatsApp Number**

In Meta Dashboard:
1. Go to WhatsApp → API Setup
2. Link your WhatsApp phone number
3. Send the verification message from your phone

### **Step 6: Test Your Bot**

1. Send a message to your WhatsApp business number
2. Send: `/start`
3. You should see the help menu

### **Step 7: Submit Your First Reel**

1. Find any Instagram reel
2. Share to your WhatsApp bot number
3. Send: `post @nature_page https://www.instagram.com/reel/xyz/`
4. Wait for confirmation

---

## 🍎 iOS Shortcut Setup

### **Method 1: Manual Setup (Most Reliable)**

#### **Step 1: Open Shortcuts App**

On your iPhone/iPad, open the **Shortcuts** app

#### **Step 2: Create New Shortcut**

1. Tap **+** (top right)
2. Tap "Add Action"
3. Search for "Share Sheet" and add it
4. Enable: "Accept from: Safari, Instagram"

#### **Step 3: Add Actions (in order)**

| Action | Configuration |
|--------|---------------|
| **Share Sheet** | Accept: URLs, Text |
| **Text** | (This extracts the shared URL) |
| **Set Variable** | Name: `reelURL` |
| **Choose from Menu** | Options: `@nature_page`, `@quotes_page`, `@memes_page` (add yours) |
| **Set Variable** | Name: `pageSlug` |
| **URL** | `https://your-domain.com/api/quick-submit` |
| **Set Variable** | Name: `apiURL` |
| **Get Contents of URL** | See detailed config below |

#### **Step 4: Configure "Get Contents of URL"**

- **URL**: `apiURL` (variable)
- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
- **Request Body**: `JSON`
- **Body Fields**:
  ```json
  {
    "page_slug": "Choose Variable: pageSlug",
    "reel_url": "Choose Variable: reelURL",
    "submitter_username": "your_insta_username"
  }
  ```

#### **Step 5: Add Success/Failure Handling**

1. **If** → Check if `Status Code` = `200`
2. **Show Notification** → Title: "✅ Accepted!", Body: "Reel uploaded!"
3. **Otherwise** → Show Notification → Title: "❌ Error"

#### **Step 6: Name and Save**

1. Name: "Post to IG Page"
2. Add to Home Screen (optional)
3. Done!

### **Method 2: Import Shortcut File**

If you have the `.shortcut` file:

1. AirDrop the file to your iPhone
2. Tap the file
3. Shortcuts app opens
4. Tap "Add Untrusted Shortcut"
5. Edit the shortcut and update:
   - Your API URL
   - Your Instagram username
   - Your page slugs

---

## 🧪 Testing Your Setup

### **Test Checklist:**

- [ ] Bot responds to `/start` command
- [ ] Bot responds to `/accounts` command (lists your pages)
- [ ] Submit a test reel
- [ ] Check database: Post should appear with `source = 'quick_submit'`
- [ ] Check Instagram: Reel should be posted
- [ ] Verify transformations applied (watermark, effects)

### **Test Commands:**

```bash
# Test Telegram webhook
curl -X POST https://your-domain.com/api/bot/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "/start", "chat": {"id": 123}, "from": {"username": "test"}}}'

# Test quick-submit API directly
curl -X POST https://your-domain.com/api/quick-submit \
  -H "Content-Type: application/json" \
  -d '{"page_slug": "nature_page", "reel_url": "https://www.instagram.com/reel/C12345/", "submitter_username": "test"}'

# Check bot status
curl https://your-domain.com/api/bot/status
```

---

## 🔧 Troubleshooting

### **Problem: Bot doesn't respond**

**Solution:**
1. Check backend logs: `npm run dev`
2. Verify webhook is registered (Telegram)
3. Check firewall/security group allows incoming webhooks
4. Verify PUBLIC_BACKEND_URL is correct

### **Problem: "Page not found" error**

**Solution:**
1. Check database for correct `slug` value
2. Run: `SELECT slug, page_name FROM instagram_accounts;`
3. Use exact `slug` value (without @)

### **Problem: "Invalid URL" error**

**Solution:**
1. Make sure URL is from `instagram.com/reel/` or `instagram.com/p/`
2. Copy full URL (including https://)
3. Check for typos in URL

### **Problem: Upload succeeds but reel not visible**

**Solution:**
1. Check Instagram token is valid
2. Verify Instagram account has posting permissions
3. Check backend logs for actual Instagram API response
4. Re-authenticate Instagram account if needed

### **Problem: Telegram webhook verification fails**

**Solution:**
1. Make sure you replaced `YOUR_PUBLIC_URL` with actual domain
2. Domain must have valid SSL certificate
3. Check domain is accessible from internet

### **Problem: iOS shortcut says "Connection Failed"**

**Solution:**
1. For local development: Use ngrok (`ngrok http 4000`)
2. Update shortcut with ngrok URL
3. Test API in browser first
4. Check iPhone has internet connection

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐                   │
│  │   YOU      │────▶│  TELEGRAM/   │────▶│  YOUR API   │                   │
│  │  (find     │     │  WHATSAPP    │     │  (backend)  │                   │
│  │   reel)    │     │     BOT      │     │             │                   │
│  └────────────┘     └──────────────┘     └──────┬──────┘                   │
│                                                 │                          │
│  ┌────────────┐                                │                          │
│  │ iOS Shortcut│───────────────────────────────┘                          │
│  └────────────┘                                                           │
│                                                  │                          │
│                                                  ▼                          │
│                                    ┌─────────────────────┐                 │
│                                    │  Quick Submit API   │                 │
│                                    │  /api/quick-submit  │                 │
│                                    └──────────┬──────────┘                 │
│                                               │                            │
│                                               ▼                            │
│                                    ┌─────────────────────┐                 │
│                                    │   Video Processing  │                 │
│                                    │   • Download        │                 │
│                                    │   • Transform       │                 │
│                                    │   • Watermark       │                 │
│                                    └──────────┬──────────┘                 │
│                                               │                            │
│                                               ▼                            │
│                                    ┌─────────────────────┐                 │
│                                    │  Instagram Publish  │                 │
│                                    │  (Graph API)        │                 │
│                                    └──────────┬──────────┘                 │
│                                               │                            │
│                                               ▼                            │
│                                    ┌─────────────────────┐                 │
│                                    │   ✅ POSTED!        │                 │
│                                    └─────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### **Telegram Bot Commands:**
- `/start` - Show help menu
- `/accounts` - List all pages
- `/post @page_slug <url>` - Submit a reel

### **WhatsApp Bot Commands:**
Same as Telegram

### **iOS Shortcut:**
1. Share Instagram reel to shortcut
2. Select page
3. Done!

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `npm run dev`
2. Test API directly with curl
3. Verify environment variables
4. Check database configuration

---

## ✅ You're All Set!

Your Instagram auto-upload system is now fully configured with:
- ✅ Telegram Bot
- ✅ WhatsApp Bot (optional)
- ✅ iOS Shortcut
- ✅ Web Dashboard (via `/api/quick-submit`)

Happy automating! 🚀
