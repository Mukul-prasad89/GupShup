import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../config/db.js';
import { requireAuth, signToken, authCookieOptions } from '../../middleware/auth.js';
import { loginSchema, registerSchema } from '../../utils/validation.js';
import { publicUser } from '../../utils/sanitize.js';
import { loginUser, registerUser } from './auth.service.js';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

authRouter.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);
    const token = signToken(user.id);
    res.cookie('gupshup_token', token, authCookieOptions());
    res.status(201).json({ user, token });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid input' });
    return next(err);
  }
});

authRouter.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await loginUser(data);
    const token = signToken(user.id);
    res.cookie('gupshup_token', token, authCookieOptions());
    res.json({ user, token });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid input' });
    return next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('gupshup_token', { path: '/' });
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: publicUser(user) });
});
