import { errorResponse } from '../utils/response.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Accepts one or multiple allowed roles: authorize('admin'), authorize('admin', 'manager')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before authorization.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of [${allowedRoles.join(', ')}] role permissions.`,
        403
      );
    }

    next();
  };
};
