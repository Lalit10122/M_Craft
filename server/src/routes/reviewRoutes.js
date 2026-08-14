import { Router } from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/', authenticate, createReview);

export default router;
