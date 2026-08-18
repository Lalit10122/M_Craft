import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, generateTempToken } from '../utils/generateToken.js';
import { sendPasswordChangedEmail, sendAccountLockedEmail, sendWelcomeEmail, sendNewLoginAlertEmail, send2FAEnabledEmail, sendEmailVerificationOTP, sendPasswordResetOTP } from '../services/emailService.js';
import { generateOtp, sendOtp, storeOtp, verifyStoredOtp } from '../services/otpService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { z } from 'zod';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, twoFactorSecret, twoFactorBackupCodes, ...sanitized } = user;
  return sanitized;
};

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const createAndStoreRefreshToken = async (userId, role) => {
  const token = generateRefreshToken({ id: userId, role });
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  await prisma.refreshToken.create({
    data: {
      tokenHash: hash,
      userId,
      expiresAt,
    }
  });
  
  return token;
};

export const register = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/),
      phone: z.string().regex(/^[6-9]\d{9}$/)
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, { statusCode: 400, message: 'Validation failed', errors: parsed.error.flatten() });
    }
    
    const { name, email, password, phone } = parsed.data;
    
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) return errorResponse(res, { statusCode: 409, message: 'Email already exists' });
    
    const phoneExists = await prisma.user.findUnique({ where: { phone } });
    if (phoneExists) return errorResponse(res, { statusCode: 409, message: 'Phone already exists' });
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        authProvider: 'LOCAL',
        emailVerified: false
      }
    });
    
    // Auto-generate and send email verification OTP
    const otpCode = generateOtp();
    const codeHash = await bcrypt.hash(otpCode, 6);
    await prisma.emailVerificationCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    sendEmailVerificationOTP(user.email, otpCode).catch(console.error);
    
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshTokenStr = await createAndStoreRefreshToken(user.id, user.role);
    
    setRefreshTokenCookie(res, refreshTokenStr);
    
    // Fire and forget welcome email
    sendWelcomeEmail(user.email, user.name).catch(console.error);
    
    return successResponse(res, { 
      statusCode: 201, 
      message: 'Registration successful', 
      data: { accessToken, user: sanitizeUser(user) } 
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, { statusCode: 400, message: 'Validation failed' });
    
    const { email, password } = parsed.data;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, { statusCode: 401, message: 'Invalid credentials' });
    
    if (user.deletedAt) return errorResponse(res, { statusCode: 401, message: 'Account has been deactivated' });
    if (user.isBlocked) return errorResponse(res, { statusCode: 403, message: 'Account is blocked' });
    
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return errorResponse(res, { statusCode: 423, message: 'Account temporarily locked. Try again later.' });
    }
    
    if (user.authProvider === 'GOOGLE' && !user.passwordHash) {
      return errorResponse(res, { statusCode: 400, message: 'This account uses Google Sign-In. Please sign in with Google.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil = null;
      
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await sendAccountLockedEmail(user.email);
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil }
      });
      
      return errorResponse(res, { statusCode: 401, message: 'Invalid credentials' });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null }
    });
    
    // 2FA has been disabled per user request
    // if (user.role === 'ADMIN' && user.twoFactorEnabled) {
    //   const tempToken = generateTempToken({ id: user.id, role: user.role, type: 'temp2fa' });
    //   return successResponse(res, { statusCode: 200, message: '2FA required', data: { requires2FA: true, tempToken } });
    // }
    
    // if (user.role === 'ADMIN' && !user.twoFactorEnabled) {
    //   const tempToken = generateTempToken({ id: user.id, role: user.role, type: 'temp2fa' });
    //   return successResponse(res, { statusCode: 200, message: '2FA setup required', data: { requires2FASetup: true, tempToken } });
    // }
    
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshTokenStr = await createAndStoreRefreshToken(user.id, user.role);
    
    setRefreshTokenCookie(res, refreshTokenStr);
    
    // Check DeviceLogin
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser/Device';
    
    const existingDevice = await prisma.deviceLogin.findUnique({
      where: {
        userId_ipAddress_userAgent: { userId: user.id, ipAddress, userAgent }
      }
    });

    if (existingDevice) {
      await prisma.deviceLogin.update({
        where: { id: existingDevice.id },
        data: { lastSeen: new Date() }
      });
    } else {
      await prisma.deviceLogin.create({
        data: { userId: user.id, ipAddress, userAgent }
      });
      // Fire and forget login alert
      sendNewLoginAlertEmail(user.email, ipAddress, new Date().toLocaleString(), userAgent).catch(console.error);
    }
    
    return successResponse(res, { 
      statusCode: 200, 
      message: 'Login successful', 
      data: { accessToken, user: sanitizeUser(user) } 
    });
  } catch (error) {
    next(error);
  }
};

