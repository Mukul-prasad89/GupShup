import { prisma } from '../../config/db.js';

export function directPairKey(a, b) {
  return [a, b].sort().join(':');
}

// Both directions must exist (mutual connection created on accept).
export async function areMutuallyConnected(userA, userB) {
  if (userA === userB) return false;
  const rows = await prisma.follow.findMany({
    where: {
      OR: [
        { followerId: userA, followingId: userB },
        { followerId: userB, followingId: userA },
      ],
    },
  });
  return rows.length >= 2;
}

export async function assertCanMessage(viewerId, otherId) {
  const ok = await areMutuallyConnected(viewerId, otherId);
  if (!ok) {
    const e = new Error('Messaging is allowed only between accepted connections');
    e.status = 403;
    throw e;
  }
}

export async function assertConversationMember(userId, conversationId) {
  const member = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!member) {
    const e = new Error('Not a conversation member');
    e.status = 403;
    throw e;
  }
  return member;
}
