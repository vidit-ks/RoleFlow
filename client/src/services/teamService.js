import api from './api';

export const getTeams = async () => {
  return await api.get('/teams');
};

export const getTeamById = async (id) => {
  return await api.get(`/teams/${id}`);
};

export const getMyTeam = async () => {
  return await api.get('/teams/my-team');
};

export const createTeam = async (teamData) => {
  return await api.post('/teams', teamData);
};

export const updateTeam = async (id, teamData) => {
  return await api.patch(`/teams/${id}`, teamData);
};

export const addTeamMember = async (teamId, userId) => {
  return await api.post(`/teams/${teamId}/members`, { userId });
};

export const removeTeamMember = async (teamId, userId) => {
  return await api.delete(`/teams/${teamId}/members/${userId}`);
};
