import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function authCookieOptions() {
  const isProd = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

// Reads JWT from HttpOnly cookie `gupshup_token` or `Authorization: Bearer <t>`.
export async function requireAuth(req, res, next) {
  try {
    const fromCookie = req.cookies?.gupshup_token;
    const header = req.headers.authorization;
    const fromHeader = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const token = fromCookie ?? fromHeader;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
