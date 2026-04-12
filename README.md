# 📷 InstaAutogram — Multi-Instagram Automation Platform

A production-ready web platform to manage multiple Instagram pages, discover viral content automatically, preview it on a moderation dashboard, and post it with one click.

> **🆓 100% Free** — No paid APIs required. Every service used is free or open-source.

---

## 🧾 What You Need to Provide

Before you run the platform, collect the API keys below. All are **free** — nothing costs money.

### 🔑 API Keys (copy into `backend/.env`)

| # | Key | Where to Get | Required? |
|---|-----|--------------|-----------|
| 1 | **Groq API Key** (`GROQ_API_KEY`) | Sign up free → [console.groq.com](https://console.groq.com) → *API Keys* | ✅ Yes (or use Gemini/Ollama) |
| 2 | **Gemini API Key** (`GEMINI_API_KEY`) | Sign up free → [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | ⚡ Alternative to Groq |
| 3 | **Pexels API Key** (`PEXELS_API_KEY`) | Sign up free → [pexels.com/api](https://www.pexels.com/api/) | ✅ Yes (for stock videos) |
| 4 | **Instagram Access Token** | [developers.facebook.com](https://developers.facebook.com) → create app → Graph API | ✅ Yes (to post) |
| 5 | **Instagram User ID** | Same Meta Developer app → Graph API Explorer | ✅ Yes (to post) |

> **Tip** — You only need **one** AI key (Groq **or** Gemini). Groq is faster and recommended.  
> No AI key at all? Set `AI_PROVIDER=template` and skip keys 1 & 2.

### 💻 Pre-installed Requirements

The following tools must be installed on your machine before you start (all free, one-time setup):

- ✅ **FFmpeg** — `choco install ffmpeg` (Windows) / `brew install ffmpeg` (Mac) / `sudo apt install ffmpeg` (Ubuntu)
- ✅ **yt-dlp** — `pip install yt-dlp`
- ✅ **PostgreSQL** — [postgresql.org/download](https://www.postgresql.org/download/)
- ✅ **Redis** — [redis.io/download](https://redis.io/download/) (Windows: use [Memurai](https://www.memurai.com/) or WSL)
- ✅ **Node.js 18+** — [nodejs.org](https://nodejs.org/)

---

## 🆓 All Free Services Used

| Service | What For | Cost | Get It |
|---------|----------|------|--------|
| **Groq API** | AI captions (LLaMA 3.3 70B) | FREE (30 req/min) | [console.groq.com](https://console.groq.com) |
| **Gemini Flash** | AI captions (alternative) | FREE (15 req/min) | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Ollama** | AI captions (local, unlimited) | FREE | [ollama.com](https://ollama.com) |
| **Pexels API** | Stock video discovery | FREE (200 req/hr) | [pexels.com/api](https://www.pexels.com/api/) |
| **Reddit JSON** | Video content scraping | FREE (no key needed) | — |
| **YouTube Shorts** | Video scraping via Playwright | FREE (no key needed) | — |
| **yt-dlp** | Max quality video download | FREE | `pip install yt-dlp` |
| **FFmpeg** | Video processing | FREE | [ffmpeg.org](https://ffmpeg.org) |
| **PostgreSQL** | Database | FREE | [postgresql.org](https://postgresql.org) |
| **Redis** | Job queue broker | FREE | [redis.io](https://redis.io) |
| **Instagram Graph API** | Publishing posts | FREE (Meta account) | [developers.facebook.com](https://developers.facebook.com) |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Python packages
pip install yt-dlp

# Install FFmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg

# Install Playwright browsers (after npm install)
npx playwright install chromium
```

### 1. Install All Dependencies

```bash
npm run install:all
```

### 2. Get Your Free API Keys

**Step 1 — Groq (AI captions, recommended)**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up free (no credit card)
3. Create API key → copy it

**Step 2 — Pexels (stock videos)**
1. Go to [pexels.com/api](https://www.pexels.com/api/)
2. Sign up free
3. Get your API key → copy it

**Step 3 — Instagram Graph API (for posting)**
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → set up Instagram Basic Display or Graph API
3. Get your Page Access Token and Instagram User ID

### 3. Configure Environment

```bash
# Copy and edit the backend config
copy .env.example backend\.env
```

Edit `backend\.env` — minimum required:
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here          # from console.groq.com (FREE)
PEXELS_API_KEY=your_pexels_key           # from pexels.com/api (FREE)
DB_PASSWORD=your_postgres_password
```

### 4. Create Database & Run Migrations

```bash
createdb insta_autogram
cd backend && npm run migrate
```

### 5. Start the Platform

```bash
# From root — starts both backend (4000) and frontend (3000)
npm run dev
```

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:3000 |
| **API** | http://localhost:4000 |
| **Queue Monitor** | http://localhost:4000/bull-board |
| **Media Files** | http://localhost:4000/media/ |

---

## 🤖 AI Caption Options (All Free)

Set `AI_PROVIDER` in `backend/.env`:

| Provider | Speed | Limit | Setup |
|----------|-------|-------|-------|
| `groq` | ⚡ Fastest | 30 req/min free | [console.groq.com](https://console.groq.com) |
| `gemini` | ⚡ Fast | 15 req/min free | [aistudio.google.com](https://aistudio.google.com/apikey) |
| `ollama` | 🏠 Local | ♾️ Unlimited | Install + `ollama pull llama3` |
| `template` | ✅ Instant | ♾️ Unlimited | No setup needed |

> **Tip**: Use `AI_PROVIDER=template` for completely zero-dependency operation — the system uses smart category-based templates and auto-generates hashtags without any API.

---

## 📁 Project Structure

```
insta-autogram/
├── backend/src/
│   ├── api/           # accounts, posts, publish, analytics, content
│   ├── crawler/       # YouTube + Reddit + Pexels discovery
│   ├── downloader/    # yt-dlp max quality download
│   ├── quality/       # FFmpeg: min 720p, 3-90s
│   ├── processing/    # FFmpeg: 9:16 crop + watermark
│   ├── ai/            # Groq/Gemini/Ollama/Template captions
│   ├── publisher/     # Instagram Graph API
│   ├── queue/         # BullMQ (7 jobs + Bull Board)
│   └── db/            # PostgreSQL schema + migrations
└── frontend/
    ├── app/
    │   ├── page.tsx                  # Home / account list
    │   ├── accounts/new/page.tsx     # Add account form
    │   ├── dashboard/[slug]/page.tsx # Per-page moderation dashboard
    │   └── analytics/page.tsx        # Analytics + charts
    └── components/
        ├── Sidebar.tsx               # Dynamic nav sidebar
        └── PostCard.tsx              # Video preview + publish/reject
```

---

## 🔄 Automation Pipeline

```
🔍 Find Content
    ↓
① Crawl  → YouTube Shorts + Reddit + Pexels (all free)
    ↓
② Download → yt-dlp best quality (free)
    ↓
③ Quality Filter → FFmpeg: ≥720p, 3-90s (free)
    ↓
④ Dedup → SHA256 hash check (never repost)
    ↓
⑤ Viral Score → engagement-weighted 0-1
    ↓
⑥ Process → FFmpeg: 9:16 crop + @watermark
    ↓
⑦ Caption → Groq / Gemini / Ollama / Template (all free)
    ↓
📋 Moderation Dashboard
    ↓
⑧ Publish → Instagram Graph API (free)
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/accounts/add` | Add Instagram page |
| GET | `/accounts` | List all pages |
| GET | `/accounts/slug/:slug` | Get page by slug |
| GET | `/accounts/:id/posts` | Posts (filter by status) |
| POST | `/find-content` | Trigger content discovery |
| POST | `/publish/publish-post` | Publish to Instagram |
| POST | `/publish/reject-post` | Reject a post |
| GET | `/analytics` | Analytics data |
| GET | `/bull-board` | Queue dashboard UI |

---

## ⚙️ Posting Modes

- **Manual** — Review and approve each post on the dashboard
- **Auto** — Posts automatically when `viral_score >= auto_viral_threshold`
