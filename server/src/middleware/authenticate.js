import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { query } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Authentication required. Token is missing.', 401);
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (tokenErr) {
      return errorResponse(res, 'Session expired or invalid token. Please log in again.', 401);
    }

    // Verify user exists and is active in database
    const userResult = await query(
      'SELECT id, name, email, role, avatar_url, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, 'User account not found.', 401);
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return errorResponse(res, 'Your account has been deactivated. Please contact an administrator.', 403);
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('[Authenticate Middleware Error]:', err.message);
    return errorResponse(res, 'Authentication failed.', 500);
  }
};
