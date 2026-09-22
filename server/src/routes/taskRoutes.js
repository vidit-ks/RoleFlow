import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import * as commentController from '../controllers/commentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from '../validators/taskValidator.js';
import { createCommentSchema } from '../validators/commentValidator.js';

const router = Router();

router.use(authenticate);

// Tasks CRUD
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);

// Create task - Admin and Manager
router.post('/', authorize('admin', 'manager'), validate(createTaskSchema), taskController.createTask);

// Edit task metadata - Admin and Manager
router.patch('/:id', authorize('admin', 'manager'), validate(updateTaskSchema), taskController.updateTask);

// Update task status - Admin, Manager, and Employee
router.patch('/:id/status', validate(updateTaskStatusSchema), taskController.updateTaskStatus);

// Delete task - Admin and Manager
router.delete('/:id', authorize('admin', 'manager'), taskController.deleteTask);

// Comments sub-routes
router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', validate(createCommentSchema), commentController.createComment);

export default router;
