import * as activityService from '../services/activityService.js';
import { successResponse } from '../utils/response.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, entityType, userId } = req.query;

    // If role is not admin, only allow seeing own activity logs
    const filterUserId = req.user.role === 'admin' ? userId : req.user.id;

    const result = await activityService.getActivityLogs({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      entityType,
      userId: filterUserId
    });

    return successResponse(res, result, 'Activity logs retrieved successfully.');
  } catch (err) {
    next(err);
  }
};
