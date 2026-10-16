import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { assertConversationMember } from '../modules/conversations/conversation.policy.js';

// In-memory per-socket message throttle (basic abuse guard).
const lastSendAt = new WeakMap();
function allowSend(socket) {
  const now = Date.now();
  const prev = lastSendAt.get(socket) ?? 0;
  if (now - prev < 400) return false;
  lastSendAt.set(socket, now);
  return true;
}

// In-memory presence for a single instance.
// For multi-instance: use @socket.io/redis-adapter + shared presence store (see README).
const onlineCounts = new Map();

export function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });

  // Authenticate every connection. Token via auth.token or HttpOnly cookie.
  io.use(async (socket, next) => {
    try {
      const fromAuth = socket.handshake.auth?.token;
      const cookieHeader = socket.handshake.headers?.cookie ?? '';
      const fromCookie = cookieHeader
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('gupshup_token='))
        ?.slice('gupshup_token='.length);
      const token = fromAuth ?? (fromCookie ? decodeURIComponent(fromCookie) : null);
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) return next(new Error('Unauthorized'));
      socket.userId = user.id;
      onlineCounts.set(user.id, (onlineCounts.get(user.id) ?? 0) + 1);
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    // Personal room: guarantees delivery to ALL open sessions of each member,
    // even if they haven't opened this specific thread (haven't joined the room).
    socket.join(`user:${userId}`);
    io.emit('presence:update', { userId, online: true });

    socket.on('conversation:join', async ({ conversationId }, ack) => {
      try {
        if (!conversationId) throw new Error('conversationId required');
        // Never trust client membership — verify on server.
        await assertConversationMember(userId, String(conversationId));
        await socket.join(`conversation:${conversationId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
        socket.emit('message:error', { error: err.message });
      }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        const conversationId = String(payload?.conversationId ?? '');
        const content = String(payload?.content ?? '').trim();
        const clientMessageId = payload?.clientMessageId;
        if (!conversationId || !content) throw new Error('conversationId and content required');
        if (content.length > 2000) throw new Error('Message too long (max 2000)');
        if (!allowSend(socket)) throw new Error('Slow down');
        await assertConversationMember(userId, conversationId);

        if (clientMessageId) {
          const dup = await prisma.message.findUnique({ where: { clientMessageId } });
          if (dup) {
            ack?.({ ok: true, message: dup, deduped: true });
            return;
          }
        }

        // Persist BEFORE emitting.
        const saved = await prisma.message.create({
          data: { conversationId, senderId: userId, content, clientMessageId },
          include: { sender: true },
        });
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        const wire = {
          id: saved.id,
          conversationId,
          content: saved.content,
          createdAt: saved.createdAt,
          sender: { id: saved.sender.id, name: saved.sender.name, username: saved.sender.username },
        };
        io.to(`conversation:${conversationId}`).emit('message:new', wire);
        // Fan out to every member's personal room so receivers get it live
        // even when the thread isn't open (sender already sees it via ack).
        try {
          const members = await prisma.conversationMember.findMany({
            where: { conversationId },
            select: { userId: true },
          });
          for (const m of members) {
            if (m.userId === userId) continue;
            io.to(`user:${m.userId}`).emit('message:new', wire);
            io.to(`user:${m.userId}`).emit('notification:new', { type: 'message', conversationId, message: wire });
          }
        } catch (e) {
          console.error('fanout failed', e);
        }
        ack?.({ ok: true, message: wire });
      } catch (err) {
        const msg = err?.code === 'P2002' ? 'Duplicate message' : err.message ?? 'Send failed';
        ack?.({ ok: false, error: msg });
        socket.emit('message:error', { error: msg });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      if (conversationId)
        socket
          .to(`conversation:${conversationId}`)
          .emit('typing:update', { conversationId, userId, typing: true });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      if (conversationId)
        socket
          .to(`conversation:${conversationId}`)
          .emit('typing:update', { conversationId, userId, typing: false });
    });

    socket.on('message:read', ({ conversationId, messageId }) => {
      if (conversationId)
        socket
          .to(`conversation:${conversationId}`)
          .emit('notification:new', { type: 'read', conversationId, messageId, userId });
    });

    socket.on('disconnect', () => {
      const n = (onlineCounts.get(userId) ?? 1) - 1;
      if (n <= 0) {
        onlineCounts.delete(userId);
        io.emit('presence:update', { userId, online: false });
      } else onlineCounts.set(userId, n);
    });
  });

  return io;
}
