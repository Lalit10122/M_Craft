import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
    try {
        const range = req.query.range || '30d'; // 7d, 30d, ytd, all
        const now = new Date();
        let startDate;

        if (range === '7d') {
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        } else if (range === 'ytd') {
            startDate = new Date(now.getFullYear(), 0, 1);
        } else if (range === 'all') {
            startDate = new Date(2000, 0, 1);
        } else {
            // default 30d
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        }

        const revenueStatuses = ['PAID', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

        const [
            totalRevenueResult,
            totalOrders,
            lowStockProducts,
            recentOrders,
            ordersInPeriod,
            topSellingItems,
            categorySalesRaw,
            pendingReturns
        ] = await Promise.all([
            // Total Revenue in period
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: { in: revenueStatuses }, createdAt: { gte: startDate } }
            }),
            // Total Orders in period
            prisma.order.count({
                where: { createdAt: { gte: startDate } }
            }),
            // Low Stock (Current state)
            prisma.product.count({
                where: { stockQty: { lt: 10 }, isActive: true }
            }),
            // Recent Orders
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            }),
            // Orders for chart
            prisma.order.findMany({
                where: { status: { in: revenueStatuses }, createdAt: { gte: startDate } },
                select: { createdAt: true, totalAmount: true }
            }),
            // Top selling products in period
            prisma.orderItem.groupBy({
                by: ['productId'],
                where: { order: { status: { in: revenueStatuses }, createdAt: { gte: startDate } }, productId: { not: null } },
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5
            }),
            // Sales by category
            prisma.orderItem.findMany({
                where: { order: { status: { in: revenueStatuses }, createdAt: { gte: startDate } }, productId: { not: null } },
                include: { product: { include: { category: true } } }
            }),
            // Pending returns (current state)
            prisma.returnRequest.count({
                where: { status: 'REQUESTED' }
            })
        ]);

        // Revenue Chart logic
        const revenueMap = {};
        const isDaily = (range === '7d' || range === '30d');
        
        if (isDaily) {
            const days = range === '7d' ? 7 : 30;
            for (let i = 0; i < days; i++) {
                const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                revenueMap[d.toISOString().split('T')[0]] = 0;
            }
        } else {
            // Monthly bucketing for YTD / All
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const endYear = now.getFullYear();
            const endMonth = now.getMonth();
            
            for (let y = startYear; y <= endYear; y++) {
                const mStart = (y === startYear) ? startMonth : 0;
                const mEnd = (y === endYear) ? endMonth : 11;
                for (let m = mStart; m <= mEnd; m++) {
                    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
                    revenueMap[monthKey] = 0;
                }
            }
        }

        ordersInPeriod.forEach(order => {
            const dateStr = isDaily ? order.createdAt.toISOString().split('T')[0] : `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
            if (revenueMap[dateStr] !== undefined) {
                revenueMap[dateStr] += order.totalAmount;
            } else if (!isDaily) {
                revenueMap[dateStr] = order.totalAmount; // Fallback for very old data
            }
        });

        const revenueChartData = Object.keys(revenueMap).map(date => ({
            date,
            revenue: revenueMap[date]
        })).sort((a, b) => new Date(isDaily ? a.date : a.date + '-01') - new Date(isDaily ? b.date : b.date + '-01'));

        // Category Sales Map
        const catSales = {};
        categorySalesRaw.forEach(item => {
            if (item.product && item.product.category) {
                const catName = item.product.category.name;
                catSales[catName] = (catSales[catName] || 0) + (item.quantity * item.priceAtPurchase);
            }
        });
        const categoryChartData = Object.keys(catSales).map(name => ({ name, value: catSales[name] }));

        // Top Products Map
        const topProductIds = topSellingItems.map(item => item.productId);
        const productsInfo = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true }
        });
        const productMap = {};
        productsInfo.forEach(p => productMap[p.id] = p.name);

        const topProductsChartData = topSellingItems.map(item => ({
            name: productMap[item.productId] || 'Unknown',
            sales: item._sum.quantity
        }));

        return successResponse(res, {
            data: {
                totalRevenue: totalRevenueResult._sum.totalAmount || 0,
                totalOrders,
                pendingReturns,
                lowStockProducts,
                revenueChartData,
                categoryChartData,
                topProductsChartData,
                recentOrders: recentOrders.map(o => ({
                    id: o.id,
                    userName: o.user?.name,
                    status: o.status,
                    totalAmount: o.totalAmount,
                    createdAt: o.createdAt
                }))
            },
            message: 'Dashboard stats retrieved'
        });
    } catch (error) {
        next(error);
    }
};

export const listLowStockProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const setting = await prisma.setting.findUnique({ where: { key: 'low_stock_threshold' } });
        const threshold = setting && setting.value ? parseInt(setting.value) : 5;

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const where = {
            stockQty: { lte: threshold },
            isActive: true
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: { select: { name: true } } },
                orderBy: { stockQty: 'asc' },
                skip,
                take: l
            }),
            prisma.product.count({ where })
        ]);

        return successResponse(res, {
            data: {
                products,
                threshold,
                pagination: {
                    total,
                    page: p,
                    limit: l,
                    totalPages: Math.ceil(total / l)
                }
            },
            message: 'Low stock products retrieved'
        });
    } catch (error) {
        next(error);
    }
};
