import http from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { conversationsRouter } from './modules/conversations/conversations.routes.js';
import { followRequestsRouter } from './modules/followRequests/followRequests.routes.js';
import { followsRouter } from './modules/follows/follows.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { attachSocket } from './sockets/io.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(
  '/api/',
  rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: 'draft-7' }),
);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'gupshup-api' }));

// DB-touching warmup: wakes Neon compute + primes Prisma pool. Safe to call often.
app.get('/api/warm', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'warming', db: 'starting' });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/follow-requests', followRequestsRouter);
app.use('/api/follows', followsRouter);
app.use('/api/conversations', conversationsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const server = http.createServer(app);
attachSocket(server);

server.listen(env.port, () => {
  console.log(`GupShup API + Socket.IO on http://localhost:${env.port}`);
});
