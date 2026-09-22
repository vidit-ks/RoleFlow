import * as commentService from '../services/commentService.js';
import { successResponse } from '../utils/response.js';

export const getComments = async (req, res, next) => {
  try {
    const comments = await commentService.getCommentsByTaskId(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return successResponse(res, { comments }, 'Comments retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await commentService.createComment(
      req.user.id,
      req.user.role,
      req.params.id,
      content
    );
    return successResponse(res, { comment }, 'Comment posted successfully.', 201);
  } catch (err) {
    next(err);
  }
};
