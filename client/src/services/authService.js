import api from './api';

export const login = async (email, password) => {
  return await api.post('/auth/login', { email, password });
};

export const register = async (name, email, password, requireVerification = false) => {
  return await api.post('/auth/register', { name, email, password, requireVerification });
};

export const verifyOtp = async (email, otp) => {
  return await api.post('/auth/verify-otp', { email, otp });
};

export const resendOtp = async (email) => {
  return await api.post('/auth/resend-otp', { email });
};

export const getMe = async () => {
  return await api.get('/auth/me');
};

export const updateProfile = async (data) => {
  return await api.patch('/auth/profile', data);
};

export const changePassword = async (currentPassword, newPassword) => {
  return await api.post('/auth/change-password', { currentPassword, newPassword });
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    // Ignore server error on logout
  }
};
