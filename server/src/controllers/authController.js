import * as authService from '../services/authService.js';
import { successResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, requireVerification } = req.body;
    const result = await authService.registerUser({ name, email, password, requireVerification });
    const message = result.requiresVerification
      ? 'Verification OTP sent. Please confirm your email.'
      : 'Account created successfully. Welcome to RoleFlow!';
    return successResponse(res, result, message, 201);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyEmailOtp({ email, otp });
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendEmailOtp({ email });
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return successResponse(res, result, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUserProfile(req.user.id);
    return successResponse(res, { user }, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar_url } = req.body;
    const updatedUser = await authService.updateUserProfile(req.user.id, { name, avatar_url });
    return successResponse(res, { user: updatedUser }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user.id, { currentPassword, newPassword });
    return successResponse(res, null, 'Password updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully.');
};