export const googleSignIn = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return errorResponse(res, { statusCode: 400, message: 'idToken required' });
    
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    
    if (!response.ok) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid Google token' });
    }
    
    const payload = await response.json();
    const { email, name, picture, sub: googleId } = payload;
    
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    });
    
    if (user) {
      if (user.deletedAt) return errorResponse(res, { statusCode: 401, message: 'Account has been deactivated' });
      if (user.isBlocked) return errorResponse(res, { statusCode: 403, message: 'Account is blocked' });
      
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, emailVerified: true }
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatarUrl: picture,
          authProvider: 'GOOGLE',
          emailVerified: true,
          passwordHash: null,
          phone: null
        }
      });
    }
    
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshTokenStr = await createAndStoreRefreshToken(user.id, user.role);
    
    setRefreshTokenCookie(res, refreshTokenStr);
    
    // Check DeviceLogin for Google SignIn
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser/Device';
    
    const existingDevice = await prisma.deviceLogin.findUnique({
      where: {
        userId_ipAddress_userAgent: { userId: user.id, ipAddress, userAgent }
      }
    });

    if (existingDevice) {
      await prisma.deviceLogin.update({
        where: { id: existingDevice.id },
        data: { lastSeen: new Date() }
      });
    } else {
      await prisma.deviceLogin.create({
        data: { userId: user.id, ipAddress, userAgent }
      });
      sendNewLoginAlertEmail(user.email, ipAddress, new Date().toLocaleString(), userAgent).catch(console.error);
    }
    
    return successResponse(res, {
      statusCode: 200,
      message: 'Google login successful',
      data: { accessToken, user: sanitizeUser(user), requiresPhone: user.phone === null }
    });
  } catch (error) {
    next(error);
  }
};

export const completeProfile = async (req, res, next) => {
  try {
    const schema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, { statusCode: 400, message: 'Invalid phone number' });
    
    const existing = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
    if (existing && existing.id !== req.user.id) return errorResponse(res, { statusCode: 409, message: 'Phone already in use' });
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { phone: parsed.data.phone }
    });
    
    return successResponse(res, { statusCode: 200, message: 'Profile completed', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().regex(/^[6-9]\d{9}$/).optional().or(z.literal(''))
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, { statusCode: 400, message: 'Validation failed', errors: parsed.error.flatten() });
    
    const { name, phone } = parsed.data;
    
    // If phone is provided, check if it's taken by another user
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing && existing.id !== req.user.id) {
        return errorResponse(res, { statusCode: 409, message: 'Phone number already in use by another account' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null; // Allow clearing phone if optional, though schema says must match regex if provided. Since we added `.or(z.literal(''))`, we can handle empty string as null.
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });
    
    return successResponse(res, { statusCode: 200, message: 'Profile updated successfully', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found' });
    
    return successResponse(res, { statusCode: 200, message: 'User fetched', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return errorResponse(res, { statusCode: 401, message: 'Refresh token not found' });
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET + '_REFRESH');
    } catch (e) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return errorResponse(res, { statusCode: 401, message: 'Invalid refresh token' });
    }
    
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash: hash, revoked: false, expiresAt: { gt: new Date() } }
    });
    
    if (!storedToken) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return errorResponse(res, { statusCode: 401, message: 'Refresh token revoked or expired' });
    }
    
    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    return successResponse(res, { statusCode: 200, message: 'Token refreshed', data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      await prisma.refreshToken.updateMany({
        where: { tokenHash: hash },
        data: { revoked: true }
      });
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    return successResponse(res, { statusCode: 200, message: 'Logged out successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, { statusCode: 400, message: 'Email required' });
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.authProvider !== 'LOCAL') {
      return errorResponse(res, { statusCode: 404, message: 'No account found with this email address.' });
    }
    
    const otpCode = generateOtp();
    const hash = await bcrypt.hash(otpCode, 6);
    
    await prisma.passwordResetToken.create({
      data: {
        tokenHash: hash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    });
    
    await sendPasswordResetOTP(user.email, otpCode);
    
    return successResponse(res, { statusCode: 200, message: 'Password reset code sent successfully.', data: {} });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      otp: z.string().length(6),
      newPassword: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/)
    });
    
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, { statusCode: 400, message: 'Validation failed' });
    
    const { email, otp, newPassword } = parsed.data;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return a generic error to prevent enumeration, or just say invalid
      return errorResponse(res, { statusCode: 400, message: 'Invalid or expired reset code' });
    }

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!resetRecord) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid or expired reset code' });
    }
    
    const isMatch = await bcrypt.compare(otp, resetRecord.tokenHash);
    if (!isMatch) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid reset code' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    ]);
    
    // Revoke all existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: false },
      data: { revoked: true }
    });
    
    sendPasswordChangedEmail(user.email).catch(console.error);
    
    return successResponse(res, { statusCode: 200, message: 'Password reset successful', data: {} });
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req, res, next) => {
  try {
    const schema = z.object({ password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return errorResponse(res, { statusCode: 400, message: 'Invalid password format' });
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.passwordHash) return errorResponse(res, { statusCode: 400, message: 'Password is already set' });
    
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, authProvider: 'LOCAL_AND_GOOGLE' }
    });
    
    return successResponse(res, { statusCode: 200, message: 'Password set successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return errorResponse(res, { statusCode: 400, message: 'Phone required' });
    
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOtps = await prisma.otpVerification.count({
      where: { phone, createdAt: { gt: tenMinsAgo } }
    });
    
    if (recentOtps >= 3) return errorResponse(res, { statusCode: 429, message: 'Too many OTP requests. Try again later.' });
    
    const otp = generateOtp();
    await storeOtp(phone, otp);
    await sendOtp(phone, otp);
    
    return successResponse(res, { statusCode: 200, message: 'OTP sent', data: {} });
  } catch (error) {
    next(error);
  }
};

