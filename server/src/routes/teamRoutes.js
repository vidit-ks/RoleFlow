import { Router } from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema
} from '../validators/teamValidator.js';

const router = Router();

router.use(authenticate);

// Manager specific route: fetch manager's team
router.get('/my-team', authorize('manager'), teamController.getMyTeam);

// List all teams
router.get('/', authorize('admin', 'manager', 'employee'), teamController.getTeams);

// Get single team details
router.get('/:id', authorize('admin', 'manager', 'employee'), teamController.getTeam);

// Create team - Admin only
router.post('/', authorize('admin'), validate(createTeamSchema), teamController.createTeam);

// Update team - Admin only
router.patch('/:id', authorize('admin'), validate(updateTeamSchema), teamController.updateTeam);

// Add team member - Admin & Manager
router.post('/:id/members', authorize('admin', 'manager'), validate(addTeamMemberSchema), teamController.addMember);

// Remove team member - Admin & Manager
router.delete('/:id/members/:userId', authorize('admin', 'manager'), teamController.removeMember);

export default router;
