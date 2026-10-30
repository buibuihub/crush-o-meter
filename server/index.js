import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import './db.js';
import { authRouter } from './routes/auth.js';
import { analyzeRouter, imagesRouter } from './routes/analyze.js';
import { boardsRouter } from './routes/boards.js';
import { searchCelebrities } from './serper.js';
import { AppError, asyncHandler, cleanString, createRateLimit } from './utils.js';

const app = express();
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(express.json({ limit: '64kb' }));

const authLimiter = createRateLimit({ windowMs: 15 * 60 * 1000, max: 40, scope: 'auth' });
const aiLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 20, scope: 'ai' });
const imageLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 120, scope: 'images' });
const searchLimiter = createRateLimit({ windowMs: 10 * 60 * 1000, max: 60, scope: 'search' });

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    services: {
      openrouter: Boolean(config.openRouterKey),
      serper: Boolean(config.serperKey),
    },
  });
});

app.get(
  '/api/search-celeb',
  searchLimiter,
  asyncHandler(async (req, res) => {
    const query = cleanString(req.query.q, 80);
    if (!query) {
      throw new AppError(400, 'INVALID_QUERY', 'Enter a celebrity name to search.');
    }
    res.json(await searchCelebrities(query));
  }),
);

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRouter);
app.use('/api/analyze', aiLimiter, analyzeRouter);
app.use('/api/images', imageLimiter, imagesRouter);
app.use('/api/boards', boardsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'API endpoint not found.' },
  });
});

if (fs.existsSync(path.join(config.distPath, 'index.html'))) {
  app.use(express.static(config.distPath, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(config.distPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({
      name: 'Crush-O-Meter API',
      message: 'Build the frontend with npm run build, or use npm run dev.',
    });
  });
}

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'The request body was not valid JSON.' },
    });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'That request is too large.' },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  console.error('[server] Unhandled error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side. Please try again.',
    },
  });
});

app.listen(config.port, () => {
  console.log(`Crush-O-Meter server listening on http://localhost:${config.port}`);
  if (!config.openRouterKey) {
    console.warn('[config] OPENROUTER_API_KEY is missing — AI analysis is disabled.');
  }
  if (!config.serperKey) {
    console.warn('[config] SERPER_API_KEY is missing — Pinterest moodboards are disabled.');
  }
  if (!config.isProduction && !process.env.JWT_SECRET) {
    console.warn('[config] JWT_SECRET is using the development fallback. Set one in .env.');
  }
});
