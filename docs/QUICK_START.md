# 🚀 Quick Start - Instagram Auto-Upload

Get your Instagram auto-upload system running in 10 minutes!

---

## ⚡ 3-Minute Setup (Fastest Path)

### **Step 1: Start Your Backend**

```bash
cd backend
npm install
npm run dev
```

### **Step 2: Get a Public URL**

**Option A: Ngrok (Recommended for testing)**
```bash
npx ngrok http 4000
# Copy the HTTPS URL
```

**Option B: Tunnelmole (Already built-in!)**
Your backend already starts tunnelmole automatically!
Check your console for: `🌍 Public Tunnel URL: https://xyz.tunnelmole.net`

### **Step 3: Update Environment**

```bash
# In backend/.env
PUBLIC_BACKEND_URL=https://your-ngrok-url-here
```

### **Step 4: Test with API**

```bash
curl -X POST https://your-url.com/api/quick-submit \
  -H "Content-Type: application/json" \
  -d '{
    "page_slug": "nature_page",
    "reel_url": "https://www.instagram.com/reel/C1234567890/",
    "submitter_username": "test"
  }'
```

**That's it!** Your system is ready. 🎉

---

## 📱 Add Telegram Bot (5 minutes)

### **1. Create Bot**
- Telegram → @BotFather → `/newbot`
- Copy the token

### **2. Configure**
```bash
# backend/.env
TELEGRAM_BOT_TOKEN=your_token_here
```

### **3. Setup Webhook**
```bash
curl "https://your-url.com/api/bot/webhook/telegram/setup?webhook_url=https://your-url.com/api/bot/webhook/telegram"
```

### **4. Test**
Send to your bot: `/start`

---

## 🍎 Add iOS Shortcut (3 minutes)

### **Method: Manual Setup**

1. Open **Shortcuts** app
2. Create new shortcut
3. Add actions:
   - Share Sheet (accept URLs)
   - Set Variable: `reelURL`
   - Choose from Menu: `@nature_page`, `@quotes_page`
   - Set Variable: `pageSlug`
   - Get Contents of URL:
     - URL: `https://your-url.com/api/quick-submit`
     - Method: POST
     - Body: `{"page_slug": pageSlug, "reel_url": reelURL}`
   - Show Notification on success

4. Name: **"Post to IG Page"**

Done! Now you can share any Instagram reel directly to this shortcut.

---

## ✅ Test Complete System

### **Test 1: API**
```bash
curl -X POST https://your-url.com/api/quick-submit \
  -H "Content-Type: application/json" \
  -d '{"page_slug": "nature_page", "reel_url": "https://www.instagram.com/reel/test/", "submitter_username": "you"}'
```

### **Test 2: Telegram**
Send to bot: `post @nature_page https://www.instagram.com/reel/test/`

### **Test 3: iOS Shortcut**
1. Open any Instagram reel
2. Share → "Post to IG Page"
3. Select page
4. Check notification

---

## 📋 Checklist

Before starting, make sure you have:

- [ ] Node.js installed
- [ ] PostgreSQL installed & running
- [ ] At least one Instagram account configured in database
- [ ] Instagram Graph API access token
- [ ] Public URL (ngrok or real domain)

---

## 🎯 What Gets Auto-Applied

Every submitted reel automatically gets:

✅ Downloaded from Instagram
✅ Smart cropped to 9:16
✅ Mirror flipped (50% random)
✅ Speed adjusted (1.0-1.15x)
✅ Color adjusted
✅ Watermark added (`@your_page`)
✅ AI-generated caption
✅ Posted to Instagram

---

## 📖 Full Documentation

- [Complete Bot Setup Guide](./BOT_SETUP_GUIDE.md)
- [iOS Shortcut Guide](./ios-shortcut/README.md)
- [API Documentation](../backend/src/api/)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection failed" | Check PUBLIC_BACKEND_URL is correct |
| "Page not found" | Check database for correct `slug` value |
| "Invalid URL" | Make sure it's `instagram.com/reel/` URL |
| Bot doesn't respond | Check webhook is registered correctly |

---

## 🚀 You're Ready!

Your Instagram auto-upload system is now fully operational with:

- ✅ Quick Submit API
- ✅ Telegram Bot (optional)
- ✅ iOS Shortcut (optional)
- ✅ Auto transformations
- ✅ AI captions

Happy automating! 🎉
