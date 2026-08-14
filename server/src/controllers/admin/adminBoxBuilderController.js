import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const listBoxBuilders = async (req, res, next) => {
  try {
    const configs = await prisma.boxBuilderConfig.findMany({
      include: {
        eligibleProducts: {
          include: { product: { select: { name: true } } }
        }
      }
    });
    return successResponse(res, { data: configs });
  } catch (err) {
    next(err);
  }
};

export const createBoxBuilder = async (req, res, next) => {
  try {
    const { name, slug, itemsRequired, bundlePrice, isActive, productIds } = req.body;
    const config = await prisma.boxBuilderConfig.create({
      data: {
        name, slug, itemsRequired, bundlePrice, isActive: isActive !== undefined ? isActive : true,
        eligibleProducts: productIds ? {
          create: productIds.map(id => ({ productId: id }))
        } : undefined
      }
    });
    return successResponse(res, { data: config }, 201);
  } catch (err) {
    next(err);
  }
};

export const updateBoxBuilder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, itemsRequired, bundlePrice, isActive, productIds } = req.body;
    
    const config = await prisma.boxBuilderConfig.update({
      where: { id },
      data: { name, slug, itemsRequired, bundlePrice, isActive }
    });

    if (productIds) {
      await prisma.boxBuilderEligibleProduct.deleteMany({ where: { boxBuilderConfigId: id } });
      await prisma.boxBuilderEligibleProduct.createMany({
        data: productIds.map(pid => ({ boxBuilderConfigId: id, productId: pid }))
      });
    }

    return successResponse(res, { data: config });
  } catch (err) {
    next(err);
  }
};

export const deleteBoxBuilder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.boxBuilderEligibleProduct.deleteMany({ where: { boxBuilderConfigId: id } });
    await prisma.boxBuilderConfig.delete({ where: { id } });
    return successResponse(res, { message: 'Box builder deleted successfully' });
  } catch (err) {
    next(err);
  }
};
