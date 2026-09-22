import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment text cannot be empty').max(1000, 'Comment is too long')
});
