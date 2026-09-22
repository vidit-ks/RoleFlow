import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid('Manager ID must be a valid UUID').optional().nullable()
});

export const updateTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100).optional(),
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid('Manager ID must be a valid UUID').optional().nullable()
});

export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID')
});
