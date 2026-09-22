import * as teamService from '../services/teamService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams();
    return successResponse(res, { teams }, 'Teams retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getTeam = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    return successResponse(res, { team }, 'Team details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getMyTeam = async (req, res, next) => {
  try {
    const team = await teamService.getManagerTeam(req.user.id);
    if (!team) {
      return successResponse(res, { team: null }, 'No team is currently assigned to this manager account.');
    }
    return successResponse(res, { team }, 'Manager team details retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const { name, description, manager_id } = req.body;
    const newTeam = await teamService.createTeam(req.user.id, { name, description, manager_id });
    return successResponse(res, { team: newTeam }, 'Team created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const updated = await teamService.updateTeam(req.user.id, req.params.id, req.body);
    return successResponse(res, { team: updated }, 'Team updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const { userId } = req.body;

    // RBAC: If role is manager, ensure this team belongs to them
    if (req.user.role === 'manager') {
      const myTeam = await teamService.getManagerTeam(req.user.id);
      if (!myTeam || myTeam.id !== teamId) {
        return errorResponse(res, 'Access denied. You can only manage members of your own team.', 403);
      }
    }

    await teamService.addMember(req.user.id, teamId, userId);
    return successResponse(res, null, 'Team member added successfully.');
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const userId = req.params.userId;

    if (req.user.role === 'manager') {
      const myTeam = await teamService.getManagerTeam(req.user.id);
      if (!myTeam || myTeam.id !== teamId) {
        return errorResponse(res, 'Access denied. You can only manage members of your own team.', 403);
      }
    }

    await teamService.removeMember(req.user.id, teamId, userId);
    return successResponse(res, null, 'Team member removed successfully.');
  } catch (err) {
    next(err);
  }
};
