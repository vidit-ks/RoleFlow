import * as taskService from '../services/taskService.js';
import { successResponse } from '../utils/response.js';

export const getTasks = async (req, res, next) => {
  try {
    const { teamId, assignedTo, status, priority, search, page, limit } = req.query;
    const result = await taskService.getTasks({
      userId: req.user.id,
      userRole: req.user.role,
      teamId,
      assignedTo,
      status,
      priority,
      search,
      page,
      limit
    });
    return successResponse(res, result, 'Tasks retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, { task }, 'Task retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const newTask = await taskService.createTask(req.user.id, req.user.role, req.body);
    return successResponse(res, { task: newTask }, 'Task created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const updated = await taskService.updateTask(req.user.id, req.user.role, req.params.id, req.body);
    return successResponse(res, { task: updated }, 'Task updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updated = await taskService.updateTaskStatus(req.user.id, req.user.role, req.params.id, status);
    return successResponse(res, { task: updated }, 'Task status updated.');
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.user.id, req.user.role, req.params.id);
    return successResponse(res, null, 'Task deleted successfully.');
  } catch (err) {
    next(err);
  }
};
