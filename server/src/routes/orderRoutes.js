import { Router } from 'express';
import { createOrder, verifyPayment, listMyOrders, getOrderDetail, cancelOrder, getInvoice, createReturnRequest, getReturnRequest, razorpayWebhook } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();
export const webhookRouter = Router();
webhookRouter.post('/razorpay', razorpayWebhook);

router.use(authenticate);
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', listMyOrders);
router.get('/:id', getOrderDetail);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/invoice', getInvoice);
router.post('/:id/return-request', upload.single('image'), createReturnRequest);
router.get('/:id/return-request', getReturnRequest);

export default router;
