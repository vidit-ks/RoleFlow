import { errorResponse } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return errorResponse(res, formattedErrors[0]?.message || 'Validation failed', 400, formattedErrors);
      }
      return errorResponse(res, 'Invalid request data', 400);
    }
  };
};
