import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { httpError } from '../../middleware/error.js';

export const followRequestsRouter = Router();
followRequestsRouter.use(requireAuth);

const sendLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

// POST /api/follow-requests/:userId — send (or re-send after REJECTED/CANCELLED)
followRequestsRouter.post('/:userId', sendLimiter, async (req, res, next) => {
  try {
    const receiverId = String(req.params.userId);
    if (receiverId === req.user.id) throw httpError(400, 'Cannot send a request to yourself');
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw httpError(404, 'User not found');

    const existing = await prisma.followRequest.findUnique({
      where: { senderId_receiverId: { senderId: req.user.id, receiverId } },
    });
    if (existing?.status === 'PENDING') throw httpError(409, 'Request already pending');
    if (existing?.status === 'ACCEPTED') throw httpError(409, 'Already connected');

    let row;
    if (!existing) {
      row = await prisma.followRequest.create({
        data: { senderId: req.user.id, receiverId, status: 'PENDING' },
      });
    } else {
      // REJECTED/CANCELLED -> new PENDING request reusing the pair row
      row = await prisma.followRequest.update({
        where: { id: existing.id },
        data: { status: 'PENDING', respondedAt: null },
      });
    }
    res.status(201).json({ request: row });
  } catch (err) {
    next(err);
  }
});

followRequestsRouter.get('/received', async (req, res, next) => {
  try {
    const rows = await prisma.followRequest.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { sender: true },
    });
    res.json({
      requests: rows.map((r) => ({
        ...r,
        sender: r.sender ? { id: r.sender.id, name: r.sender.name, username: r.sender.username } : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

followRequestsRouter.get('/sent', async (req, res, next) => {
  try {
    const rows = await prisma.followRequest.findMany({
      where: { senderId: req.user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { receiver: true },
    });
    res.json({
      requests: rows.map((r) => ({
        ...r,
        receiver: r.receiver
          ? { id: r.receiver.id, name: r.receiver.name, username: r.receiver.username }
          : null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/follow-requests/:id { action: 'accept' | 'reject' } — receiver only
followRequestsRouter.patch('/:id', async (req, res, next) => {
  try {
    const action = String(req.body?.action ?? '').toLowerCase();
    if (!['accept', 'reject'].includes(action)) throw httpError(400, 'action must be accept or reject');
    const row = await prisma.followRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!row) throw httpError(404, 'Request not found');
    if (row.receiverId !== req.user.id) throw httpError(403, 'Only the receiver can respond');
    if (row.status !== 'PENDING') throw httpError(409, `Request is already ${row.status.toLowerCase()}`);

    if (action === 'reject') {
      const updated = await prisma.followRequest.update({
        where: { id: row.id },
        data: { status: 'REJECTED', respondedAt: new Date() },
      });
      return res.json({ request: updated });
    }

    // Accept inside a transaction: request -> ACCEPTED + mutual Follow rows.
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.followRequest.update({
        where: { id: row.id },
        data: { status: 'ACCEPTED', respondedAt: new Date() },
      });
      // Directional follow: sender follows receiver AND receiver follows sender
      // so either side can open the DM (mutual connection).
      await tx.follow.upsert({
        where: { followerId_followingId: { followerId: row.senderId, followingId: row.receiverId } },
        update: {},
        create: { followerId: row.senderId, followingId: row.receiverId },
      });
      await tx.follow.upsert({
        where: { followerId_followingId: { followerId: row.receiverId, followingId: row.senderId } },
        update: {},
        create: { followerId: row.receiverId, followingId: row.senderId },
      });
      return updated;
    });
    res.json({ request: result });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/follow-requests/:id — sender cancels own pending request
followRequestsRouter.delete('/:id', async (req, res, next) => {
  try {
    const row = await prisma.followRequest.findUnique({ where: { id: String(req.params.id) } });
    if (!row) throw httpError(404, 'Request not found');
    if (row.senderId !== req.user.id) throw httpError(403, 'Only the sender can cancel');
    if (row.status !== 'PENDING') throw httpError(409, `Request is already ${row.status.toLowerCase()}`);
    const updated = await prisma.followRequest.update({
      where: { id: row.id },
      data: { status: 'CANCELLED', respondedAt: new Date() },
    });
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
});
