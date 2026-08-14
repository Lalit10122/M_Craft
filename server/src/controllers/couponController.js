import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

const applyCouponSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().positive()
});

export const applyCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = applyCouponSchema.parse(req.body);
    const coupon = await prisma.coupon.findFirst({ where: { code: { equals: code, mode: 'insensitive' } } });

    if (!coupon || !coupon.isActive || coupon.validTill < new Date() || coupon.minOrderValue > cartTotal || (coupon.usageLimit !== null && coupon.timesUsed >= coupon.usageLimit)) {
      return errorResponse(res, { statusCode: 400, message: 'Invalid or expired coupon' });
    }

    let discount = 0;
    if (coupon.discountType === 'FLAT') {
      discount = coupon.discountValue;
    } else {
      discount = (coupon.discountValue / 100) * cartTotal;
    }

    if (discount > cartTotal) discount = cartTotal;

    return successResponse(res, {
      data: {
        valid: true,
        discount,
        discountType: coupon.discountType,
        couponCode: coupon.code,
        finalTotal: cartTotal - discount
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, { statusCode: 400, message: 'Invalid input', errors: error.errors });
    next(error);
  }
};
