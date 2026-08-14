import { Router } from 'express';
import { applyCoupon } from '../controllers/couponController.js';

const router = Router();

router.post('/apply', applyCoupon);

export default router;
