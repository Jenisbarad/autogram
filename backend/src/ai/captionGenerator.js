/**
 * AI Caption Generator — 100% Free Providers
 *
 * Provider priority (set AI_PROVIDER in .env):
 *
 *  1. "groq"    → Groq API (LLaMA 3.3 70B) — FREE, no credit card
 *                 Sign up: https://console.groq.com  (30 req/min free)
 *
 *  2. "gemini"  → Google Gemini Flash 2.0 — FREE via AI Studio
 *                 Get key: https://aistudio.google.com/apikey (15 req/min free)
 *
 *  3. "ollama"  → Local Ollama (100% offline, unlimited, zero cost)
 *                 Install: https://ollama.com  then: ollama pull llama3
 *
 *  4. "template"→ Smart template-based captions (no API at all)
 *                 Always works as final fallback
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Template-based caption fallback (no API required) ────────────────────────
const CAPTION_TEMPLATES = {
    nature: [
        "POV: You found paradise 🌿\nNature never disappoints. Save this for your next trip!\nFollow {username} for more hidden gems 🌊",
        "The world is too beautiful to stay inside 🏔️\nTag someone who needs to see this!\nFollow {username} for daily nature dose 🌿",
        "When nature hits different 🌅\nSome places have to be seen to be believed.\nDouble tap if you'd visit! → Follow {username}",
    ],
    cricket: [
        "That moment when cricket goes CRAZY 🏏🔥\nThis one's for the fans!\nFollow {username} for the best cricket content 🏆",
        "Cricket at its finest 🏏✨\nWho else got goosebumps watching this?\nFollow {username} for daily cricket highlights",
        "POV: You just witnessed cricket history 🏏\nSave this clip! 👀\nFollow {username} for more epic moments",
    ],
    memes: [
        "This one had me DEAD 😂💀\nTag someone who needs this energy!\nFollow {username} for daily laughs 🔥",
        "POV: This is my whole personality 😅\nRelatable? Drop a comment! 👇\nFollow {username} for more memes",
        "Nobody:\nAbsolutely nobody:\nMe: 😂\nFollow {username} for the funniest content",
    ],
    quotes: [
        "Read this twice 📖✨\nSave this for when you need motivation!\nFollow {username} for daily inspiration 💪",
        "This hit different today 💭\nTag someone who needs to hear this!\nFollow {username} for wisdom daily 🌟",
        "Words that change your mindset 🧠✨\nSave this reminder!\nFollow {username} for more",
    ],
    travel: [
        "Pack your bags 🧳✈️\nThis destination just went to the top of my list!\nFollow {username} for travel inspo daily",
        "POV: Your dream destination 🌏\nWould you travel here? Comment below! 👇\nFollow {username} for wanderlust content",
        "Some places words can't describe 🌊\nNeed to see it to believe it!\nFollow {username} for travel goals",
    ],
    food: [
        "This is GIVING everything 😋🔥\nWho's making this tonight? Tag a friend!\nFollow {username} for food content daily",
        "POV: The most satisfying thing you'll see today 😍\nSave this recipe!\nFollow {username} for foodie content",
        "Okay but why does this look SO GOOD 🤤\nLike if you'd eat this right now!\nFollow {username} for more food content",
    ],
    fitness: [
        "No excuses, just results 💪🔥\nSave this workout and try it!\nFollow {username} for daily fitness motivation",
        "Your future self will thank you 💪\nProgress is progress, no matter how small!\nFollow {username} for fitness inspo",
        "POV: You actually go to the gym today 🏋️\nLet's get it! 🔥\nFollow {username} for workout content",
    ],
    default: [
        "This is the content you needed today ✨\nSave this and share!\nFollow {username} for more",
        "POV: You just found your new favorite account 🔥\nFollow {username} for daily content!",
        "Okay this is TOO good 👀\nDouble tap if this made your day!\nFollow {username} for more 🌟",
    ],
};

const HASHTAG_TEMPLATES = {
    nature: '#nature #naturephotography #wildlife #travel #outdoors #explore #earthpix #natgeo #beautiful #scenery #landscape #mountains #waterfall #forest #naturelover #viral #reels #trending #fyp #explorepage',
    cricket: '#cricket #ipl #bcci #cricketlovers #cricketfans #cricketmatch #sixes #boundaries #cricketworld #t20 #testcricket #crickethighlights #viral #reels #trending #fyp #sports #cricketlife',
    memes: '#memes #funny #funnyvideos #humor #comedy #lol #memesdaily #funnymemes #trending #viral #reels #fyp #relatable #funnyreels #explore #laughs #entertainment',
    quotes: '#quotes #motivation #inspiration #mindset #success #positivity #quotestoliveby #dailyquotes #motivationalquotes #lifequotes #wisdom #mindfulness #viral #reels #trending #fyp',
    travel: '#travel #travelgram #wanderlust #explore #adventure #travelblogger #instatravel #vacation #travelphoto #beautifuldestinations #viral #reels #trending #fyp #travelphotography',
    food: '#food #foodie #foodphotography #delicious #yummy #foodlover #recipe #cooking #foodblogger #instafood #homecooking #tasty #viral #reels #trending #fyp #foodreels',
    fitness: '#fitness #gym #workout #fitnessmotivation #fit #health #training #bodybuilding #exercise #fitlife #healthylifestyle #gains #viral #reels #trending #fyp #fitnessreels',
    music: '#music #musician #guitar #singing #song #viral #reels #trending #fyp #musicvideo #livemusic #musiclover #artist #cover #musically',
    fashion: '#fashion #style #ootd #outfit #fashionblogger #streetstyle #clothing #trending #viral #reels #fyp #instafashion #fashionista #lookbook',
    tech: '#tech #technology #gadgets #ai #innovation #coding #programming #software #viral #reels #trending #fyp #techlover #techreview',
    default: '#viral #trending #reels #fyp #explore #explorepage #foryou #foryoupage #tiktok #instagram #content #creator',
};

function getTemplate(category, username) {
    const key = category?.toLowerCase();
    const templates = CAPTION_TEMPLATES[key] || CAPTION_TEMPLATES.default;
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace(/{username}/g, username || 'us');
}

function getHashtags(category) {
    const key = category?.toLowerCase();
    return HASHTAG_TEMPLATES[key] || HASHTAG_TEMPLATES.default;
}

// ─── Groq Provider (FREE — https://console.groq.com) ─────────────────────────
async function generateWithGroq({ category, topic, username }) {
    const { default: Groq } = require('groq-sdk');
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = buildPrompt(category, topic, username);
    const completion = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',   // Free model on Groq
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.85,
    });
    return completion.choices[0]?.message?.content || '';
}

// ─── Gemini Flash Provider (FREE — https://aistudio.google.com/apikey) ────────
async function generateWithGemini({ category, topic, username }) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // gemini-2.0-flash is free on the free tier
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(buildPrompt(category, topic, username));
    return result.response.text();
}

// ─── Ollama Provider (LOCAL — https://ollama.com, completely free) ────────────
async function generateWithOllama({ category, topic, username }) {
    const axios = require('axios');
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: buildPrompt(category, topic, username),
        stream: false,
        options: { temperature: 0.85, num_predict: 350 },
    }, { timeout: 60000 });
    return response.data?.response || '';
}

function buildPrompt(category, topic, username) {
    return `You are an Instagram content creator for the "${category}" niche.
Write an engaging Instagram Reel caption for: "${topic}"

Rules:
- Hook on line 1 (POV/question/bold statement)
- 2-3 lines max body
- 1-2 relevant emojis
- End with: "Follow @${username} for more!"
- New blank line, then 15-18 hashtags for ${category} niche
- Output ONLY caption + hashtags, nothing else
`.trim();
}

function splitCaptionAndHashtags(fullText) {
    const lines = fullText.trim().split('\n');
    const hashIdx = lines.findIndex(l => l.trim().startsWith('#'));
    const caption = (hashIdx > 0 ? lines.slice(0, hashIdx) : lines).join('\n').trim();
    const hashtags = hashIdx > 0 ? lines.slice(hashIdx).join(' ').trim() : '';
    return { caption, hashtags };
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Generate caption + hashtags.
 * Tries AI providers in order; falls back to smart templates if all fail.
 */
