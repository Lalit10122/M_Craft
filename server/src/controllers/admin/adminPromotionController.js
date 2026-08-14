import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const listPromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        specificProducts: {
          include: { product: { select: { name: true } } }
        }
      }
    });
    return successResponse(res, { data: promotions });
  } catch (err) {
    next(err);
  }
};

export const createPromotion = async (req, res, next) => {
  try {
    const { name, type, value, scope, categoryId, collectionId, buyQty, getQty, startDate, endDate, isActive, excludesFreeGift, bannerImageUrl, productIds } = req.body;
    
    // Validation
    if (new Date(startDate) >= new Date(endDate)) {
      return errorResponse(res, 'startDate must be before endDate', 400);
    }
    if (type === 'BUY_X_GET_Y' && (!buyQty || !getQty)) {
      return errorResponse(res, 'buyQty and getQty are required for BUY_X_GET_Y promotions', 400);
    }

    const promotion = await prisma.promotion.create({
      data: {
        name, type, value, scope, categoryId, collectionId, buyQty, getQty,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
        excludesFreeGift: excludesFreeGift || false,
        bannerImageUrl,
        specificProducts: scope === 'SPECIFIC_PRODUCTS' && productIds ? {
          create: productIds.map(id => ({ productId: id }))
        } : undefined
      }
    });

    return successResponse(res, { data: promotion }, 201);
  } catch (err) {
    next(err);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, value, scope, categoryId, collectionId, buyQty, getQty, startDate, endDate, isActive, excludesFreeGift, bannerImageUrl, productIds } = req.body;

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return errorResponse(res, 'startDate must be before endDate', 400);
    }
    if (type === 'BUY_X_GET_Y' && (!buyQty || !getQty)) {
      return errorResponse(res, 'buyQty and getQty are required for BUY_X_GET_Y promotions', 400);
    }

    const updateData = { name, type, value, scope, categoryId, collectionId, buyQty, getQty, isActive, excludesFreeGift, bannerImageUrl };
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: updateData
    });

    // If specific products changed, wipe and recreate
    if (scope === 'SPECIFIC_PRODUCTS' && productIds) {
      await prisma.promotionProduct.deleteMany({ where: { promotionId: id } });
      await prisma.promotionProduct.createMany({
        data: productIds.map(pid => ({ promotionId: id, productId: pid }))
      });
    }

    return successResponse(res, { data: promotion });
  } catch (err) {
    next(err);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.promotionProduct.deleteMany({ where: { promotionId: id } });
    await prisma.promotion.delete({ where: { id } });
    return successResponse(res, { message: 'Promotion deleted successfully' });
  } catch (err) {
    next(err);
  }
};
