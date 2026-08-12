import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initSchema } from './db/database.js';
import routes from './routes/index.js';
import { fail } from './utils/helpers.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;
const clientDist = path.join(__dirname, '../../client/dist');
const isProd = process.env.NODE_ENV === 'production';

initSchema();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL === '*' ? true : process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'India Pay Now' });
});

app.use('/api', routes);

if (isProd && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((_req, res) => fail(res, 'Route not found', 404));
app.use((err, _req, res, _next) => {
  console.error(err);
  fail(res, err.message || 'Internal server error', err.status || 500);
});

app.listen(PORT, () => {
  console.log(`India Pay Now API running on http://localhost:${PORT}`);
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount === 0) {
    console.log('Database empty — run: npm run seed');
  }
});
