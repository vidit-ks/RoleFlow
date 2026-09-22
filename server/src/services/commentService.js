import { query } from '../config/db.js';
import { getTaskById } from './taskService.js';
import { logActivity } from './activityService.js';

export const getCommentsByTaskId = async (taskId, userId, userRole) => {
  // Check that user has access to task
  await getTaskById(taskId, userId, userRole);

  const sql = `
    SELECT 
      c.id,
      c.task_id,
      c.user_id,
      c.content,
      c.created_at,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.avatar_url as user_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.task_id = $1
    ORDER BY c.created_at ASC
  `;

  const result = await query(sql, [taskId]);
  return result.rows;
};

export const createComment = async (userId, userRole, taskId, content) => {
  // Validate task access
  const task = await getTaskById(taskId, userId, userRole);

  const sql = `
    INSERT INTO comments (task_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const result = await query(sql, [taskId, userId, content.trim()]);
  const newComment = result.rows[0];

  // Fetch with user details for immediate response
  const commentWithUserRes = await query(
    `SELECT 
      c.id,
      c.task_id,
      c.user_id,
      c.content,
      c.created_at,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.avatar_url as user_avatar
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1`,
    [newComment.id]
  );

  await logActivity({
    userId,
    action: 'COMMENT_ADDED',
    entityType: 'comment',
    entityId: newComment.id,
    metadata: {
      task_id: taskId,
      task_title: task.title
    }
  });

  return commentWithUserRes.rows[0];
};
