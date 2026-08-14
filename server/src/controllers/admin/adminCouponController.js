import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { z } from 'zod';

export const createCoupon = async (req, res, next) => {
    try {
        const schema = z.object({
            code: z.string().min(1).transform(c => c.toUpperCase()),
            discountType: z.enum(['FLAT', 'PERCENT']),
            value: z.number().positive(),
            minOrderValue: z.number().nonnegative().default(0),
            validTill: z.string().datetime(),
            usageLimit: z.number().int().positive().optional()
        });
        
        const data = schema.parse(req.body);
        if (data.discountType === 'PERCENT' && data.value > 100) {
            return errorResponse(res, { message: 'Percentage discount cannot exceed 100', statusCode: 400 });
        }
        
        if (new Date(data.validTill) <= new Date()) {
            return errorResponse(res, { message: 'validTill must be in the future', statusCode: 400 });
        }

        const coupon = await prisma.coupon.create({
            data
        });

        await prisma.auditLog.create({
            data: {
                action: 'COUPON_CREATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Coupon',
                targetId: coupon.id,
                metadata: { code: coupon.code },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: coupon, message: 'Coupon created successfully', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schema = z.object({
            code: z.string().min(1).transform(c => c.toUpperCase()).optional(),
            discountType: z.enum(['FLAT', 'PERCENT']).optional(),
            value: z.number().positive().optional(),
            minOrderValue: z.number().nonnegative().optional(),
            validTill: z.string().datetime().optional(),
            usageLimit: z.number().int().positive().optional(),
            isActive: z.boolean().optional()
        });

        const data = schema.parse(req.body);
        if (data.discountType === 'PERCENT' && data.value > 100) {
            return errorResponse(res, { message: 'Percentage discount cannot exceed 100', statusCode: 400 });
        }
        
        if (data.validTill && new Date(data.validTill) <= new Date()) {
            return errorResponse(res, { message: 'validTill must be in the future', statusCode: 400 });
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data
        });

        await prisma.auditLog.create({
            data: {
                action: 'COUPON_UPDATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Coupon',
                targetId: coupon.id,
                metadata: { updatedFields: Object.keys(data) },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: coupon, message: 'Coupon updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await prisma.coupon.update({
            where: { id },
            data: { isActive: false }
        });

        await prisma.auditLog.create({
            data: {
                action: 'COUPON_DELETED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Coupon',
                targetId: id,
                metadata: { code: coupon.code },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { message: 'Coupon deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const listCoupons = async (req, res, next) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const enhanced = coupons.map(c => ({
            ...c,
            isExpired: new Date(c.validTill) < new Date()
        }));

        return successResponse(res, { data: enhanced, message: 'Coupons retrieved successfully' });
    } catch (error) {
        next(error);
    }
};
