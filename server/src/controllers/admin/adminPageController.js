import { prisma } from '../../config/db.js';
import { successResponse } from '../../utils/apiResponse.js';

export const listPages = async (req, res, next) => {
  try {
    const pages = await prisma.staticPage.findMany();
    return successResponse(res, { data: pages });
  } catch (error) {
    next(error);
  }
};

export const createPage = async (req, res, next) => {
  try {
    const { title, slug, content, metaTitle, metaDesc, isActive } = req.body;
    const page = await prisma.staticPage.create({
      data: { title, slug, content, metaTitle, metaDesc, isActive }
    });
    return successResponse(res, { data: page }, 201);
  } catch (error) {
    next(error);
  }
};

export const listFaqs = async (req, res, next) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    return successResponse(res, { data: faqs });
  } catch (error) {
    next(error);
  }
};

export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    const faq = await prisma.fAQ.create({
      data: { question, answer, category, order, isActive }
    });
    return successResponse(res, { data: faq }, 201);
  } catch (error) {
    next(error);
  }
};
