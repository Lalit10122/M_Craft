import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const history = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 20,
      include: {
        product: {
          select: { id: true, name: true, slug: true, basePrice: true, mrp: true, images: true, isActive: true }
        }
      }
    });
    
    // Filter out inactive products
    const activeHistory = history.filter(h => h.product.isActive);
    
    return successResponse(res, { data: activeHistory });
  } catch (error) {
    next(error);
  }
};

export const addRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    if (!productId) {
      return errorResponse(res, { statusCode: 400, message: 'Product ID is required' });
    }

    // Upsert the recently viewed record
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId, productId } },
      update: { viewedAt: new Date() },
      create: { userId, productId, viewedAt: new Date() }
    });

    // Prune old records to keep only the 20 most recent
    const oldRecords = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      skip: 20,
      select: { id: true }
    });

    if (oldRecords.length > 0) {
      const idsToDelete = oldRecords.map(r => r.id);
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    return successResponse(res, { message: 'Recently viewed updated' });
  } catch (error) {
    next(error);
  }
};
