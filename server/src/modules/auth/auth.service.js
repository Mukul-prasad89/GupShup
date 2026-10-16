import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import { httpError } from '../../middleware/error.js';
import { publicUser } from '../../utils/sanitize.js';

export async function registerUser({ name, username, email, password, gender }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    if (existing.username === username) throw httpError(409, 'Username already taken');
    throw httpError(409, 'Email already registered');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash, gender },
  });
  return publicUser(user);
}

export async function loginUser({ identifier, password }) {
  const id = identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: id }, { email: id }] },
  });
  if (!user) throw httpError(401, 'Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw httpError(401, 'Invalid credentials');
  return publicUser(user);
}
