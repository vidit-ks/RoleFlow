import { query } from '../config/db.js';

export const logActivity = async ({ userId, action, entityType, entityId = null, metadata = {} }) => {
  try {
    const text = `
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    const values = [userId, action, entityType, entityId, JSON.stringify(metadata)];
    const result = await query(text, values);
    return result.rows[0];
  } catch (err) {
    console.error('[Activity Log Error]: Failed to log activity:', err.message);
    // Do not throw so business actions do not fail if audit logging encounters an issue
    return null;
  }
};

export const getActivityLogs = async ({ limit = 50, offset = 0, entityType, userId }) => {
  let text = `
    SELECT 
      al.id,
      al.user_id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.metadata,
      al.created_at,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.avatar_url as user_avatar
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const values = [];

  if (entityType) {
    values.push(entityType);
    text += ` AND al.entity_type = $${values.length}`;
  }

  if (userId) {
    values.push(userId);
    text += ` AND al.user_id = $${values.length}`;
  }

  values.push(limit, offset);
  text += ` ORDER BY al.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await query(text, values);

  const countResult = await query('SELECT COUNT(*) FROM activity_logs');
  const total = parseInt(countResult.rows[0].count, 10);

  return {
    logs: result.rows,
    total,
    limit,
    offset
  };
};
