import { prisma } from '../../config/db.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export const createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return errorResponse(res, { message: 'Name is required', statusCode: 400 });
        
        let slug = slugify(name);
        
        const category = await prisma.category.create({
            data: { name, slug }
        });
        
        return successResponse(res, { data: category, message: 'Category created', statusCode: 201 });
    } catch (error) {
        if (error.code === 'P2002') {
            return errorResponse(res, { message: 'Category slug already exists', statusCode: 400 });
        }
        next(error);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return errorResponse(res, { message: 'Name is required', statusCode: 400 });
        
        let slug = slugify(name);
        
        const category = await prisma.category.update({
            where: { id },
            data: { name, slug }
        });
        
        return successResponse(res, { data: category, message: 'Category updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await prisma.category.delete({
            where: { id }
        });
        
        return successResponse(res, { message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};
