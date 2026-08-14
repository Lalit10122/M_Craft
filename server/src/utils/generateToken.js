import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload) => {
  const refreshSecret = `${process.env.JWT_SECRET}_REFRESH`;
  return jwt.sign({ ...payload, type: 'refresh' }, refreshSecret, { expiresIn: '7d' });
};

export const generateTempToken = (payload) => {
  const tempSecret = `${process.env.JWT_SECRET}_TEMP`;
  return jwt.sign({ ...payload, type: 'temp2fa' }, tempSecret, { expiresIn: '5m' });
};
