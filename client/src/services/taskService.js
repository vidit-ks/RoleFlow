import api from './api';

export const getTasks = async (params = {}) => {
  return await api.get('/tasks', { params });
};

export const getTaskById = async (id) => {
  return await api.get(`/tasks/${id}`);
};

export const createTask = async (taskData) => {
  return await api.post('/tasks', taskData);
};

export const updateTask = async (id, taskData) => {
  return await api.patch(`/tasks/${id}`, taskData);
};

export const updateTaskStatus = async (id, status) => {
  return await api.patch(`/tasks/${id}/status`, { status });
};

export const deleteTask = async (id) => {
  return await api.delete(`/tasks/${id}`);
};

export const getTaskComments = async (taskId) => {
  return await api.get(`/tasks/${taskId}/comments`);
};

export const addComment = async (taskId, content) => {
  return await api.post(`/tasks/${taskId}/comments`, { content });
};
