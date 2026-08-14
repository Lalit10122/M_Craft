import { Router } from 'express';
import { getActivePromotions } from '../controllers/public/promotionController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get('/active', limiter, getActivePromotions);

export default router;
