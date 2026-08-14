import { prisma } from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

export const listCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      }
    });

    return successResponse(res, { data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryAttributes = async (req, res, next) => {
  try {
    const attributes = await prisma.categoryAttribute.findMany({
      where: { categoryId: req.params.id }
    });
    return successResponse(res, { data: attributes });
  } catch (error) {
    next(error);
  }
};
