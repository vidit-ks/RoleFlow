import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { logActivity } from './activityService.js';
import { sendOtpEmail, getSupabase } from './emailService.js';

export const registerUser = async ({ name, email, password, requireVerification = false }) => {
  // Check if email already registered
  const existing = await query('SELECT id, name, is_verified FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  if (existing.rows.length > 0) {
    const existingUser = existing.rows[0];
    if (!existingUser.is_verified) {
      // Re-generate OTP for unverified user
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await query(
        `UPDATE users 
         SET verification_otp = $1, otp_expires_at = NOW() + INTERVAL '10 minutes'
         WHERE id = $2`,
        [otp, existingUser.id]
      );
      await sendOtpEmail({ toEmail: email, userName: existingUser.name, otp });
      return {
        user: { id: existingUser.id, email },
        requiresVerification: true,
        demoOtp: otp,
        message: 'Account already created but unverified. A new verification OTP has been sent to your email.'
      };
    }

    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const role = 'employee';

  let otp = null;
  let isVerified = true;
  let otpExpiresAt = null;

  if (requireVerification) {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    isVerified = false;
    otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }

  const insertQuery = `
    INSERT INTO users (name, email, password_hash, role, is_active, is_verified, verification_otp, otp_expires_at)
    VALUES ($1, LOWER($2), $3, $4, true, $5, $6, $7)
    RETURNING id, name, email, role, avatar_url, is_active, is_verified, created_at
  `;

  const result = await query(insertQuery, [
    name.trim(),
    email.trim(),
    hashedPassword,
    role,
    isVerified,
    otp,
    otpExpiresAt
  ]);
  const user = result.rows[0];

  await logActivity({
    userId: user.id,
    action: 'USER_REGISTERED',
    entityType: 'user',
    entityId: user.id,
    metadata: { name: user.name, email: user.email, requireVerification }
  });

  if (requireVerification) {
    // Dispatch real email via emailService
    await sendOtpEmail({ toEmail: user.email, userName: user.name, otp });

    return {
      user,
      requiresVerification: true,
      demoOtp: otp,
      message: 'Verification code sent to your email. Please confirm your OTP to activate your account.'
    };
  }

  const token = generateToken({ userId: user.id, role: user.role });
  return { user, token, requiresVerification: false };
};

export const verifyEmailOtp = async ({ email, otp }) => {
  const result = await query(
    `SELECT id, name, email, role, is_active, is_verified, verification_otp, otp_expires_at
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email.trim()]
  );

  if (result.rows.length === 0) {
    const error = new Error('No account found with this email address.');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];

  if (user.is_verified) {
    const token = generateToken({ userId: user.id, role: user.role });
    return { user, token, message: 'Account is already verified.' };
  }

  let verified = false;

  // 1. Check with Supabase Auth
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'email'
      });
      if (!error && data?.user) {
        verified = true;
      }
    } catch (e) {
      console.warn('Supabase verifyOtp fallback:', e.message);
    }
  }

  // 2. Check with Database OTP
  if (!verified && user.verification_otp === otp.trim()) {
    if (user.otp_expires_at && new Date(user.otp_expires_at) < new Date()) {
      const error = new Error('Verification code has expired. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }
    verified = true;
  }

  if (!verified) {
    const error = new Error('Invalid verification code. Please check the OTP sent to your email.');
    error.statusCode = 400;
    throw error;
  }

  // Mark verified
  const updateRes = await query(
    `UPDATE users
     SET is_verified = true, verification_otp = NULL, otp_expires_at = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, avatar_url, is_active, is_verified, created_at`,
    [user.id]
  );

  const updatedUser = updateRes.rows[0];
  const token = generateToken({ userId: updatedUser.id, role: updatedUser.role });

  await logActivity({
    userId: user.id,
    action: 'EMAIL_VERIFIED',
    entityType: 'user',
    entityId: user.id,
    metadata: { email: user.email }
  });

  return { user: updatedUser, token, message: 'Account verified successfully!' };
};

export const resendEmailOtp = async ({ email }) => {
  const result = await query('SELECT id, name, email, is_verified FROM users WHERE LOWER(email) = LOWER($1)', [
    email.trim()
  ]);

  if (result.rows.length === 0) {
    const error = new Error('Account not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];
  if (user.is_verified) {
    return { message: 'Account is already verified. You can log in directly.', alreadyVerified: true };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await query(
    `UPDATE users 
     SET verification_otp = $1, otp_expires_at = NOW() + INTERVAL '10 minutes', updated_at = NOW()
     WHERE id = $2`,
    [otp, user.id]
  );

  await sendOtpEmail({ toEmail: user.email, userName: user.name || 'there', otp });

  return { demoOtp: otp, message: 'A new 6-digit verification OTP has been sent to your email.' };
};

export const loginUser = async ({ email, password }) => {
  const result = await query(
    'SELECT id, name, email, password_hash, role, avatar_url, is_active, is_verified FROM users WHERE LOWER(email) = LOWER($1)',
    [email.trim()]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const error = new Error('Your account has been deactivated. Please contact your organization administrator.');
    error.statusCode = 403;
    throw error;
  }

  if (user.is_verified === false) {
    const error = new Error('Please verify your email address with your 6-digit OTP before signing in.');
    error.statusCode = 403;
    error.requiresVerification = true;
    error.email = user.email;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ userId: user.id, role: user.role });

  await logActivity({
    userId: user.id,
    action: 'USER_LOGGED_IN',
    entityType: 'user',
    entityId: user.id,
    metadata: { role: user.role }
  });

  // Strip password hash from returned object
  delete user.password_hash;

  return { user, token };
};

export const getCurrentUserProfile = async (userId) => {
  const userResult = await query(
    `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.is_active, u.is_verified, u.created_at, u.updated_at,
            t.id as team_id, t.name as team_name
     FROM users u
     LEFT JOIN team_members tm ON u.id = tm.user_id
     LEFT JOIN teams t ON tm.team_id = t.id
     WHERE u.id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const row = userResult.rows[0];
  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
    is_active: row.is_active,
    is_verified: row.is_verified,
    created_at: row.created_at,
    updated_at: row.updated_at,
    team: row.team_id ? { id: row.team_id, name: row.team_name } : null
  };

  return user;
};

export const updateUserProfile = async (userId, { name, avatar_url }) => {
  const updates = [];
  const values = [userId];

  if (name !== undefined) {
    values.push(name.trim());
    updates.push(`name = $${values.length}`);
  }

  if (avatar_url !== undefined) {
    values.push(avatar_url.trim());
    updates.push(`avatar_url = $${values.length}`);
  }

  if (updates.length === 0) {
    return getCurrentUserProfile(userId);
  }

  updates.push(`updated_at = NOW()`);

  const sql = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING id, name, email, role, avatar_url, is_active, is_verified, created_at, updated_at
  `;

  const result = await query(sql, values);
  const updatedUser = result.rows[0];

  await logActivity({
    userId,
    action: 'PROFILE_UPDATED',
    entityType: 'user',
    entityId: userId,
    metadata: { name: updatedUser.name }
  });

  return updatedUser;
};

export const changeUserPassword = async (userId, { currentPassword, newPassword }) => {
  const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = result.rows[0];
  const isMatch = await comparePassword(currentPassword, user.password_hash);
  if (!isMatch) {
    const error = new Error('Current password does not match.');
    error.statusCode = 400;
    throw error;
  }

  const newHash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);

  await logActivity({
    userId,
    action: 'PASSWORD_CHANGED',
    entityType: 'user',
    entityId: userId,
    metadata: {}
  });

  return true;
};
