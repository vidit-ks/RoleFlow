import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Temporary password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['admin', 'manager', 'employee'], {
    errorMap: () => ({ message: 'Role must be admin, manager, or employee' })
  }),
  teamId: z.string().uuid('Team ID must be a valid UUID').optional().nullable()
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  role: z.enum(['admin', 'manager', 'employee']).optional(),
  avatar_url: z.string().url().or(z.string().length(0)).optional()
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'employee'], {
    errorMap: () => ({ message: 'Role must be admin, manager, or employee' })
  })
});

export const updateStatusSchema = z.object({
  is_active: z.boolean({
    required_error: 'is_active boolean field is required'
  })
});
