import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { calculateDiscountPercent, getBestActivePromotion } from '../services/priceService.js';

export const listProducts = async (req, res, next) => {
  try {
    const { category, color, collection, minPrice, maxPrice, sort, page = 1, limit = 12, search, q, isBestSeller, promotion, ...attributeFilters } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = { isActive: true };

    if (isBestSeller === 'true') where.isBestSeller = true;
    if (category) where.category = { slug: category };
    if (collection) where.collections = { some: { collection: { slug: collection } } };
    if (color) where.color = { equals: color, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }
    if (q || search) {
      const searchTerm = q || search;
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (Object.keys(attributeFilters).length > 0) {
      where.attributeValues = {
        some: {
          OR: Object.entries(attributeFilters).map(([key, value]) => ({
            attribute: { key },
            value: { equals: value, mode: 'insensitive' }
          }))
        }
      };
    }

    let orderBy = {};
    if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
    else if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else orderBy = { createdAt: 'desc' };

    const [productsRaw, total, activePromotionsList] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
        include: {
          category: { select: { name: true, slug: true } },
          collections: true,
          attributeValues: {
             include: { attribute: true }
          },
          _count: {
            select: { reviews: { where: { isApproved: true } } }
          }
        }
      }),
      prisma.product.count({ where }),
      prisma.promotion.findMany({
        where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        include: { specificProducts: true }
      })
    ]);

    let products = productsRaw.map(p => {
      const pWithImages = { ...p, firstImage: p.images && p.images.length > 0 ? p.images[0] : null };
      const discountPercent = calculateDiscountPercent(p.mrp, p.basePrice);
      const activePromotion = getBestActivePromotion(p, p.basePrice, activePromotionsList);
      
      const attributes = {};
      if (p.attributeValues) {
         p.attributeValues.forEach(attrVal => {
             attributes[attrVal.attribute.key] = attrVal.value;
         });
      }
      
      return { ...pWithImages, discountPercent, activePromotion, attributes };
    });
    
    if (promotion) {
      products = products.filter(p => p.activePromotion && p.activePromotion.name.toLowerCase().includes(promotion.toLowerCase()));
    }

    return successResponse(res, {
      data: {
        products,
        pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        },
        collections: { include: { collection: true } },
        attributeValues: {
          include: { attribute: true }
        }
      }
    });

    if (!product || !product.isActive) {
      return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    }

    const discountPercent = calculateDiscountPercent(product.mrp, product.basePrice);
    
    let averageRating = 0;
    if (product.reviews && product.reviews.length > 0) {
      const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / product.reviews.length;
    }

    const activePromotionsList = await prisma.promotion.findMany({
      where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
      include: { specificProducts: true }
    });
    const activePromotion = getBestActivePromotion(product, product.basePrice, activePromotionsList);

    const attributes = {};
    if (product.attributeValues) {
       product.attributeValues.forEach(attrVal => {
           attributes[attrVal.attribute.key] = attrVal.value;
       });
    }

    return successResponse(res, {
      data: { ...product, discountPercent, averageRating, activePromotion, attributes }
    });
  } catch (error) {
    next(error);
  }
};

export const suggestProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return successResponse(res, { data: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        isActive: true
      },
      take: 5,
      select: { name: true, slug: true, images: true }
    });

    const data = products.map(p => ({
      name: p.name,
      slug: p.slug,
      firstImage: p.images && p.images.length > 0 ? p.images[0] : null
    }));

    return successResponse(res, { data });
  } catch (error) {
    next(error);
  }
};

export const trackProductView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return errorResponse(res, { statusCode: 404, message: 'Product not found' });
    
    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId, productId: id } },
      update: { viewedAt: new Date() },
      create: { userId, productId: id }
    });
    
    return successResponse(res, { message: 'View tracked' });
  } catch (error) {
    next(error);
  }
};

export const getRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: {
        product: {
          select: { id: true, name: true, slug: true, basePrice: true, mrp: true, firstImage: true, stockQty: true }
        }
      }
    });
    
    return successResponse(res, { data: recentlyViewed.map(rv => rv.product) });
  } catch (error) {
    next(error);
  }
};
