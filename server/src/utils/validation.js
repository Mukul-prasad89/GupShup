import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscore only')
  .transform((s) => s.toLowerCase());

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
  gender: z.enum(['MALE', 'FEMALE']),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(255),
  password: z.string().min(1).max(128),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(300).nullable().optional(),
  avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  clientMessageId: z.string().uuid().optional(),
});
