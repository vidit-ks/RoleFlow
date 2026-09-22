import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack || err.message);

  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'Malformed JSON in request body', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  return errorResponse(res, message, statusCode, err.errors || null);
};
