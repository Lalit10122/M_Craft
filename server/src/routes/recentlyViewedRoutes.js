import { Router } from 'express';
import { getRecentlyViewed, addRecentlyViewed } from '../controllers/recentlyViewedController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getRecentlyViewed);
router.post('/', addRecentlyViewed);

export default router;
