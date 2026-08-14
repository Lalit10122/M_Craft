import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [reviews, totalReviews, ratingAgg] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { user: { select: { name: true } } }
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
      prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true }
      })
    ]);

    return successResponse(res, {
      data: {
        reviews,
        totalReviews,
        averageRating: ratingAgg._avg.rating || 0,
        pagination: { page: pageNum, limit: limitNum, total: totalReviews, totalPages: Math.ceil(totalReviews / limitNum) }
      }
    });
  } catch (error) {
    next(error);
  }
};

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  imageUrl: z.string().url().optional()
});

export const createReview = async (req, res, next) => {
  try {
    const data = reviewSchema.parse(req.body);
    const { productId, rating, comment, imageUrl } = data;

    const hasDeliveredOrder = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        status: 'DELIVERED',
        items: { some: { productId } }
      }
    });

    if (!hasDeliveredOrder) {
      return errorResponse(res, { statusCode: 403, message: 'You must have bought and received this product to review it' });
    }

    const existing = await prisma.review.findFirst({
      where: { userId: req.user.id, productId }
    });

    if (existing) {
      return errorResponse(res, { statusCode: 400, message: 'You have already reviewed this product' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating,
        comment,
        imageUrl,
        isApproved: false
      }
    });

    return successResponse(res, { data: review });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, { statusCode: 400, message: 'Invalid input', errors: error.errors });
    next(error);
  }
};
