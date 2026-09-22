import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  updateRoleSchema,
  updateStatusSchema
} from '../validators/userValidator.js';

const router = Router();

// Require authentication for all user management routes
router.use(authenticate);

// System statistics - Admin only
router.get('/stats', authorize('admin'), userController.getStats);

// List users - Admin and Manager (to pick assignees/team members)
router.get('/', authorize('admin', 'manager'), userController.getUsers);

// Get single user - Admin and Manager
router.get('/:id', authorize('admin', 'manager'), userController.getUser);

// Create user - Admin only
router.post('/', authorize('admin'), validate(createUserSchema), userController.createUser);

// Update user details - Admin only
router.patch('/:id', authorize('admin'), validate(updateUserSchema), userController.updateUser);

// Update user role - Admin only
router.patch('/:id/role', authorize('admin'), validate(updateRoleSchema), userController.updateRole);

// Update user active status (soft deactivation) - Admin only
router.patch('/:id/status', authorize('admin'), validate(updateStatusSchema), userController.updateStatus);

export default router;
