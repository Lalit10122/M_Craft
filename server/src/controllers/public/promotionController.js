import { prisma } from '../../config/db.js';
import { successResponse } from '../../utils/apiResponse.js';

export const getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, { data: promotions });
  } catch (err) {
    next(err);
  }
};
