import { Router } from 'express';
import {
  register,
  login,
  googleSignIn,
  completeProfile,
  updateProfile,
  getMe,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  setPassword,
  sendOtpHandler,
  verifyOtpHandler,
  sendVerificationEmailHandler,
  verifyEmailHandler,
  verify2FA,
  setup2FA,
  verifySetup2FA,
  disable2FA,
  exportData
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeAdmin } from '../middleware/adminMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: 'Too many OTP requests, please try again later'
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', googleSignIn);
router.put('/complete-profile', authenticate, completeProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/set-password', authenticate, setPassword);
router.post('/send-otp', authenticate, otpLimiter, sendOtpHandler);
router.post('/verify-otp', authenticate, verifyOtpHandler);
router.post('/send-verification-email', authenticate, otpLimiter, sendVerificationEmailHandler);
router.post('/verify-email', authenticate, verifyEmailHandler);
router.post('/2fa/verify', verify2FA);
router.post('/admin/2fa/setup', setup2FA);
router.post('/admin/2fa/verify-setup', verifySetup2FA);
router.put('/admin/2fa/disable', authenticate, authorizeAdmin, disable2FA);
router.get('/export-data', authenticate, exportData);

export default router;
