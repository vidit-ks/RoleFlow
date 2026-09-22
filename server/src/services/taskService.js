import { query } from '../config/db.js';
import { logActivity } from './activityService.js';

export const getTasks = async ({
  userId,
  userRole,
  teamId,
  assignedTo,
  status,
  priority,
  search,
  page = 1,
  limit = 50
}) => {
  const offset = (page - 1) * limit;
  let text = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.team_id,
      t.assigned_to,
      t.created_by,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.updated_at,
      tm.name as team_name,
      ua.name as assignee_name,
      ua.email as assignee_email,
      ua.avatar_url as assignee_avatar,
      uc.name as creator_name,
      (SELECT COUNT(*) FROM comments WHERE task_id = t.id) as comment_count
    FROM tasks t
    LEFT JOIN teams tm ON t.team_id = tm.id
    LEFT JOIN users ua ON t.assigned_to = ua.id
    LEFT JOIN users uc ON t.created_by = uc.id
    WHERE 1=1
  `;
  const values = [];

  // Role-based visibility rules
  if (userRole === 'manager') {
    // Managers can see tasks from their managed teams
    values.push(userId);
    text += ` AND (t.team_id IN (SELECT id FROM teams WHERE manager_id = $${values.length}) OR t.created_by = $${values.length})`;
  } else if (userRole === 'employee') {
    // Employees can see tasks assigned to them or within their team
    values.push(userId);
    text += ` AND (t.assigned_to = $${values.length} OR t.team_id IN (SELECT team_id FROM team_members WHERE user_id = $${values.length}))`;
  }

  if (teamId) {
    values.push(teamId);
    text += ` AND t.team_id = $${values.length}`;
  }

  if (assignedTo) {
    values.push(assignedTo);
    text += ` AND t.assigned_to = $${values.length}`;
  }

  if (status) {
    values.push(status);
    text += ` AND t.status = $${values.length}`;
  }

  if (priority) {
    values.push(priority);
    text += ` AND t.priority = $${values.length}`;
  }

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    text += ` AND (LOWER(t.title) LIKE $${values.length} OR LOWER(t.description) LIKE $${values.length})`;
  }

  text += ` ORDER BY 
    CASE 
      WHEN t.status = 'in_progress' THEN 1
      WHEN t.status = 'todo' THEN 2
      ELSE 3
    END,
    t.due_date ASC NULLS LAST,
    t.created_at DESC`;

  values.push(limit, offset);
  text += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await query(text, values);

  return {
    tasks: result.rows,
    page: Number(page),
    limit: Number(limit)
  };
};

export const getTaskById = async (taskId, userId, userRole) => {
  const sql = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.team_id,
      t.assigned_to,
      t.created_by,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.updated_at,
      tm.name as team_name,
      tm.manager_id as team_manager_id,
      ua.name as assignee_name,
      ua.email as assignee_email,
      ua.avatar_url as assignee_avatar,
      uc.name as creator_name,
      uc.email as creator_email
    FROM tasks t
    LEFT JOIN teams tm ON t.team_id = tm.id
    LEFT JOIN users ua ON t.assigned_to = ua.id
    LEFT JOIN users uc ON t.created_by = uc.id
    WHERE t.id = $1
  `;

  const result = await query(sql, [taskId]);
  if (result.rows.length === 0) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const task = result.rows[0];

  // RBAC checks for visibility
  if (userRole === 'manager') {
    if (task.team_manager_id !== userId && task.created_by !== userId) {
      const error = new Error('Access denied. You can only view tasks from your own team.');
      error.statusCode = 403;
      throw error;
    }
  } else if (userRole === 'employee') {
    // Check if task is assigned to user or user is in this team
    if (task.assigned_to !== userId) {
      const membership = await query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [task.team_id, userId]
      );
      if (membership.rows.length === 0) {
        const error = new Error('Access denied. You do not have permission to view this task.');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  return task;
};

export const createTask = async (actorId, actorRole, taskData) => {
  const { title, description, team_id, assigned_to, priority, due_date } = taskData;

  // RBAC: If Manager, verify team belongs to manager & assignee belongs to team
  if (actorRole === 'manager') {
    const teamRes = await query('SELECT manager_id FROM teams WHERE id = $1', [team_id]);
    if (teamRes.rows.length === 0) {
      const error = new Error('Specified team does not exist.');
      error.statusCode = 404;
      throw error;
    }
    if (teamRes.rows[0].manager_id !== actorId) {
      const error = new Error('Forbidden: You can only create tasks for teams you manage.');
      error.statusCode = 403;
      throw error;
    }

    if (assigned_to) {
      const memberCheck = await query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [team_id, assigned_to]
      );
      if (memberCheck.rows.length === 0) {
        const error = new Error('Forbidden: You can only assign tasks to members of your own team.');
        error.statusCode = 403;
        throw error;
      }
    }
  } else if (actorRole === 'employee') {
    const error = new Error('Forbidden: Employees cannot create team tasks.');
    error.statusCode = 403;
    throw error;
  }

  const insertSql = `
    INSERT INTO tasks (title, description, team_id, assigned_to, created_by, status, priority, due_date)
    VALUES ($1, $2, $3, $4, $5, 'todo', $6, $7)
    RETURNING *
  `;

  const result = await query(insertSql, [
    title.trim(),
    description?.trim() || null,
    team_id,
    assigned_to || null,
    actorId,
    priority || 'medium',
    due_date || null
  ]);

  const newTask = result.rows[0];

  await logActivity({
    userId: actorId,
    action: 'TASK_CREATED',
    entityType: 'task',
    entityId: newTask.id,
    metadata: {
      task_title: newTask.title,
      priority: newTask.priority,
      assigned_to: newTask.assigned_to
    }
  });

  return newTask;
};

export const updateTask = async (actorId, actorRole, taskId, updates) => {
  const existing = await getTaskById(taskId, actorId, actorRole);

  if (actorRole === 'employee') {
    const error = new Error('Forbidden: Employees cannot modify task properties.');
    error.statusCode = 403;
    throw error;
  }

  if (actorRole === 'manager') {
    if (existing.team_manager_id !== actorId && existing.created_by !== actorId) {
      const error = new Error('Forbidden: You can only update tasks within your team.');
      error.statusCode = 403;
      throw error;
    }

    if (updates.assigned_to) {
      const memberCheck = await query(
        'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
        [existing.team_id, updates.assigned_to]
      );
      if (memberCheck.rows.length === 0) {
        const error = new Error('Forbidden: Assignee must be a member of your team.');
        error.statusCode = 403;
        throw error;
      }
    }
  }

  const fields = [];
  const values = [taskId];

  if (updates.title) {
    values.push(updates.title.trim());
    fields.push(`title = $${values.length}`);
  }

  if (updates.description !== undefined) {
    values.push(updates.description?.trim() || null);
    fields.push(`description = $${values.length}`);
  }

  if (updates.assigned_to !== undefined) {
    values.push(updates.assigned_to || null);
    fields.push(`assigned_to = $${values.length}`);
  }

  if (updates.priority) {
    values.push(updates.priority);
    fields.push(`priority = $${values.length}`);
  }

  if (updates.status) {
    values.push(updates.status);
    fields.push(`status = $${values.length}`);
  }

  if (updates.due_date !== undefined) {
    values.push(updates.due_date || null);
    fields.push(`due_date = $${values.length}`);
  }

  if (fields.length === 0) {
    return existing;
  }

  fields.push('updated_at = NOW()');
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
  const result = await query(sql, values);
  const updatedTask = result.rows[0];

  await logActivity({
    userId: actorId,
    action: 'TASK_UPDATED',
    entityType: 'task',
    entityId: taskId,
    metadata: {
      task_title: updatedTask.title,
      status: updatedTask.status,
      priority: updatedTask.priority
    }
  });

  return updatedTask;
};

export const updateTaskStatus = async (actorId, actorRole, taskId, status) => {
  const existing = await getTaskById(taskId, actorId, actorRole);

  const result = await query(
    'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, taskId]
  );

  const updated = result.rows[0];

  await logActivity({
    userId: actorId,
    action: 'TASK_STATUS_CHANGED',
    entityType: 'task',
    entityId: taskId,
    metadata: {
      task_title: existing.title,
      old_status: existing.status,
      new_status: status
    }
  });

  return updated;
};

export const deleteTask = async (actorId, actorRole, taskId) => {
  const existing = await getTaskById(taskId, actorId, actorRole);

  if (actorRole === 'employee') {
    const error = new Error('Forbidden: Employees cannot delete tasks.');
    error.statusCode = 403;
    throw error;
  }

  if (actorRole === 'manager') {
    if (existing.team_manager_id !== actorId && existing.created_by !== actorId) {
      const error = new Error('Forbidden: You can only delete tasks for your team.');
      error.statusCode = 403;
      throw error;
    }
  }

  await query('DELETE FROM tasks WHERE id = $1', [taskId]);

  await logActivity({
    userId: actorId,
    action: 'TASK_DELETED',
    entityType: 'task',
    entityId: taskId,
    metadata: { task_title: existing.title }
  });

  return true;
};
