import api from './api';

export const getUsers = async (params = {}) => {
  return await api.get('/users', { params });
};

export const getUserById = async (id) => {
  return await api.get(`/users/${id}`);
};

export const createUser = async (userData) => {
  return await api.post('/users', userData);
};

export const updateUser = async (id, userData) => {
  return await api.patch(`/users/${id}`, userData);
};

export const updateUserRole = async (id, role) => {
  return await api.patch(`/users/${id}/role`, { role });
};

export const updateUserStatus = async (id, is_active) => {
  return await api.patch(`/users/${id}/status`, { is_active });
};

export const getSystemStats = async () => {
  return await api.get('/users/stats');
};
