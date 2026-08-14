import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { errorResponse } from '../utils/apiResponse.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isBlocked: true,
        deletedAt: true,
      },
    });

    if (!user || user.isBlocked || user.deletedAt) {
      return errorResponse(res, 'Access denied', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

export { authenticate };
