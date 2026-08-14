import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { calculateDiscountPercent } from '../services/priceService.js';

export const listCollections = async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { product: { isActive: true } } } }
        }
      }
    });

    return successResponse(res, { data: collections });
  } catch (error) {
    next(error);
  }
};

export const getCollectionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const collection = await prisma.collection.findUnique({
      where: { slug }
    });

    if (!collection) {
      return errorResponse(res, { statusCode: 404, message: 'Collection not found' });
    }

    const where = { collectionId: collection.id, product: { isActive: true } };

    const [productCollections, total] = await Promise.all([
      prisma.productCollection.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          product: { include: { category: true } }
        }
      }),
      prisma.productCollection.count({ where })
    ]);

    const products = productCollections.map(pc => {
      const p = pc.product;
      const discountPercent = calculateDiscountPercent(p.mrp, p.basePrice);
      return { ...p, discountPercent };
    });

    return successResponse(res, {
      data: {
        collection,
        products,
        pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) }
      }
    });
  } catch (error) {
    next(error);
  }
};