export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return errorResponse(res, { statusCode: 400, message: 'Phone and OTP required' });
    
    const isValid = await verifyStoredOtp(phone, otp);
    if (!isValid || !isValid.valid) return errorResponse(res, { statusCode: 400, message: isValid?.message || 'Invalid or expired OTP' });
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { phoneVerified: true }
    });
    
    return successResponse(res, { statusCode: 200, message: 'Phone verified successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

export const verify2FA = async (req, res, next) => {
  try {
    const { tempToken, code, backupCode } = req.body;
    if (!tempToken || (!code && !backupCode)) return errorResponse(res, { statusCode: 400, message: 'Missing parameters' });
    
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET + '_TEMP');
    } catch (e) {
      return errorResponse(res, { statusCode: 401, message: 'Invalid or expired temp token' });
    }
    
    if (decoded.type !== 'temp2fa') return errorResponse(res, { statusCode: 401, message: 'Invalid token type' });
    
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found' });
    
    let isValid = false;
    
    if (code) {
      isValid = authenticator.check(code, user.twoFactorSecret);
    } else if (backupCode) {
      const backupCodes = user.twoFactorBackupCodes || [];
      for (let i = 0; i < backupCodes.length; i++) {
        const match = await bcrypt.compare(backupCode, backupCodes[i]);
        if (match) {
          isValid = true;
          backupCodes.splice(i, 1);
          await prisma.user.update({
            where: { id: user.id },
            data: { twoFactorBackupCodes: backupCodes }
          });
          break;
        }
      }
    }
    
    if (!isValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await sendAccountLockedEmail(user.email);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: attempts, lockedUntil }
      });
      return errorResponse(res, { statusCode: 401, message: 'Invalid 2FA code' });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null }
    });
    
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshTokenStr = await createAndStoreRefreshToken(user.id, user.role);
    setRefreshTokenCookie(res, refreshTokenStr);
    
    return successResponse(res, { 
      statusCode: 200, 
      message: '2FA verified', 
      data: { 
        accessToken, 
        token: accessToken,
        user: sanitizeUser(user) 
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const setup2FA = async (req, res, next) => {
  try {
    let userId = req.user?.id;
    
    if (!userId) {
      const { tempToken } = req.body;
      if (!tempToken) return errorResponse(res, { statusCode: 401, message: 'Authentication required' });
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET + '_TEMP');
        if (decoded.type !== 'temp2fa' || decoded.role !== 'ADMIN') {
          return errorResponse(res, { statusCode: 401, message: 'Invalid token type or role' });
        }
        userId = decoded.id;
      } catch (err) {
        return errorResponse(res, { statusCode: 401, message: 'Invalid or expired temp token' });
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') return errorResponse(res, { statusCode: 403, message: 'Access denied' });
    
    const secret = authenticator.generateSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret }
    });
    
    const otpauthUrl = authenticator.keyuri(user.email, 'Malkincraft', secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    
    return successResponse(res, { 
      statusCode: 200, 
      message: '2FA setup initiated', 
      data: { qrCode, secret } 
    });
  } catch (error) {
    next(error);
  }
};

export const verifySetup2FA = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return errorResponse(res, { statusCode: 400, message: 'Code required' });
    
    let userId = req.user?.id;
    
    if (!userId) {
      const { tempToken } = req.body;
      if (!tempToken) return errorResponse(res, { statusCode: 401, message: 'Authentication required' });
      try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET + '_TEMP');
        if (decoded.type !== 'temp2fa' || decoded.role !== 'ADMIN') {
          return errorResponse(res, { statusCode: 401, message: 'Invalid token type or role' });
        }
        userId = decoded.id;
      } catch (err) {
        return errorResponse(res, { statusCode: 401, message: 'Invalid or expired temp token' });
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') return errorResponse(res, { statusCode: 403, message: 'Access denied' });
    
    const isValid = authenticator.check(code, user.twoFactorSecret);
    if (!isValid) return errorResponse(res, { statusCode: 400, message: 'Invalid 2FA code' });
    
    const plainBackupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
    const hashedBackupCodes = await Promise.all(plainBackupCodes.map(c => bcrypt.hash(c, 10)));
    
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: true,
        twoFactorBackupCodes: hashedBackupCodes
      }
    });
    
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshTokenStr = await createAndStoreRefreshToken(user.id, user.role);
    setRefreshTokenCookie(res, refreshTokenStr);
    
    // Send 2FA Enabled Email
    send2FAEnabledEmail(user.email, 'enabled').catch(console.error);
    
    return successResponse(res, { 
      statusCode: 200, 
      message: '2FA successfully enabled', 
      data: { 
        backupCodes: plainBackupCodes,
        token: accessToken,
        accessToken,
        user: sanitizeUser(user)
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const disable2FA = async (req, res, next) => {
  try {
    const { password, code } = req.body;
    if (!password || !code) return errorResponse(res, { statusCode: 400, message: 'Password and 2FA code required' });
    
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return errorResponse(res, { statusCode: 401, message: 'Invalid password' });
    
    const isCodeValid = authenticator.check(code, user.twoFactorSecret);
    if (!isCodeValid) return errorResponse(res, { statusCode: 400, message: 'Invalid 2FA code' });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: []
      }
    });
    
    console.log(`User ${user.email} disabled 2FA at ${new Date().toISOString()}`);
    
    // Send 2FA Disabled Email
    send2FAEnabledEmail(user.email, 'disabled').catch(console.error);
    
    return successResponse(res, { statusCode: 200, message: '2FA disabled successfully', data: {} });
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: true,
        orders: { include: { items: true } },
        reviews: true,
        wishlist: true
      }
    });
    
    return successResponse(res, { 
      statusCode: 200, 
      message: 'User data exported', 
      data: sanitizeUser(user) 
    });
  } catch (error) {
    next(error);
  }
};

