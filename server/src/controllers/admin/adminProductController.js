import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { deleteFromS3 } from '../../services/s3Service.js';
import { slugify } from '../../utils/slugify.js';
import { z } from 'zod';

export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: { variants: true }
        });
        if (!product) return errorResponse(res, { message: 'Product not found', statusCode: 404 });
        return successResponse(res, { data: product });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            categoryId: z.string().cuid().optional(),
            material: z.string().optional(),
            color: z.string().optional(),
            basePrice: z.number().positive(),
            mrp: z.number().positive(),
            stockQty: z.number().int().nonnegative(),
            isActive: z.boolean().default(true),
            isBestSeller: z.boolean().default(false),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional()
        });
        const data = schema.parse(req.body);
        let slug = slugify(data.name);
        let existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
        }
        
        const product = await prisma.product.create({
            data: { ...data, slug }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PRODUCT_CREATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Product',
                targetId: product.id,
                metadata: { productName: product.name },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: product, message: 'Product created successfully', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schema = z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            categoryId: z.string().cuid().optional(),
            material: z.string().optional(),
            color: z.string().optional(),
            basePrice: z.number().positive().optional(),
            mrp: z.number().positive().optional(),
            stockQty: z.number().int().nonnegative().optional(),
            isActive: z.boolean().optional(),
            isBestSeller: z.boolean().optional(),
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional()
        });
        const data = schema.parse(req.body);
        if (data.name) {
            let slug = slugify(data.name);
            let existing = await prisma.product.findUnique({ where: { slug } });
            if (existing && existing.id !== id) {
                slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
            }
            data.slug = slug;
        }

        const product = await prisma.product.update({
            where: { id },
            data
        });

        await prisma.auditLog.create({
            data: {
                action: 'PRODUCT_UPDATED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Product',
                targetId: product.id,
                metadata: { updatedFields: Object.keys(data) },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { data: product, message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.update({
            where: { id },
            data: { isActive: false }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PRODUCT_DELETED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Product',
                targetId: id,
                metadata: { productName: product.name },
                ipAddress: req.ip
            }
        });

        return successResponse(res, { message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const uploadImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.files || req.files.length === 0) {
            return errorResponse(res, { message: 'No images uploaded', statusCode: 400 });
        }

        const newImages = req.files.map(file => file.location || file.path); // S3 URL or local path
        
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        const updatedImages = [...(existingProduct.images || []), ...newImages];

        const product = await prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });

        return successResponse(res, { data: updatedImages, message: 'Images uploaded successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        
        if (!imageUrl) return errorResponse(res, { message: 'imageUrl is required', statusCode: 400 });

        const existingProduct = await prisma.product.findUnique({ where: { id } });
        const updatedImages = (existingProduct.images || []).filter(img => img !== imageUrl);

        await deleteFromS3(imageUrl);

        await prisma.product.update({
            where: { id },
            data: { images: updatedImages }
        });

        return successResponse(res, { message: 'Image deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const addVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const schema = z.object({
            label: z.string(),
            price: z.number().positive(),
            stockQty: z.number().int().nonnegative(),
            isDefault: z.boolean().default(false)
        });
        const data = schema.parse(req.body);

        if (data.isDefault) {
            await prisma.productVariant.updateMany({
                where: { productId: id, isDefault: true },
                data: { isDefault: false }
            });
        }

        const variant = await prisma.productVariant.create({
            data: { ...data, productId: id }
        });

        return successResponse(res, { data: variant, message: 'Variant added successfully', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const updateVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        const schema = z.object({
            label: z.string().optional(),
            price: z.number().positive().optional(),
            stockQty: z.number().int().nonnegative().optional(),
            isDefault: z.boolean().optional()
        });
        const data = schema.parse(req.body);

        if (data.isDefault) {
            await prisma.productVariant.updateMany({
                where: { productId: id, isDefault: true, id: { not: variantId } },
                data: { isDefault: false }
            });
        }

        const variant = await prisma.productVariant.update({
            where: { id: variantId },
            data
        });

        return successResponse(res, { data: variant, message: 'Variant updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const deleteVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        await prisma.productVariant.delete({ where: { id: variantId } });
        return successResponse(res, { message: 'Variant deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const addToCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { collectionId } = req.body;
        
        try {
            await prisma.productCollection.create({
                data: { productId: id, collectionId }
            });
        } catch (err) {
            if (err.code === 'P2002') {
                return errorResponse(res, { message: 'Product is already in this collection', statusCode: 400 });
            }
            throw err;
        }

        return successResponse(res, { message: 'Product added to collection successfully', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const removeFromCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { collectionId } = req.body;

        await prisma.productCollection.deleteMany({
            where: { productId: id, collectionId }
        });

        return successResponse(res, { message: 'Product removed from collection successfully' });
    } catch (error) {
        next(error);
    }
};

export const createCollection = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return errorResponse(res, { message: 'Name is required', statusCode: 400 });
        let slug = slugify(name);
        
        const collection = await prisma.collection.create({
            data: { name, slug }
        });
        return successResponse(res, { data: collection, message: 'Collection created', statusCode: 201 });
    } catch (error) {
        next(error);
    }
};

export const updateCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return errorResponse(res, { message: 'Name is required', statusCode: 400 });
        
        let slug = slugify(name);
        const collection = await prisma.collection.update({
            where: { id },
            data: { name, slug }
        });
        return successResponse(res, { data: collection, message: 'Collection updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.productCollection.deleteMany({ where: { collectionId: id } });
        await prisma.collection.delete({ where: { id } });
        return successResponse(res, { message: 'Collection deleted' });
    } catch (error) {
        next(error);
    }
};

export const listPendingReviews = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { isApproved: false },
            include: {
                product: { select: { name: true } },
                user: { select: { name: true, email: true } }
            }
        });
        return successResponse(res, { data: reviews, message: 'Pending reviews retrieved' });
    } catch (error) {
        next(error);
    }
};

export const approveReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await prisma.review.update({
            where: { id },
            data: { isApproved: true }
        });
        await prisma.auditLog.create({
            data: {
                action: 'REVIEW_APPROVED',
                actorId: req.user.id,
                actorEmail: req.user.email,
                targetType: 'Review',
                targetId: id,
                metadata: { reviewId: id },
                ipAddress: req.ip
            }
        });
        return successResponse(res, { data: review, message: 'Review approved' });
    } catch (error) {
        next(error);
    }
};
