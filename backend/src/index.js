require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
require('express-async-errors');

const accountsRouter = require('./api/accounts');
const postsRouter = require('./api/posts');
const contentRouter = require('./api/content');
const analyticsRouter = require('./api/analytics');
const publishRouter = require('./api/publish');
const submissionsRouter = require('./api/submissions');
const quickSubmitRouter = require('./api/quickSubmit');
const botWebhookRouter = require('./api/botWebhook');
const { setupBullBoard } = require('./queue/jobQueue');
const { startWorkers } = require('./queue/workers');
const { runAllDMChecks } = require('./queue/dmSubmissionWorker');
const { testConnection, migrate } = require('./db');

const authRouter = require('./api/auth');
const adminAuthRouter = require('./api/adminAuth');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, process.env.FRONTEND_URL || 'http://localhost:3000');
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ─── Static Media Files ───────────────────────────────────
const mediaPath = path.resolve(process.env.MEDIA_STORAGE_PATH || './media');
app.use('/media', express.static(mediaPath));

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/admin', adminAuthRouter);
app.use('/api/quick-submit', quickSubmitRouter);
app.use('/api/bot', botWebhookRouter);
app.use('/accounts', accountsRouter);
app.use('/posts', postsRouter);
app.use('/publish', publishRouter);
app.use('/submissions', submissionsRouter);
app.use('/analytics', analyticsRouter);
app.use('/', contentRouter);

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Bull Board (Queue Dashboard) ────────────────────────
const { serverAdapter } = setupBullBoard();
app.use('/bull-board', serverAdapter.getRouter());

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ─── Start Server ─────────────────────────────────────────
async function start() {
  try {
    await testConnection();
    console.log('✅ Database connected');

    // Run migrations on startup ( Railway deployment )
    try {
      await migrate();
      console.log('✅ Database migrations completed');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('✅ Database tables already exist');
      } else {
        console.warn('⚠️ Migration warning:', err.message);
      }
    }

    startWorkers();
    console.log('✅ BullMQ workers started');

    app.listen(PORT, async () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📊 Bull Board: http://localhost:${PORT}/bull-board`);

      // Start tunnelmole for Instagram API Webhooks & Public Media access (bypasses localtunnel's anti-bot screen)
      // DISABLED: Using ngrok manually instead to avoid conflicts
      // try {
      //   const tunnelmoleModule = await import('tunnelmole');
      //   const tunnelmole = tunnelmoleModule.tunnelmole;
      //   const url = await tunnelmole({ port: PORT });
      //   process.env.PUBLIC_BACKEND_URL = url;
      //   console.log(`🌍 Public Tunnel URL: ${url}`);
      // } catch (err) {
      //   console.error('❌ Failed to start tunnel:', err.message);
      // }

      // Prefer an explicit public URL from the environment.
      // Railway should set PUBLIC_BACKEND_URL to the live service URL.
      if (!process.env.PUBLIC_BACKEND_URL) {
        if (process.env.NODE_ENV !== 'production') {
          process.env.PUBLIC_BACKEND_URL = `http://localhost:${PORT}`;
        } else {
          console.warn('⚠️ PUBLIC_BACKEND_URL is not set; public media/webhook links may fail');
        }
      }
      if (process.env.PUBLIC_BACKEND_URL) {
        console.log(`🌍 Public URL: ${process.env.PUBLIC_BACKEND_URL}`);
      }

      // ─── Instagram DM Submission Worker ──────────────────
      // Run immediately on start, then every 5 minutes
      const DM_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes
      setTimeout(async () => {
        await runAllDMChecks();
        setInterval(runAllDMChecks, DM_POLL_INTERVAL);
      }, 10000); // Small 10s delay to let server fully warm up
      console.log(`📩 Instagram DM submission worker scheduled (every 5 minutes)`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
