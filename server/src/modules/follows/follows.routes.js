import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { publicUser } from '../../utils/sanitize.js';

export const followsRouter = Router();
followsRouter.use(requireAuth);

// GET /api/follows — users I follow (mutual connections after accept)
followsRouter.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      include: { following: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ follows: rows.map((r) => publicUser(r.following)) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/follows/:userId — remove connection (both directions)
followsRouter.delete('/:userId', async (req, res, next) => {
  try {
    const otherId = String(req.params.userId);
    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: { followerId: req.user.id, followingId: otherId },
      }),
      prisma.follow.deleteMany({
        where: { followerId: otherId, followingId: req.user.id },
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
