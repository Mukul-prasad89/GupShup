import { Router } from 'express';
import { prisma } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.js';
import { httpError } from '../../middleware/error.js';
import { messageSchema } from '../../utils/validation.js';
import { publicUser } from '../../utils/sanitize.js';
import {
  assertConversationMember,
  assertCanMessage,
  directPairKey,
} from './conversation.policy.js';

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

// GET /api/conversations — my DMs with the other member + last message
conversationsRouter.get('/', async (req, res, next) => {
  try {
    const memberships = await prisma.conversationMember.findMany({
      where: { userId: req.user.id },
      include: {
        conversation: {
          include: {
            members: { include: { user: true } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    res.json({
      conversations: memberships.map((m) => {
        const other = m.conversation.members.find((x) => x.userId !== req.user.id)?.user;
        return {
          id: m.conversation.id,
          type: m.conversation.type,
          updatedAt: m.conversation.updatedAt,
          other: publicUser(other),
          lastMessage: m.conversation.messages[0] ?? null,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations/direct/:userId — create or return canonical DM
conversationsRouter.post('/direct/:userId', async (req, res, next) => {
  try {
    const otherId = String(req.params.userId);
    if (otherId === req.user.id) throw httpError(400, 'Cannot message yourself');
    const other = await prisma.user.findUnique({ where: { id: otherId } });
    if (!other) throw httpError(404, 'User not found');
    await assertCanMessage(req.user.id, otherId);

    const pairKey = directPairKey(req.user.id, otherId);
    let convo = await prisma.conversation.findUnique({ where: { pairKey } });
    if (!convo) {
      convo = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          pairKey,
          members: { create: [{ userId: req.user.id }, { userId: otherId }] },
        },
      });
    }
    res.status(201).json({ conversation: { id: convo.id, other: publicUser(other) } });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id/messages?cursor=&limit= — cursor pagination (createdAt+id)
conversationsRouter.get('/:id/messages', async (req, res, next) => {
  try {
    const convoId = String(req.params.id);
    await assertConversationMember(req.user.id, convoId);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 30), 1), 100);
    const cursor = req.query.cursor ? String(req.query.cursor) : null;

    const messages = await prisma.message.findMany({
      where: {
        conversationId: convoId,
        deletedAt: null,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: { sender: true },
    });
    res.json({
      messages: messages.reverse().map((m) => ({
        ...m,
        sender: publicUser(m.sender),
      })),
      nextCursor: messages.length === limit ? messages[messages.length - 1]?.createdAt : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations/:id/messages — REST send (socket path also persists)
conversationsRouter.post('/:id/messages', async (req, res, next) => {
  try {
    const convoId = String(req.params.id);
    await assertConversationMember(req.user.id, convoId);
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const { content, clientMessageId } = parsed.data;

    if (clientMessageId) {
      const dup = await prisma.message.findUnique({ where: { clientMessageId } });
      if (dup) return res.json({ message: dup, deduped: true });
    }
    const saved = await prisma.message.create({
      data: { conversationId: convoId, senderId: req.user.id, content, clientMessageId },
    });
    await prisma.conversation.update({ where: { id: convoId }, data: { updatedAt: new Date() } });
    res.status(201).json({ message: saved });
  } catch (err) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Duplicate message' });
    next(err);
  }
});
