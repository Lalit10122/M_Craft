import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { z } from 'zod';

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    return successResponse(res, { data: addresses });
  } catch (error) {
    next(error);
  }
};

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(1),
  isDefault: z.boolean().optional()
});

export const createAddress = async (req, res, next) => {
  try {
    const data = addressSchema.parse(req.body);
    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...data, userId: req.user.id } });
    return successResponse(res, { data: address });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, { statusCode: 400, message: 'Invalid input', errors: error.errors });
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = addressSchema.parse(req.body);
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) return errorResponse(res, { statusCode: 404, message: 'Not found' });

    if (data.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } });
    }
    const address = await prisma.address.update({ where: { id }, data });
    return successResponse(res, { data: address });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, { statusCode: 400, message: 'Invalid input', errors: error.errors });
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) return errorResponse(res, { statusCode: 404, message: 'Not found' });

    await prisma.address.delete({ where: { id } });
    if (existing.isDefault) {
      const anyOther = await prisma.address.findFirst({ where: { userId: req.user.id } });
      if (anyOther) {
        await prisma.address.update({ where: { id: anyOther.id }, data: { isDefault: true } });
      }
    }
    return successResponse(res, { message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};
