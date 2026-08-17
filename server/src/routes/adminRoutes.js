import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeAdmin } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

import {
    createProduct, updateProduct, deleteProduct, getProduct,
    uploadImages, deleteImage,
    addVariant, updateVariant, deleteVariant,
    addToCollection, removeFromCollection,
    createCollection, updateCollection, deleteCollection,
    listPendingReviews, approveReview
} from '../controllers/admin/adminProductController.js';

import {
    listOrders, getAdminOrderDetail, updateOrderStatus, getAdminInvoice
} from '../controllers/admin/adminOrderController.js';

import {
    listUsers, toggleBlockUser
} from '../controllers/admin/adminUserController.js';

import {
    listCoupons, createCoupon, updateCoupon, deleteCoupon
} from '../controllers/admin/adminCouponController.js';

import {
    getSettings, updateSetting,
    getPincodes, addPincode, bulkUploadPincodes, deletePincode
} from '../controllers/admin/adminSettingsController.js';

import {
    getDashboardStats, listLowStockProducts
} from '../controllers/admin/adminDashboardController.js';

import {
    listReturns, approveReturn, rejectReturn, markPickedUp, processRefund, updateReturnStatus
} from '../controllers/admin/adminReturnController.js';

import {
    listPromotions, createPromotion, updatePromotion, deletePromotion
} from '../controllers/admin/adminPromotionController.js';

import {
    listBoxBuilders, createBoxBuilder, updateBoxBuilder, deleteBoxBuilder
} from '../controllers/admin/adminBoxBuilderController.js';

import {
    listPages, createPage, listFaqs, createFaq
} from '../controllers/admin/adminPageController.js';

import {
    getFinancialAnalytics, getMarketingAnalytics, getSupplyChainAnalytics, getCrmAnalytics
} from '../controllers/admin/adminAnalyticsController.js';

import {
    getAdminTheme, updateTheme, resetTheme, uploadLogo
} from '../controllers/admin/themeController.js';

const router = Router();

// Apply auth and admin check to all routes
router.use(authenticate, authorizeAdmin);

// Products
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/images', upload.array('images', 10), uploadImages);
router.delete('/products/:id/images', deleteImage);
router.post('/products/:id/variants', addVariant);
router.put('/products/:id/variants/:variantId', updateVariant);
router.delete('/products/:id/variants/:variantId', deleteVariant);
router.post('/products/:id/collections', addToCollection);
router.delete('/products/:id/collections', removeFromCollection);

// Collections
router.post('/collections', createCollection);
router.put('/collections/:id', updateCollection);
router.delete('/collections/:id', deleteCollection);

// Pincodes
router.get('/pincodes', getPincodes);
router.post('/pincodes', addPincode);
router.post('/pincodes/bulk', bulkUploadPincodes);
router.delete('/pincodes/:id', deletePincode);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSetting);

// Promotions
router.get('/promotions', listPromotions);
router.post('/promotions', createPromotion);
router.put('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);

// Box Builders
router.get('/box-builders', listBoxBuilders);
router.post('/box-builders', createBoxBuilder);
router.put('/box-builders/:id', updateBoxBuilder);
router.delete('/box-builders/:id', deleteBoxBuilder);

// Pages & FAQs
router.get('/pages', listPages);
router.post('/pages', createPage);
router.get('/faqs', listFaqs);
router.post('/faqs', createFaq);

// Orders
router.get('/orders', listOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/orders/:id/invoice', getAdminInvoice);

// Users
router.get('/users', listUsers);
router.put('/users/:id/block', toggleBlockUser);

// Coupons
router.get('/coupons', listCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews
router.get('/reviews/pending', listPendingReviews);
router.put('/reviews/:id/approve', approveReview);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/low-stock', listLowStockProducts);

// Returns
router.get('/returns', listReturns);
router.put('/returns/:id/approve', approveReturn);
router.put('/returns/:id/reject', rejectReturn);
router.put('/returns/:id/pickup', markPickedUp);
router.post('/returns/:id/refund', processRefund);
router.put('/returns/:id/status', updateReturnStatus);

// Analytics
router.get('/analytics/financial', getFinancialAnalytics);
router.get('/analytics/marketing', getMarketingAnalytics);
router.get('/analytics/supply-chain', getSupplyChainAnalytics);
router.get('/analytics/crm', getCrmAnalytics);

// Theme
router.get('/theme', getAdminTheme);
router.put('/theme', updateTheme);
router.post('/theme/reset', resetTheme);
router.post('/theme/logo', upload.single('logo'), uploadLogo);

export default router;
