import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file', 'audio']).default('text'),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
});

export const groupSchema = z.object({
  groupName: z.string().min(2, 'Group name must be at least 2 characters').max(50),
  groupDescription: z.string().max(200).optional(),
  participants: z.array(z.string()).min(1, 'Add at least one member'),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(200).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type GroupInput = z.infer<typeof groupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
