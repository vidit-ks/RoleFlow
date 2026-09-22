import { query } from '../config/db.js';
import { logActivity } from './activityService.js';

export const getAllTeams = async () => {
  const sql = `
    SELECT 
      t.id,
      t.name,
      t.description,
      t.manager_id,
      t.created_at,
      t.updated_at,
      u.name as manager_name,
      u.email as manager_email,
      u.avatar_url as manager_avatar,
      (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
      (SELECT COUNT(*) FROM tasks WHERE team_id = t.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE team_id = t.id AND status = 'completed') as completed_task_count
    FROM teams t
    LEFT JOIN users u ON t.manager_id = u.id
    ORDER BY t.name ASC
  `;

  const result = await query(sql);
  return result.rows;
};

export const getTeamById = async (id) => {
  const teamRes = await query(
    `SELECT 
      t.id,
      t.name,
      t.description,
      t.manager_id,
      t.created_at,
      t.updated_at,
      u.name as manager_name,
      u.email as manager_email,
      u.avatar_url as manager_avatar
     FROM teams t
     LEFT JOIN users u ON t.manager_id = u.id
     WHERE t.id = $1`,
    [id]
  );

  if (teamRes.rows.length === 0) {
    const error = new Error('Team not found.');
    error.statusCode = 404;
    throw error;
  }

  const team = teamRes.rows[0];

  // Get members
  const membersRes = await query(
    `SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar_url,
      u.is_active,
      tm.joined_at,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = $1) as assigned_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = $1 AND status = 'completed') as completed_tasks
     FROM team_members tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = $1
     ORDER BY u.name ASC`,
    [id]
  );

  team.members = membersRes.rows;
  return team;
};

export const getManagerTeam = async (managerUserId) => {
  const teamRes = await query(
    `SELECT 
      t.id,
      t.name,
      t.description,
      t.manager_id,
      t.created_at,
      u.name as manager_name,
      u.email as manager_email,
      u.avatar_url as manager_avatar
     FROM teams t
     JOIN users u ON t.manager_id = u.id
     WHERE t.manager_id = $1`,
    [managerUserId]
  );

  if (teamRes.rows.length === 0) {
    return null;
  }

  const team = teamRes.rows[0];

  // Fetch team members
  const membersRes = await query(
    `SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar_url,
      u.is_active,
      tm.joined_at,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = $1) as assigned_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = $1 AND status = 'completed') as completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assigned_to = u.id AND team_id = $1 AND status = 'in_progress') as in_progress_tasks
     FROM team_members tm
     JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = $1
     ORDER BY u.name ASC`,
    [team.id]
  );

  // Fetch tasks summary for this team
  const tasksSummaryRes = await query(
    `SELECT 
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
      COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed') as overdue_tasks
     FROM tasks
     WHERE team_id = $1`,
    [team.id]
  );

  team.members = membersRes.rows;
  team.stats = {
    total: parseInt(tasksSummaryRes.rows[0].total_tasks, 10),
    todo: parseInt(tasksSummaryRes.rows[0].todo_tasks, 10),
    in_progress: parseInt(tasksSummaryRes.rows[0].in_progress_tasks, 10),
    completed: parseInt(tasksSummaryRes.rows[0].completed_tasks, 10),
    overdue: parseInt(tasksSummaryRes.rows[0].overdue_tasks, 10)
  };

  return team;
};

export const createTeam = async (adminId, { name, description, manager_id }) => {
  const insertSql = `
    INSERT INTO teams (name, description, manager_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await query(insertSql, [name.trim(), description?.trim() || null, manager_id || null]);
  const newTeam = result.rows[0];

  // If manager assigned, add manager to team_members automatically
  if (manager_id) {
    await query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      newTeam.id,
      manager_id
    ]);
  }

  await logActivity({
    userId: adminId,
    action: 'TEAM_CREATED',
    entityType: 'team',
    entityId: newTeam.id,
    metadata: { team_name: newTeam.name }
  });

  return newTeam;
};

export const updateTeam = async (adminId, teamId, { name, description, manager_id }) => {
  const fields = [];
  const values = [teamId];

  if (name) {
    values.push(name.trim());
    fields.push(`name = $${values.length}`);
  }

  if (description !== undefined) {
    values.push(description?.trim() || null);
    fields.push(`description = $${values.length}`);
  }

  if (manager_id !== undefined) {
    values.push(manager_id || null);
    fields.push(`manager_id = $${values.length}`);
  }

  if (fields.length === 0) {
    return getTeamById(teamId);
  }

  fields.push('updated_at = NOW()');
  const sql = `UPDATE teams SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
  const result = await query(sql, values);

  if (result.rows.length === 0) {
    const error = new Error('Team not found.');
    error.statusCode = 404;
    throw error;
  }

  const updatedTeam = result.rows[0];

  if (manager_id) {
    await query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
      teamId,
      manager_id
    ]);
  }

  await logActivity({
    userId: adminId,
    action: 'TEAM_UPDATED',
    entityType: 'team',
    entityId: teamId,
    metadata: { team_name: updatedTeam.name }
  });

  return updatedTeam;
};

export const addMember = async (actorId, teamId, userId) => {
  // Verify team exists
  const teamRes = await query('SELECT name FROM teams WHERE id = $1', [teamId]);
  if (teamRes.rows.length === 0) {
    const error = new Error('Team not found.');
    error.statusCode = 404;
    throw error;
  }

  // Verify user exists
  const userRes = await query('SELECT name, email FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  await query('INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [
    teamId,
    userId
  ]);

  await logActivity({
    userId: actorId,
    action: 'TEAM_MEMBER_ADDED',
    entityType: 'team',
    entityId: teamId,
    metadata: { team_name: teamRes.rows[0].name, member_name: userRes.rows[0].name }
  });

  return true;
};

export const removeMember = async (actorId, teamId, userId) => {
  const teamRes = await query('SELECT name FROM teams WHERE id = $1', [teamId]);
  const userRes = await query('SELECT name FROM users WHERE id = $1', [userId]);

  await query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [teamId, userId]);

  if (teamRes.rows.length > 0 && userRes.rows.length > 0) {
    await logActivity({
      userId: actorId,
      action: 'TEAM_MEMBER_REMOVED',
      entityType: 'team',
      entityId: teamId,
      metadata: { team_name: teamRes.rows[0].name, member_name: userRes.rows[0].name }
    });
  }

  return true;
};
