import { prisma } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { razorpay } from '../config/razorpay.js';
import { z } from 'zod';
import { createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from '../services/paymentService.js';
import { generateInvoice } from '../services/invoiceService.js';
import { notifyOrderConfirmed, notifyOrderCancelled, checkAndNotifyLowStock, notifyReturnRequestReceived } from '../services/notificationService.js';
import { getBestActivePromotion, calculateBuyXGetYDiscount, checkFreeGiftEligibility } from '../services/priceService.js';

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().optional(),
    variantId: z.string().optional(),
    quantity: z.number().int().min(1),
    boxBuilderConfigId: z.string().optional(),
    boxBuilderSelections: z.array(z.string()).optional()
  })).min(1),
  addressId: z.string(),
  couponCode: z.string().optional(),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional(),
  paymentMethod: z.enum(['COD', 'RAZORPAY']).default('RAZORPAY')
});

export const createOrder = async (req, res) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const { items, addressId, couponCode, isGift, giftMessage, paymentMethod } = validatedData;
    const userId = req.user.id;

    if (req.user.authProvider === 'LOCAL' && !req.user.emailVerified) {
      return errorResponse(res, { statusCode: 403, message: 'Please verify your email before placing an order' });
    }

    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) return errorResponse(res, 'Address not found', 404);

    // Build the shipping address JSON snapshot to embed in the order
    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || 'India'
    };

    const activePromotions = await prisma.promotion.findMany({
      where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
      include: { specificProducts: true }
    });

    let subtotal = 0;
    const orderItems = [];
    let excludesFreeGift = false;
    const eligibleItemsForBuyXGetY = [];

    for (const item of items) {
      if (item.boxBuilderConfigId) {
        const config = await prisma.boxBuilderConfig.findUnique({ where: { id: item.boxBuilderConfigId } });
        if (!config || !config.isActive) return errorResponse(res, 'Box Builder config not available', 400);
        subtotal += config.bundlePrice * item.quantity;
        orderItems.push({
          boxBuilderConfigId: config.id,
          boxBuilderSelections: item.boxBuilderSelections,
          quantity: item.quantity,
          priceAtPurchase: config.bundlePrice
        });
        continue;
      }

      if (!item.productId) return errorResponse(res, 'Product ID is required for regular items', 400);

      const product = await prisma.product.findUnique({ 
        where: { id: item.productId },
        include: { collections: true, category: true }
      });
      if (!product) return errorResponse(res, `Product not found: ${item.productId}`, 404);

      let price = product.basePrice;
      
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.productId !== item.productId) return errorResponse(res, `Variant not found: ${item.variantId}`, 404);
        if (variant.stockQty < item.quantity) return errorResponse(res, `Insufficient stock for ${product.name} variant`, 400);
        price = variant.price !== undefined ? variant.price : product.basePrice;
      } else {
        if (product.stockQty < item.quantity) return errorResponse(res, `Insufficient stock for ${product.name}`, 400);
      }

      // Re-validate and apply active promotions
      const activePromo = getBestActivePromotion(product, price, activePromotions);
      if (activePromo) {
        price = activePromo.discountedPrice;
        if (activePromo.excludesFreeGift) excludesFreeGift = true;
      }

      subtotal += price * item.quantity;
      const orderItemRecord = {
        productId: product.id,
        variantId: item.variantId || undefined,
        quantity: item.quantity,
        priceAtPurchase: price
      };
      orderItems.push(orderItemRecord);
      
      // We pass the full item for BUY_X_GET_Y calculation
      eligibleItemsForBuyXGetY.push({ ...orderItemRecord, product });
    }
    
    const buyXGetYDiscount = calculateBuyXGetYDiscount(eligibleItemsForBuyXGetY, activePromotions);
    subtotal -= buyXGetYDiscount;
    subtotal = Math.max(0, subtotal);

    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === 'FLAT') discount = coupon.value;
        else if (coupon.discountType === 'PERCENT') discount = subtotal * (coupon.value / 100);
        
        if (coupon.excludesFreeGift) excludesFreeGift = true;
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal - discount);

    let freeGiftProductId = null;
    if (!excludesFreeGift) {
      const freeGiftStatus = await checkFreeGiftEligibility(total);
      if (freeGiftStatus.eligible) {
         freeGiftProductId = freeGiftStatus.freeGiftProductId;
      }
    }

    if (paymentMethod === 'COD') {
      const pincodeObj = await prisma.serviceablePincode.findUnique({ where: { pincode: address.pincode } });
      if (!pincodeObj || !pincodeObj.codAvailable) {
        return errorResponse(res, 'COD not available for this pincode', 400);
      }
      
      const codMaxSetting = await prisma.setting.findUnique({ where: { key: 'cod_max_order_value' } });
      const cap = codMaxSetting ? Number(codMaxSetting.value) : Infinity;
      if (total > cap) {
        return errorResponse(res, `COD not available for orders above ₹${cap}`, 400);
      }

      const newOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            shippingAddress,
            totalAmount: total,
            status: 'PENDING',
            paymentMethod: 'COD',
            couponId: couponId || undefined,
            isGift: isGift || false,
            giftMessage: giftMessage || undefined,
            freeGiftProductId: freeGiftProductId || undefined,
            items: {
              create: orderItems
            }
          },
          include: { items: true }
        });

        for (const item of orderItems) {
          if (item.boxBuilderConfigId) {
             // For simplicity, we could decrement stock of all selected products, but for now we skip since box builder logic usually implies unlimited or checks stock upstream.
             // Actually, we SHOULD decrement stock for all products in the box builder.
             for (const pid of item.boxBuilderSelections) {
                await tx.product.update({
                  where: { id: pid },
                  data: { stockQty: { decrement: item.quantity } }
                });
             }
             continue;
          }

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stockQty: { decrement: item.quantity } }
            });
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: item.quantity } }
          });
        }
        
        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { timesUsed: { increment: 1 } }
          });
        }
        
        await tx.cartItem.deleteMany({ where: { userId } });
        return order;
      });

      generateInvoice(newOrder.id).catch(console.error);
      notifyOrderConfirmed(newOrder, req.user).catch(console.error);
      orderItems.forEach(item => checkAndNotifyLowStock(item.productId).catch(console.error));

      return successResponse(res, 'COD order placed successfully', { order: newOrder }, 201);
    } else {
      const order = await prisma.order.create({
        data: {
          userId,
          shippingAddress,
          totalAmount: total,
          status: 'PENDING',
          paymentMethod: 'RAZORPAY',
          couponId: couponId || undefined,
          isGift: isGift || false,
          giftMessage: giftMessage || undefined,
          freeGiftProductId: freeGiftProductId || undefined,
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      });

      const razorpayOrder = await createRazorpayOrder(total, order.id);
      
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id }
      });

      return successResponse(res, 'Order created successfully', {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        dbOrderId: order.id,
        key: process.env.RAZORPAY_KEY_ID
      }, 201);
    }
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(res, error.errors, 400);
    return errorResponse(res, error.message, 500);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { dbOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: dbOrderId },
      include: { items: true }
    });

    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.userId !== userId) return errorResponse(res, 'Unauthorized', 403);
    if (order.status !== 'PENDING') return errorResponse(res, 'Order is not pending', 400);

    const isValid = verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    if (!isValid) return errorResponse(res, 'Invalid payment signature', 400);

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: dbOrderId },
        data: {
          status: 'PAID',
          razorpayPaymentId: razorpay_payment_id
        }
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { decrement: item.quantity } }
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } }
        });
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { timesUsed: { increment: 1 } }
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });
    });

    generateInvoice(order.id).catch(console.error);
    notifyOrderConfirmed(order, req.user).catch(console.error);
    order.items.forEach(item => checkAndNotifyLowStock(item.productId).catch(console.error));

    return successResponse(res, 'Payment verified successfully', null, 200);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    return successResponse(res, 'Orders fetched', { orders });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, returnRequests: true }
    });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
    return successResponse(res, 'Order details fetched', { order });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
    if (['DELIVERED', 'SHIPPED', 'CANCELLED'].includes(order.status)) {
      return errorResponse(res, `Cannot cancel order with status ${order.status}`, 400);
    }
    
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' }
      });

      // Restore inventory
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQty: { increment: item.quantity } }
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } }
        });
      }

      return updatedOrder;
    });

    notifyOrderCancelled(cancelledOrder, req.user).catch(console.error);
    return successResponse(res, 'Order cancelled', { order: cancelledOrder });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getInvoice = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
    
    if (order.invoiceUrl) {
      return successResponse(res, 'Invoice fetched', { invoiceUrl: order.invoiceUrl, invoiceNumber: order.invoiceNumber });
    }
    return errorResponse(res, 'Invoice not available yet', 404);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createReturnRequest = async (req, res) => {
  try {
    const { reason, comment } = req.body;
    let { imageUrl } = req.body;
    const orderId = req.params.id;

    if (req.file && req.file.location) {
      imageUrl = req.file.location;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.userId !== req.user.id) return errorResponse(res, 'Unauthorized', 403);
    if (order.status !== 'DELIVERED') return errorResponse(res, 'Order is not delivered yet', 400);

    const setting = await prisma.setting.findUnique({ where: { key: 'return_window_days' } });
    const windowDays = setting ? Number(setting.value) : 7;
    const deliveredAt = order.updatedAt; // Using updatedAt as proxy for deliveredAt or we could use createdAt
    const returnDeadline = new Date(order.createdAt.getTime() + windowDays * 24 * 60 * 60 * 1000);
    if (new Date() > returnDeadline) {
      return errorResponse(res, 'Return window has expired', 400);
    }

    const existingReturn = await prisma.returnRequest.findFirst({ where: { orderId } });
    if (existingReturn) return errorResponse(res, 'Return request already exists for this order', 400);

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        reason,
        comment,
        imageUrl,
        status: 'REQUESTED'
      }
    });

    notifyReturnRequestReceived(order, req.user).catch(console.error);

    return successResponse(res, 'Return request created successfully', { returnRequest }, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const returnRequest = await prisma.returnRequest.findFirst({
      where: { orderId, order: { userId: req.user.id } }
    });
    if (!returnRequest) return errorResponse(res, 'Return request not found', 404);
    return successResponse(res, 'Return request fetched', { returnRequest });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const razorpayWebhook = async (req, res) => {
  try {
    const body = req.body;
    const signature = req.headers['x-razorpay-signature'];

    const isValid = verifyWebhookSignature(JSON.stringify(body), signature);
    if (!isValid) return res.status(400).send('Invalid signature');

    if (body.event === 'order.paid') {
      const { id: razorpayOrderId } = body.payload.order.entity;
      const { id: paymentId } = body.payload.payment.entity;

      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true, user: true }
      });

      if (order && order.status === 'PENDING') {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            razorpayPaymentId: paymentId
          }
        });

        generateInvoice(order.id).catch(console.error);
        notifyOrderConfirmed(updatedOrder, order.user).catch(console.error);
        order.items.forEach(item => checkAndNotifyLowStock(item.productId).catch(console.error));
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Error');
  }
};
