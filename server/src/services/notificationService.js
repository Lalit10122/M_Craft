import {
  sendWelcomeEmail,
  sendNewLoginAlertEmail,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendAccountLockedEmail,
  send2FAEnabledEmail,
  sendCompleteProfileNudgeEmail,
  sendBackInStockEmail,
  sendOrderConfirmationEmail,
  sendOrderPackedEmail,
  sendOrderShippedEmail,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendReturnRequestReceivedEmail,
  sendReturnApprovedEmail,
  sendReturnRejectedEmail,
  sendRefundProcessedEmail,
  sendAbandonedCartEmail,
  sendLowStockDigestEmail,
  sendReviewSubmittedEmail,
  sendReviewApprovedEmail,
  sendWishlistPriceDropEmail
} from './emailService.js';
import { prisma } from '../config/db.js';

const sendSms = async (phone, message) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
    } else {
      console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
      // Implement real SMS integration here in the future
    }
  } catch (error) {
    console.error(`Failed to send SMS to ${phone}:`, error.message);
  }
};

export const notifyOrderConfirmed = async (order, user) => {
  try {
    await sendOrderConfirmationEmail(user.email, order);
    if (user.phone) {
      await sendSms(user.phone, `Your Malkincraft order #${order.id} is confirmed! Total: ₹${order.totalAmount}`);
    }
  } catch (error) {
    console.error(`Error in notifyOrderConfirmed for order ${order.id}:`, error);
  }
};

export const notifyOrderPacked = async (order, user) => {
  try {
    await sendOrderPackedEmail(user.email, order);
  } catch (error) {
    console.error(`Error in notifyOrderPacked for order ${order.id}:`, error);
  }
};

export const notifyOrderShipped = async (order, user) => {
  try {
    await sendOrderShippedEmail(user.email, order);
    if (user.phone) {
      const tracking = order.trackingNumber ? ` Track: ${order.trackingUrl}` : '';
      await sendSms(user.phone, `Your order #${order.id} has been shipped!${tracking}`);
    }
  } catch (error) {
    console.error(`Error in notifyOrderShipped for order ${order.id}:`, error);
  }
};

export const notifyOutForDelivery = async (order, user) => {
  try {
    await sendOutForDeliveryEmail(user.email, order);
    if (user.phone) {
      await sendSms(user.phone, `Your order #${order.id} is out for delivery!`);
    }
  } catch (error) {
    console.error(`Error in notifyOutForDelivery for order ${order.id}:`, error);
  }
};

export const notifyOrderDelivered = async (order, user) => {
  try {
    await sendOrderDeliveredEmail(user.email, order);
  } catch (error) {
    console.error(`Error in notifyOrderDelivered for order ${order.id}:`, error);
  }
};

export const notifyOrderCancelled = async (order, user) => {
  try {
    await sendOrderCancelledEmail(user.email, order);
  } catch (error) {
    console.error(`Error in notifyOrderCancelled for order ${order.id}:`, error);
  }
};

export const notifyReturnRequestReceived = async (order, user) => {
  try {
    await sendReturnRequestReceivedEmail(user.email, order);
  } catch (error) {
    console.error(`Error in notifyReturnRequestReceived for order ${order.id}:`, error);
  }
};

export const notifyReturnUpdate = async (returnRequest, order, user) => {
  try {
    if (returnRequest.status === 'APPROVED') {
      await sendReturnApprovedEmail(user.email, order);
    } else if (returnRequest.status === 'REJECTED') {
      await sendReturnRejectedEmail(user.email, order, returnRequest.adminNote);
    } else if (returnRequest.status === 'REFUND_COMPLETED') {
      await sendRefundProcessedEmail(user.email, order, returnRequest.refundAmount);
    }
  } catch (error) {
    console.error(`Error in notifyReturnUpdate for order ${order.id}:`, error);
  }
};

export const notifyAbandonedCart = async (user, cartItems) => {
  try {
    await sendAbandonedCartEmail(user.email, cartItems, user.name);
  } catch (error) {
    console.error(`Error in notifyAbandonedCart for user ${user.id}:`, error);
  }
};

export const notifyLowStock = async (product, currentQty, threshold) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendLowStockDigestEmail(adminEmail, [{ name: product.name, stockQty: currentQty, threshold }]);
    }
  } catch (error) {
    console.error(`Error in notifyLowStock for product ${product.id}:`, error);
  }
};

export const checkAndNotifyLowStock = async (productId) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return;

    const thresholdSetting = await prisma.setting.findUnique({ where: { key: 'low_stock_threshold' } });
    const threshold = thresholdSetting ? parseInt(thresholdSetting.value, 10) : 10;

    if (product.stockQty <= threshold) {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      if (!product.lastLowStockAlertAt || product.lastLowStockAlertAt < oneDayAgo) {
        await notifyLowStock(product, product.stockQty, threshold);
        
        await prisma.product.update({
          where: { id: productId },
          data: { lastLowStockAlertAt: now }
        });
      }
    }
  } catch (error) {
    console.error(`Error in checkAndNotifyLowStock for product ${productId}:`, error);
  }
};

// Expose direct wrappers for auth and other features that don't need complex internal logic
export {
  sendWelcomeEmail,
  sendNewLoginAlertEmail,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendAccountLockedEmail,
  send2FAEnabledEmail,
  sendCompleteProfileNudgeEmail,
  sendBackInStockEmail,
  sendReviewSubmittedEmail,
  sendReviewApprovedEmail,
  sendWishlistPriceDropEmail
};
