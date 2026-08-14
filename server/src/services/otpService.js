import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';

export const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().padStart(6, '0');
};

export const sendOtp = async (phone, otp) => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SMS provider not configured');
    // TODO: Replace with Twilio/MSG91 integration
  } else {
    console.log(`[SMS STUB] OTP for ${phone}: ${otp}`);
  }
};

export const storeOtp = async (phone, otp) => {
  const otpHash = await bcrypt.hash(otp, 6);
  
  await prisma.otpVerification.deleteMany({
    where: { phone }
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.create({
    data: {
      phone,
      otpHash,
      expiresAt,
      verified: false
    }
  });
};

export const verifyStoredOtp = async (phone, otp) => {
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      verified: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    return { valid: false, message: 'No OTP found or OTP expired' };
  }

  const isValid = await bcrypt.compare(otp, record.otpHash);
  
  if (isValid) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    });
    return { valid: true };
  }
  
  return { valid: false, message: 'Invalid OTP' };
};
