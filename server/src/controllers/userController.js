import * as userService from '../services/userService.js';
import { successResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page, limit } = req.query;
    const result = await userService.getAllUsers({ search, role, status, page, limit });
    return successResponse(res, result, 'Users retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, { user }, 'User retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, teamId } = req.body;
    const newUser = await userService.createUserByAdmin(req.user.id, { name, email, password, role, teamId });
    return successResponse(res, { user: newUser }, 'User created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.user.id, req.params.id, req.body);
    return successResponse(res, { user: updated }, 'User updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updated = await userService.updateUserRole(req.user.id, req.params.id, role);
    return successResponse(res, { user: updated }, `User role changed to ${role} successfully.`);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    const updated = await userService.updateUserStatus(req.user.id, req.params.id, is_active);
    const action = is_active ? 'activated' : 'deactivated';
    return successResponse(res, { user: updated }, `User successfully ${action}.`);
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await userService.getSystemStatistics();
    return successResponse(res, stats, 'System statistics retrieved.');
  } catch (err) {
    next(err);
  }
};
