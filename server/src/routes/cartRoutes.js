import { Router } from 'express';
import { getCart, addToCart, addBoxBuilderToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', getCart);
router.post('/', addToCart);
router.post('/box-builder', addBoxBuilderToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

export default router;
