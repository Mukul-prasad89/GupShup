import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { updateMeSchema } from '../../utils/validation.js';
import { publicUser } from '../../utils/sanitize.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

// GET /api/users — all registered profiles except self (for discovery lists)
usersRouter.get('/', async (req, res, next) => {
  try {
    const take = Math.min(Math.max(Number(req.query.limit ?? 50), 1), 100);
    const users = await prisma.user.findMany({
      where: { NOT: { id: req.user.id } },
      take,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/search', async (req, res, next) => {
  try {
    const q = String(req.query.q ?? '').trim().slice(0, 60);
    if (q.length < 2) return res.json({ users: [] });
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q.toLowerCase(), mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
        ],
        NOT: { id: req.user.id },
      },
      take: 20,
      orderBy: { username: 'asc' },
    });
    res.json({ users: users.map(publicUser) });
  } catch (err) {
    next(err);
  }
});

usersRouter.get('/:username', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: String(req.params.username).toLowerCase() },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch('/me', async (req, res, next) => {
  try {
    const data = updateMeSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
      },
    });
    res.json({ user: publicUser(user) });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid input' });
    next(err);
  }
});
