import { Router } from 'express';
import { listProducts, getProductBySlug, suggestProducts, trackProductView, getRecentlyViewed } from '../controllers/productController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', listProducts);
router.get('/suggest', suggestProducts);
router.post('/:id/track-view', authenticate, trackProductView);
router.get('/recently-viewed', authenticate, getRecentlyViewed); // Note: /recently-viewed must be before /:slug
router.get('/:slug', getProductBySlug);

export default router;
