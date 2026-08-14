import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { calculateDiscountPercent } from '../services/priceService.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, basePrice: true, mrp: true, images: true, isActive: true } }
      }
    });

    const wishlist = items.map(item => {
      const p = item.product;
      const firstImage = p.images && p.images.length > 0 ? p.images[0] : null;
      const discountPercent = calculateDiscountPercent(p.mrp, p.basePrice);
      return { ...item, product: { ...p, firstImage, discountPercent } };
    });

    return successResponse(res, { data: wishlist });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return errorResponse(res, { statusCode: 400, message: 'ProductId required' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse(res, { statusCode: 404, message: 'Product not found' });

    try {
      await prisma.wishlist.create({ data: { userId: req.user.id, productId } });
    } catch (e) {
      if (e.code !== 'P2002') throw e;
    }

    return successResponse(res, { message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.wishlist.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) return errorResponse(res, { statusCode: 404, message: 'Not found' });

    await prisma.wishlist.delete({ where: { id } });
    return successResponse(res, { message: 'Removed' });
  } catch (error) {
    next(error);
  }
};
