import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

const maskEmail = (email) => {
    if (!email) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 3) return email;
    return `${name.slice(0, 3)}***${name.slice(-2)}@${domain}`;
};

const maskPhone = (phone) => {
    if (!phone) return phone;
    if (phone.length <= 4) return phone;
    return `${phone.slice(0, 2)}****${phone.slice(-2)}`;
};

export const listUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query;
        let where = {};
        
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    isBlocked: true,
                    createdAt: true,
                    _count: { select: { orders: true } }
                },
                skip,
                take: l,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        const maskedUsers = users.map(u => ({
            ...u,
            email: maskEmail(u.email),
            phone: maskPhone(u.phone)
        }));

        return successResponse(res, {
            data: {
                users: maskedUsers,
                pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
            },
            message: 'Users retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getUserDetail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                orders: { orderBy: { createdAt: 'desc' } }
            }
        });

        if (!user) return errorResponse(res, { message: 'User not found', statusCode: 404 });

        return successResponse(res, {
            data: {
                ...user,
                email: maskEmail(user.email),
                phone: maskPhone(user.phone)
            }
        });
    } catch (error) {
        next(error);
    }
};

export const toggleBlockUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        
        if (!user) return errorResponse(res, { message: 'User not found', statusCode: 404 });
        if (user.id === req.user.id) return errorResponse(res, { message: 'Cannot block yourself', statusCode: 400 });
        if (user.role === 'ADMIN') return errorResponse(res, { message: 'Cannot block another admin', statusCode: 400 });

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isBlocked: !user.isBlocked }
        });

        await prisma.auditLog.create({
            data: {
                action: updatedUser.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'User',
                targetId: id,
                metadata: { userId: id },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: updatedUser, message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (error) {
        next(error);
    }
};
