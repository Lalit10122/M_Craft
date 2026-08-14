import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { razorpay } from '../../config/razorpay.js';
import { notifyReturnUpdate } from '../../services/notificationService.js';

export const listReturns = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        let where = {};
        if (status) where.status = status;

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const [returns, total] = await Promise.all([
            prisma.returnRequest.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            totalAmount: true,
                            status: true,
                            paymentMethod: true,
                            user: {
                                select: { name: true, email: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: l
            }),
            prisma.returnRequest.count({ where })
        ]);

        return successResponse(res, {
            data: {
                returns,
                pagination: {
                    total,
                    page: p,
                    limit: l,
                    totalPages: Math.ceil(total / l)
                }
            },
            message: 'Returns retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const approveReturn = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnReq = await prisma.returnRequest.findUnique({
            where: { id },
            include: { order: { include: { user: true } } }
        });

        if (!returnReq) {
            return errorResponse(res, { message: 'Return request not found', statusCode: 404 });
        }

        if (returnReq.status !== 'REQUESTED') {
            return errorResponse(res, { message: 'Return request must be in REQUESTED state', statusCode: 400 });
        }

        const updatedReturn = await prisma.returnRequest.update({
            where: { id },
            data: { status: 'APPROVED' },
            include: { order: { include: { user: true } } }
        });

        await prisma.auditLog.create({
            data: {
                action: 'RETURN_APPROVED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'ReturnRequest',
                targetId: id,
                metadata: { oldStatus: 'REQUESTED', newStatus: 'APPROVED' },
                ipAddress: req.ip
            }
        });

        notifyReturnUpdate(updatedReturn, updatedReturn.order, updatedReturn.order.user).catch(console.error);

        return successResponse(res, { data: updatedReturn, message: 'Return request approved successfully' });
    } catch (error) {
        next(error);
    }
};

export const rejectReturn = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return errorResponse(res, { message: 'Rejection reason is required', statusCode: 400 });
        }

        const returnReq = await prisma.returnRequest.findUnique({
            where: { id },
            include: { order: { include: { user: true } } }
        });

        if (!returnReq) {
            return errorResponse(res, { message: 'Return request not found', statusCode: 404 });
        }

        if (returnReq.status !== 'REQUESTED') {
            return errorResponse(res, { message: 'Return request must be in REQUESTED state', statusCode: 400 });
        }

        const updatedReturn = await prisma.returnRequest.update({
            where: { id },
            data: { status: 'REJECTED', adminNote: reason },
            include: { order: { include: { user: true } } }
        });

        await prisma.auditLog.create({
            data: {
                action: 'RETURN_REJECTED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'ReturnRequest',
                targetId: id,
                metadata: { reason },
                ipAddress: req.ip
            }
        });

        notifyReturnUpdate(updatedReturn, updatedReturn.order, updatedReturn.order.user).catch(console.error);

        return successResponse(res, { data: updatedReturn, message: 'Return request rejected successfully' });
    } catch (error) {
        next(error);
    }
};

export const markPickedUp = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnReq = await prisma.returnRequest.findUnique({
            where: { id },
            include: { order: { include: { user: true } } }
        });

        if (!returnReq) {
            return errorResponse(res, { message: 'Return request not found', statusCode: 404 });
        }

        if (returnReq.status !== 'APPROVED') {
            return errorResponse(res, { message: 'Return request must be in APPROVED state', statusCode: 400 });
        }

        const updatedReturn = await prisma.returnRequest.update({
            where: { id },
            data: { status: 'PICKUP_SCHEDULED' },
            include: { order: { include: { user: true } } }
        });

        await prisma.auditLog.create({
            data: {
                action: 'RETURN_PICKED_UP',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'ReturnRequest',
                targetId: id,
                metadata: { oldStatus: 'APPROVED', newStatus: 'PICKUP_SCHEDULED' },
                ipAddress: req.ip
            }
        });

        notifyReturnUpdate(updatedReturn, updatedReturn.order, updatedReturn.order.user).catch(console.error);

        return successResponse(res, { data: updatedReturn, message: 'Return request marked as picked up' });
    } catch (error) {
        next(error);
    }
};

export const processRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { refundAmount } = req.body;

        const returnReq = await prisma.returnRequest.findUnique({
            where: { id },
            include: { order: { include: { user: true } } }
        });

        if (!returnReq) {
            return errorResponse(res, { message: 'Return request not found', statusCode: 404 });
        }

        if (returnReq.status === 'REFUND_COMPLETED' || returnReq.status === 'REJECTED') {
            return errorResponse(res, { message: 'Cannot refund a completed or rejected return request', statusCode: 400 });
        }

        if (!refundAmount || refundAmount <= 0 || refundAmount > returnReq.order.totalAmount) {
            return errorResponse(res, { message: 'Invalid refund amount', statusCode: 400 });
        }

        let razorpayRefundId = null;

        if (returnReq.order.paymentMethod === 'RAZORPAY') {
            if (!returnReq.order.razorpayPaymentId) {
                 return errorResponse(res, { message: 'Razorpay payment ID missing from order', statusCode: 400 });
            }
            const refundParams = { amount: Math.round(refundAmount * 100) };
            const refund = await razorpay.payments.refund(returnReq.order.razorpayPaymentId, refundParams);
            razorpayRefundId = refund.id;
        }

        const updatedOrderData = { refundAmount, status: 'REFUNDED' };
        if (razorpayRefundId) {
            updatedOrderData.razorpayRefundId = razorpayRefundId;
        }

        const [updatedOrder, updatedReturn] = await prisma.$transaction([
            prisma.order.update({
                where: { id: returnReq.orderId },
                data: updatedOrderData,
                include: { user: true }
            }),
            prisma.returnRequest.update({
                where: { id },
                data: { status: 'REFUND_COMPLETED', refundAmount }
            })
        ]);

        await prisma.auditLog.create({
            data: {
                action: 'REFUND_PROCESSED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'ReturnRequest',
                targetId: id,
                metadata: { refundAmount, razorpayRefundId },
                ipAddress: req.ip
            }
        });

        notifyReturnUpdate(updatedReturn, updatedOrder, updatedOrder.user).catch(console.error);

        return successResponse(res, { 
            data: { order: updatedOrder, returnRequest: updatedReturn }, 
            message: 'Refund processed successfully' 
        });
    } catch (error) {
        next(error);
    }
};

export const updateReturnStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const returnReq = await prisma.returnRequest.findUnique({
            where: { id },
            include: { order: { include: { user: true } } }
        });

        if (!returnReq) {
            return errorResponse(res, { message: 'Return request not found', statusCode: 404 });
        }

        const data = { status };
        if (adminNote) data.adminNote = adminNote;

        const updatedReturn = await prisma.returnRequest.update({
            where: { id },
            data,
            include: { order: { include: { user: true } } }
        });

        await prisma.auditLog.create({
            data: {
                action: 'RETURN_STATUS_UPDATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'ReturnRequest',
                targetId: id,
                metadata: { oldStatus: returnReq.status, newStatus: status, adminNote },
                ipAddress: req.ip
            }
        });

        notifyReturnUpdate(updatedReturn, updatedReturn.order, updatedReturn.order.user).catch(console.error);

        return successResponse(res, { data: updatedReturn, message: `Return request status updated to ${status}` });
    } catch (error) {
        next(error);
    }
};
