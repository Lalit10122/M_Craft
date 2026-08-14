import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

export const getCart = async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: { select: { id: true, name: true, slug: true, basePrice: true, mrp: true, images: true, isActive: true, stockQty: true } },
        variant: true
      }
    });

    const cartItems = items.map(item => {
      if (item.boxBuilderConfigId) {
        return { ...item, itemPrice: 0, total: 0 }; // Box Builders have a single bundle price which is calculated at checkout/getCartTotal (or here if we fetch config)
      }
      const price = item.variant ? item.variant.price : (item.product ? item.product.basePrice : 0);
      return { ...item, itemPrice: price, total: price * item.quantity };
    });

    return successResponse(res, { data: cartItems });
  } catch (error) {
    next(error);
  }
};

const addToCartSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().cuid().optional()
});

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, variantId } = addToCartSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }

    let stock = product.stockQty;
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        return errorResponse(res, { statusCode: 400, message: 'Invalid variant' });
      }
      stock = variant.stockQty;
    }

    if (stock < quantity) {
      return errorResponse(res, { statusCode: 400, message: 'Insufficient stock' });
    }

    let cartItem;
    try {
      cartItem = await prisma.cartItem.create({
        data: { userId: req.user.id, productId, variantId, quantity }
      });
    } catch (e) {
      if (e.code === 'P2002') {
        const existing = await prisma.cartItem.findFirst({
          where: { userId: req.user.id, productId, variantId: variantId || null }
        });
        if (existing) {
          const newQty = existing.quantity + quantity;
          if (stock < newQty) {
            return errorResponse(res, { statusCode: 400, message: 'Insufficient stock for combined quantity' });
          }
          cartItem = await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty }
          });
        }
      } else {
        throw e;
      }
    }

    return successResponse(res, { data: cartItem });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, { statusCode: 400, message: 'Invalid input', errors: error.errors });
    next(error);
  }
};

export const addBoxBuilderToCart = async (req, res, next) => {
  try {
    const { boxBuilderConfigId, selectedProductIds } = req.body;
    
    if (!boxBuilderConfigId || !selectedProductIds || !Array.isArray(selectedProductIds)) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid payload' });
    }

    const config = await prisma.boxBuilderConfig.findUnique({
      where: { id: boxBuilderConfigId },
      include: { eligibleProducts: true }
    });

    if (!config || !config.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Box Builder not found' });
    }

    if (selectedProductIds.length !== config.itemsRequired) {
      return errorResponse(res, { statusCode: 400, message: `Exactly ${config.itemsRequired} items are required` });
    }

    const eligibleIds = config.eligibleProducts.map(ep => ep.productId);
    const allEligible = selectedProductIds.every(id => eligibleIds.includes(id));
    
    if (!allEligible) {
      return errorResponse(res, { statusCode: 400, message: 'One or more selected products are not eligible' });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        boxBuilderConfigId,
        boxBuilderSelections: selectedProductIds,
        quantity: 1
      }
    });

    return successResponse(res, { data: cartItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid quantity' });
    }

    const item = await prisma.cartItem.findUnique({ where: { id }, include: { product: true, variant: true } });
    if (!item || item.userId !== req.user.id) {
      return errorResponse(res, { statusCode: 404, message: 'Cart item not found' });
    }

    const stock = item.variant ? item.variant.stockQty : item.product.stockQty;
    if (stock < quantity) {
      return errorResponse(res, { statusCode: 400, message: 'Insufficient stock' });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return successResponse(res, { data: updated });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== req.user.id) {
      return errorResponse(res, { statusCode: 404, message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id } });
    return successResponse(res, { message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};
