import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  team_id: z.string().uuid('Valid team ID is required'),
  assigned_to: z.string().uuid('Valid assignee user ID is required').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional().nullable()
});

export const updateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200).optional(),
  description: z.string().max(2000).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'Status must be todo, in_progress, or completed' })
  })
});
