import { Router } from 'express';
import * as activityController from '../controllers/activityController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// Admin can see full audit activity trail
router.get('/', authorize('admin'), activityController.getActivityLogs);

export default router;
