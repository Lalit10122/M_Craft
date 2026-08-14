import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const getPageBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await prisma.staticPage.findUnique({ where: { slug } });
    if (!page || !page.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Page not found' });
    }
    return successResponse(res, { data: page });
  } catch (error) {
    next(error);
  }
};

export const getFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) {
      where.category = category;
    }
    
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: { order: 'asc' }
    });
    return successResponse(res, { data: faqs });
  } catch (error) {
    next(error);
  }
};