export const sendVerificationEmailHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return errorResponse(res, { statusCode: 404, message: 'User not found' });
    if (user.emailVerified) return errorResponse(res, { statusCode: 400, message: 'Email already verified' });
    
    // Check cooldown
    const lastCode = await prisma.emailVerificationCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastCode) {
      const msSinceLastCode = Date.now() - new Date(lastCode.createdAt).getTime();
      if (msSinceLastCode < 60 * 1000) {
        return errorResponse(res, { statusCode: 429, message: 'Please wait 60 seconds before requesting another code' });
      }
    }
    
    const otpCode = generateOtp();
    const codeHash = await bcrypt.hash(otpCode, 6);
    
    await prisma.emailVerificationCode.create({
      data: {
        userId,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    
    await sendEmailVerificationOTP(user.email, otpCode);
    return successResponse(res, { statusCode: 200, message: 'Verification code sent' });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailHandler = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') return errorResponse(res, { statusCode: 400, message: 'Code is required' });
    
    const userId = req.user.id;
    const activeCode = await prisma.emailVerificationCode.findFirst({
      where: { userId, verified: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!activeCode) return errorResponse(res, { statusCode: 400, message: 'No active verification code found or expired' });
    
    if (activeCode.attempts >= 5) {
      return errorResponse(res, { statusCode: 429, message: 'Too many failed attempts. Please request a new code.' });
    }
    
    const isMatch = await bcrypt.compare(code, activeCode.codeHash);
    
    if (!isMatch) {
      await prisma.emailVerificationCode.update({
        where: { id: activeCode.id },
        data: { attempts: { increment: 1 } }
      });
      return errorResponse(res, { statusCode: 400, message: 'Invalid code' });
    }
    
    await prisma.$transaction([
      prisma.emailVerificationCode.update({
        where: { id: activeCode.id },
        data: { verified: true }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
      })
    ]);
    
    return successResponse(res, { statusCode: 200, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};
