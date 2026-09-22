import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import { logActivity } from './activityService.js';

export const getAllUsers = async ({ search, role, status, page = 1, limit = 50 }) => {
  const offset = (page - 1) * limit;
  let text = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar_url,
      u.is_active,
      u.created_at,
      u.updated_at,
      t.id as team_id,
      t.name as team_name,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND status = 'completed') as completed_task_count
    FROM users u
    LEFT JOIN team_members tm ON u.id = tm.user_id
    LEFT JOIN teams t ON tm.team_id = t.id
    WHERE 1=1
  `;
  const values = [];

  if (search) {
    values.push(`%${search.trim().toLowerCase()}%`);
    text += ` AND (LOWER(u.name) LIKE $${values.length} OR LOWER(u.email) LIKE $${values.length})`;
  }

  if (role) {
    values.push(role);
    text += ` AND u.role = $${values.length}`;
  }

  if (status !== undefined && status !== '') {
    values.push(status === 'true' || status === true);
    text += ` AND u.is_active = $${values.length}`;
  }

  text += ` ORDER BY u.created_at DESC`;
  values.push(limit, offset);
  text += ` LIMIT $${values.length - 1} OFFSET $${values.length}`;

  const result = await query(text, values);

  // Count query
  let countText = 'SELECT COUNT(*) FROM users u WHERE 1=1';
  const countValues = [];
  if (search) {
    countValues.push(`%${search.trim().toLowerCase()}%`);
    countText += ` AND (LOWER(u.name) LIKE $${countValues.length} OR LOWER(u.email) LIKE $${countValues.length})`;
  }
  if (role) {
    countValues.push(role);
    countText += ` AND u.role = $${countValues.length}`;
  }
  if (status !== undefined && status !== '') {
    countValues.push(status === 'true' || status === true);
    countText += ` AND u.is_active = $${countValues.length}`;
  }

  const countResult = await query(countText, countValues);
  const total = parseInt(countResult.rows[0].count, 10);

  return {
    users: result.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserById = async (id) => {
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_active, u.created_at, u.updated_at,
            t.id as team_id, t.name as team_name
     FROM users u
     LEFT JOIN team_members tm ON u.id = tm.user_id
     LEFT JOIN teams t ON tm.team_id = t.id
     WHERE u.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return result.rows[0];
};

export const createUserByAdmin = async (adminId, { name, email, password, role, teamId }) => {
  const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (existing.rows.length > 0) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const insertUser = `
    INSERT INTO users (name, email, password_hash, role, is_active)
    VALUES ($1, LOWER($2), $3, $4, true)
    RETURNING id, name, email, role, avatar_url, is_active, created_at
  `;

  const userRes = await query(insertUser, [name.trim(), email.trim(), hashedPassword, role]);
  const newUser = userRes.rows[0];

  if (teamId) {
    await query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [teamId, newUser.id]
    );
  }

  await logActivity({
    userId: adminId,
    action: 'USER_CREATED',
    entityType: 'user',
    entityId: newUser.id,
    metadata: { name: newUser.name, email: newUser.email, role: newUser.role, teamId }
  });

  return newUser;
};

export const updateUser = async (adminId, targetUserId, updates) => {
  const existing = await getUserById(targetUserId);

  const fields = [];
  const values = [targetUserId];

  if (updates.name) {
    values.push(updates.name.trim());
    fields.push(`name = $${values.length}`);
  }

  if (updates.email) {
    const emailCheck = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [
      updates.email,
      targetUserId
    ]);
    if (emailCheck.rows.length > 0) {
      const error = new Error('Email is already taken by another account.');
      error.statusCode = 409;
      throw error;
    }
    values.push(updates.email.trim().toLowerCase());
    fields.push(`email = $${values.length}`);
  }

  if (updates.role) {
    values.push(updates.role);
    fields.push(`role = $${values.length}`);
  }

  if (updates.avatar_url !== undefined) {
    values.push(updates.avatar_url.trim());
    fields.push(`avatar_url = $${values.length}`);
  }

  if (fields.length === 0) {
    return existing;
  }

  fields.push(`updated_at = NOW()`);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING id, name, email, role, avatar_url, is_active, updated_at`;
  const result = await query(sql, values);
  const updated = result.rows[0];

  await logActivity({
    userId: adminId,
    action: 'USER_UPDATED',
    entityType: 'user',
    entityId: targetUserId,
    metadata: { name: updated.name, email: updated.email, role: updated.role }
  });

  return updated;
};

export const updateUserRole = async (adminId, targetUserId, newRole) => {
  const result = await query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, is_active',
    [newRole, targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = result.rows[0];

  await logActivity({
    userId: adminId,
    action: 'ROLE_CHANGED',
    entityType: 'user',
    entityId: targetUserId,
    metadata: { user_name: updatedUser.name, new_role: newRole }
  });

  return updatedUser;
};

export const updateUserStatus = async (adminId, targetUserId, isActive) => {
  // Prevent admin from deactivating themselves
  if (adminId === targetUserId && !isActive) {
    const error = new Error('You cannot deactivate your own administrative account.');
    error.statusCode = 400;
    throw error;
  }

  const result = await query(
    'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, is_active',
    [isActive, targetUserId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = result.rows[0];

  await logActivity({
    userId: adminId,
    action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    entityType: 'user',
    entityId: targetUserId,
    metadata: { user_name: updatedUser.name, is_active: isActive }
  });

  return updatedUser;
};

export const getSystemStatistics = async () => {
  const usersCountRes = await query(`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE is_active = true) as active_users,
      COUNT(*) FILTER (WHERE role = 'admin') as admins,
      COUNT(*) FILTER (WHERE role = 'manager') as managers,
      COUNT(*) FILTER (WHERE role = 'employee') as employees
    FROM users
  `);

  const teamsCountRes = await query('SELECT COUNT(*) as total_teams FROM teams');

  const tasksCountRes = await query(`
    SELECT 
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
      COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed') as overdue_tasks
    FROM tasks
  `);

  const u = usersCountRes.rows[0];
  const t = teamsCountRes.rows[0];
  const k = tasksCountRes.rows[0];

  return {
    users: {
      total: parseInt(u.total_users, 10),
      active: parseInt(u.active_users, 10),
      admins: parseInt(u.admins, 10),
      managers: parseInt(u.managers, 10),
      employees: parseInt(u.employees, 10)
    },
    teams: {
      total: parseInt(t.total_teams, 10)
    },
    tasks: {
      total: parseInt(k.total_tasks, 10),
      todo: parseInt(k.todo_tasks, 10),
      in_progress: parseInt(k.in_progress_tasks, 10),
      completed: parseInt(k.completed_tasks, 10),
      overdue: parseInt(k.overdue_tasks, 10)
    }
  };
};
