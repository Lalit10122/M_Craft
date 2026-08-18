import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { notifyOrderPacked, notifyOrderShipped, notifyOutForDelivery, notifyOrderDelivered } from '../../services/notificationService.js';
import { generateInvoice } from '../../services/invoiceService.js';

export const listOrders = async (req, res, next) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 10, search } = req.query;
        
        let where = {};
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }
        
        if (search) {
            where.OR = [
                { id: { contains: search } },
                { user: { email: { contains: search } } }
            ];
        }

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: { select: { name: true, email: true } },
                    _count: { select: { items: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: l
            }),
            prisma.order.count({ where })
        ]);

        return successResponse(res, {
            data: {
                orders,
                pagination: {
                    total,
                    page: p,
                    limit: l,
                    totalPages: Math.ceil(total / l)
                }
            },
            message: 'Orders retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminOrderDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { name: true, email: true } },
                items: { include: { product: true } },
                returnRequests: true
            }
        });

        if (!order) {
            return errorResponse(res, { message: 'Order not found', statusCode: 404 });
        }

        return successResponse(res, { data: order, message: 'Order retrieved successfully' });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber, trackingUrl } = req.body;

        const validStatuses = ['PENDING', 'PAID', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
        if (!validStatuses.includes(status)) {
            return errorResponse(res, { message: 'Invalid status', statusCode: 400 });
        }

        const existingOrder = await prisma.order.findUnique({ 
            where: { id },
            include: { user: true }
        });
        
        if (!existingOrder) return errorResponse(res, { message: 'Order not found', statusCode: 404 });

        if (existingOrder.status === 'DELIVERED' && status !== 'DELIVERED') {
            return errorResponse(res, { message: 'Cannot change status of a delivered order', statusCode: 400 });
        }

        const dataToUpdate = { status };
        if (trackingNumber) dataToUpdate.trackingNumber = trackingNumber;
        if (trackingUrl) dataToUpdate.trackingUrl = trackingUrl;

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: dataToUpdate,
            include: { user: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'ORDER_STATUS_UPDATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Order',
                targetId: id,
                metadata: { oldStatus: existingOrder.status, newStatus: status },
                ipAddress: req.ip
            }
        });
        
        // Notifications & Invoice generation (fire-and-forget)
        if (status === 'PACKED') {
            notifyOrderPacked(updatedOrder, updatedOrder.user).catch(console.error);
            if (updatedOrder.paymentMethod === 'RAZORPAY' && !updatedOrder.invoiceUrl) {
                generateInvoice(id).catch(console.error);
            }
        } else if (status === 'SHIPPED') {
            notifyOrderShipped(updatedOrder, updatedOrder.user).catch(console.error);
        } else if (status === 'OUT_FOR_DELIVERY') {
            notifyOutForDelivery(updatedOrder, updatedOrder.user).catch(console.error);
        } else if (status === 'DELIVERED') {
            (async () => {
                let currentOrder = updatedOrder;
                if (!currentOrder.invoiceUrl) {
                    try {
                        const inv = await generateInvoice(id);
                        if (inv && inv.invoiceUrl) {
                            currentOrder = { ...currentOrder, invoiceUrl: inv.invoiceUrl, invoiceNumber: inv.invoiceNumber };
                        }
                    } catch (e) {
                        console.error('Failed to generate invoice before delivery email:', e);
                    }
                }
                notifyOrderDelivered(currentOrder, currentOrder.user).catch(console.error);
            })();
        }

        return successResponse(res, { data: updatedOrder, message: 'Order status updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const getAdminInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingOrder = await prisma.order.findUnique({ where: { id } });
        
        if (!existingOrder) {
            return errorResponse(res, { message: 'Order not found', statusCode: 404 });
        }

        if (existingOrder.invoiceUrl) {
            return successResponse(res, { 
                data: { invoiceUrl: existingOrder.invoiceUrl, invoiceNumber: existingOrder.invoiceNumber },
                message: 'Invoice retrieved'
            });
        }

        const invoice = await generateInvoice(id);
        return successResponse(res, { 
            data: invoice,
            message: 'Invoice generated successfully'
        });
    } catch (error) {
        next(error);
    }
};