async function generateCaption({ category, topic, username }) {
    const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();

    const providers = [];

    // Build ordered list based on configured provider
    if (provider === 'groq' && process.env.GROQ_API_KEY) providers.push({ name: 'Groq', fn: generateWithGroq });
    if (provider === 'gemini' && process.env.GEMINI_API_KEY) providers.push({ name: 'Gemini', fn: generateWithGemini });
    if (provider === 'ollama') providers.push({ name: 'Ollama', fn: generateWithOllama });

    // Always try the others as fallback
    if (provider !== 'groq' && process.env.GROQ_API_KEY) providers.push({ name: 'Groq', fn: generateWithGroq });
    if (provider !== 'gemini' && process.env.GEMINI_API_KEY) providers.push({ name: 'Gemini', fn: generateWithGemini });
    if (provider !== 'ollama') providers.push({ name: 'Ollama', fn: generateWithOllama });

    for (const p of providers) {
        try {
            console.log(`  🤖 Generating caption via ${p.name}...`);
            const fullText = await p.fn({ category, topic, username });
            if (fullText && fullText.length > 20) {
                const { caption, hashtags } = splitCaptionAndHashtags(fullText);
                const finalHashtags = hashtags || getHashtags(category);
                console.log(`  ✅ Caption generated via ${p.name}`);
                return { caption, hashtags: finalHashtags };
            }
        } catch (err) {
            console.warn(`  ⚠️  ${p.name} failed: ${err.message}`);
        }
    }

    // Final fallback — template (always works, no internet needed)
    console.log('  📝 Using template caption (no AI provider configured)');
    return {
        caption: getTemplate(category, username),
        hashtags: getHashtags(category),
    };
}

module.exports = { generateCaption };
