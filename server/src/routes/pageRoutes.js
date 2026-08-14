import { Router } from 'express';
import { getPageBySlug, getFaqs } from '../controllers/public/pageController.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

router.use(limiter);

router.get('/faq', getFaqs);
router.get('/:slug', getPageBySlug);

export default router;
