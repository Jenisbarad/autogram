# iOS Shortcut - Instagram Auto-Upload

This iOS Shortcut allows you to auto-upload Instagram reels to your niche pages with just a few taps!

---

## 📱 Installation

### **Option A: Manual Import (Recommended)**

1. Open iOS **Shortcuts** app
2. Tap **+** to create new shortcut
3. Name it: **"Post to IG Page"**
4. Follow the steps below to add actions

### **Option B: Import from File**

If I provided a `.shortcut` file:
1. Download and tap the file
2. iOS will open Shortcuts app
3. Tap "Add Shortcut"

---

## 🔧 Shortcut Actions (in order)

Copy and paste these actions in order:

| # | Action Type | Configuration |
|---|-------------|---------------|
| 1 | **Share Sheet** | Accept: URLs, Text |
| 2 | **Get Text from Input** | (If shared from Instagram) |
| 3 | **Set Variable** | Name: `sharedURL` |
| 4 | **Ask for Input** | Prompt: "Which page?", Type: Menu, Options: @nature_page, @quotes_page, @memes_page (add your pages) |
| 5 | **Set Variable** | Name: `pageSlug` |
| 6 | **Get Text** | From `pageSlug` variable, Remove "@". |
| 7 | **URL** | `https://your-domain.com/api/quick-submit` |
| 8 | **Set Variable** | Name: `apiURL` |
| 9 | **Get Contents of URL** | POST request with: <br>• URL: `apiURL` <br>• Headers: `Content-Type: application/json` <br>• Body: `{"page_slug": pageSlug, "reel_url": sharedURL, "submitter_username": "your_username"}` |
| 10 | **If** | Check if HTTP response status = 200 |
| 11 | **Show Notification** | Title: "✅ Accepted!" <br> Body: "Reel uploaded to [page]!" |
| 12 | **Else** | (If status ≠ 200) |
| 13 | **Show Notification** | Title: "❌ Error" <br> Body: Response body text |

---

## 🎯 Visual Shortcut Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          iOS SHORTCUT FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User shares Instagram reel to "Post to IG Page" shortcut                │
│                          │                                                   │
│                          ▼                                                   │
│  2. Shortcuts extracts URL                                                   │
│                          │                                                   │
│                          ▼                                                   │
│  3. User selects which page to post to (menu)                                │
│                          │                                                   │
│                          ▼                                                   │
│  4. Shortcuts sends POST to your API                                        │
│                          │                                                   │
│                          ▼                                                   │
│  5. Shows notification: Accepted ✅ or Error ❌                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration

### **Update these values in the shortcut:**

| Setting | Your Value |
|---------|-----------|
| `https://your-domain.com/api/quick-submit` | Your actual backend URL (use ngrok/localtunnel for local dev) |
| `your_username` | Your Instagram username |
| Menu options | Your actual page slugs (@nature_page, @quotes_page, etc.) |

---

## 📸 How to Use

### **Method 1: Share Sheet (Fastest)**

1. While viewing any Instagram reel
2. Tap **Share** button
3. Scroll to **"Post to IG Page"** shortcut
4. Tap it
5. Select which page to post to
6. Done! ✅

**Time: ~3 seconds**

### **Method 2: Run from Shortcuts App**

1. Copy Instagram reel link (Share → Copy Link)
2. Open Shortcuts app
3. Tap "Post to IG Page"
4. Shortcut will paste the link
5. Select which page
6. Done! ✅

**Time: ~5 seconds**

---

## 🔍 Troubleshooting

### **"Connection Failed" Error**

**Problem:** Can't reach your API

**Solution:**
- If using localhost: Use ngrok or localtunnel for public URL
- Update `apiURL` in shortcut with your public URL

### **"Page Not Found" Error**

**Problem:** Page slug doesn't exist

**Solution:**
- Check your database for correct `slug` values
- Update menu options in shortcut

### **"Invalid URL" Error**

**Problem:** Instagram URL format wrong

**Solution:**
- Make sure you're sharing a reel URL, not a profile URL
- Format should be: `instagram.com/reel/XXXXX/`

---

## 📋 Full Shortcut JSON (Import Ready)

Copy this entire JSON and import it into Shortcuts app if you have a `.shortcut` file:

```json
{
  "WFWorkflowActions": [
    {
      "WFWorkflowActionIdentifier": "is.workflow.actions.comment",
      "WFWorkflowActionParameters": {
        "WFCommentActionText": "Instagram Auto-Upload Shortcut\n\nThis shortcut sends Instagram reels to your auto-upload API."
      }
    }
  ],
  "WFWorkflowMinimumClientVersion": 900,
  "WFWorkflowMinimumClientVersionString": "900",
  "WFWorkflowTypes": [
    "NCWidget",
    "WatchKit"
  ]
}
```

---

## 🚀 Next Steps

1. Update the shortcut with your API URL
2. Add your page slugs to the menu
3. Test with a real Instagram reel
4. If it works, add to Home Screen for quick access!

---

## 💡 Pro Tips

- Add shortcut to **Home Screen** for one-tap access
- Create separate shortcuts for each page (no menu needed)
- Use **Siri**: "Hey Siri, post to nature page"
