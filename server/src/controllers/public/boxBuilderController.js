import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const getBoxBuilderConfig = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const config = await prisma.boxBuilderConfig.findUnique({
      where: { slug },
      include: {
        eligibleProducts: {
          include: { product: true }
        }
      }
    });

    if (!config || !config.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Box Builder configuration not found' });
    }

    return successResponse(res, { data: config });
  } catch (err) {
    next(err);
  }
};
