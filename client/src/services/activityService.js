import api from './api';

export const getActivityLogs = async (params = {}) => {
  return await api.get('/activity', { params });
};
