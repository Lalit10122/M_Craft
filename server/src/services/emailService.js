import nodemailer from 'nodemailer';
import { buildEmail } from '../utils/emailTemplate.js';

let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn('SMTP_HOST is not set. Email service will log to console.');
}

const sendEmailOrLog = async (mailOptions, logMessage) => {
  if (!transporter) {
    console.log(logMessage);
    return;
  }
  try { 
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (to, name) => {
  const html = await buildEmail({
    title: 'Welcome to Malkincraft',
    headerTitle: 'Welcome to the Family',
    preheader: 'Discover handcrafted perfection.',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Hi ${name},</mj-text>
      <mj-text>Welcome to Malkincraft! We are thrilled to have you here.</mj-text>
      <mj-text>Browse our curated collections, track your orders easily, and save your favorite items to your wishlist.</mj-text>
    `,
    ctaText: 'Start Shopping',
    ctaUrl: process.env.CLIENT_URL || 'https://malkincraft.com'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Welcome to Malkincraft!',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Welcome email to ${to}`);
};

export const sendNewLoginAlertEmail = async (to, locationInfo, time, device) => {
  const html = await buildEmail({
    title: 'New Login Alert',
    headerTitle: 'Security Alert',
    preheader: 'A new login to your account was detected.',
    contentMjml: `
      <mj-text font-size="18px" font-weight="bold">We noticed a new sign-in to your account</mj-text>
      <mj-text>Device/Browser: <strong>${device}</strong></mj-text>
      <mj-text>Time: <strong>${time}</strong></mj-text>
      ${locationInfo ? `<mj-text>IP/Location: <strong>${locationInfo}</strong></mj-text>` : ''}
      <mj-text>If this was you, no further action is needed.</mj-text>
      <mj-text>If this wasn't you, please secure your account immediately by resetting your password.</mj-text>
    `,
    ctaText: 'Reset Password',
    ctaUrl: `${process.env.CLIENT_URL}/forgot-password`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'New sign-in from a new device',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] New login alert to ${to}`);
};

export const sendPasswordResetOTP = async (to, code) => {
  const html = await buildEmail({
    title: 'Password Reset',
    preheader: 'Your password reset code is inside.',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold" align="center">Reset Your Password</mj-text>
      <mj-text align="center">Use the following 6-digit code to reset your password. This code will expire in 15 minutes.</mj-text>
      <mj-text align="center" font-size="32px" font-weight="bold" letter-spacing="4px" padding="30px 0" color="#2c2c2c">
        ${code}
      </mj-text>
      <mj-text align="center" font-size="12px" color="#666">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Password Reset Code: ${code}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Password reset code ${code} sent to ${to}`);
};

export const sendPasswordChangedEmail = async (to) => {
  const html = await buildEmail({
    title: 'Password Changed',
    preheader: 'Your password was successfully updated',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Password Changed Successfully</mj-text>
      <mj-text>Your Malkincraft account password has been changed. If you did not make this change, please contact our support team immediately.</mj-text>
    `,
    ctaText: 'Contact Support',
    ctaUrl: 'mailto:support@malkincraft.com'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Your Malkincraft password was changed',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Password changed for ${to}`);
};

export const sendAccountLockedEmail = async (to) => {
  const html = await buildEmail({
    title: 'Account Locked',
    preheader: 'Security Alert: Account temporarily locked',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Account Temporarily Locked</mj-text>
      <mj-text>Your account has been locked for 15 minutes due to too many failed login attempts.</mj-text>
      <mj-text>Please try again later or reset your password if you have forgotten it.</mj-text>
    `,
    ctaText: 'Reset Password',
    ctaUrl: `${process.env.CLIENT_URL}/forgot-password`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Security Alert: Account Locked',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Account locked for ${to}`);
};

export const send2FAEnabledEmail = async (to, action = 'enabled') => {
  const html = await buildEmail({
    title: `2FA ${action}`,
    preheader: `Two-factor authentication has been ${action}`,
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Two-Factor Authentication ${action.toUpperCase()}</mj-text>
      <mj-text>Two-factor authentication for your Malkincraft admin account has been ${action}.</mj-text>
      <mj-text>If you did not authorize this change, please contact security immediately.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Admin Security: 2FA ${action}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] 2FA ${action} for ${to}`);
};

export const sendCompleteProfileNudgeEmail = async (to) => {
  const html = await buildEmail({
    title: 'Complete Your Profile',
    preheader: 'Please complete your Malkincraft profile',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Don't miss out on important updates</mj-text>
      <mj-text>Hi there,</mj-text>
      <mj-text>We noticed you haven't added a phone number to your profile yet. We need this to ensure smooth delivery of any future orders you place.</mj-text>
    `,
    ctaText: 'Complete Profile Now',
    ctaUrl: `${process.env.CLIENT_URL}/profile`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Action Required: Complete Your Profile',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Profile nudge for ${to}`);
};

export const sendBackInStockEmail = async (to, product) => {
  const html = await buildEmail({
    title: 'Back in Stock!',
    preheader: `${product.name} is now back in stock.`,
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Great News!</mj-text>
      <mj-text>The item you requested, <strong>${product.name}</strong>, is finally back in stock.</mj-text>
      <mj-image src="${product.images[0]}" alt="${product.name}" width="200px" />
      <mj-text font-weight="bold" font-size="18px">₹${product.basePrice}</mj-text>
      <mj-text>Hurry before it sells out again!</mj-text>
    `,
    ctaText: 'Shop Now',
    ctaUrl: `${process.env.CLIENT_URL}/product/${product.slug}`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `${product.name} is Back In Stock!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Back in stock for ${to}, product ${product.name}`);
};

export const sendOrderConfirmationEmail = async (to, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 60px;">
        ${item.product && item.product.images && item.product.images[0] ? `<img src="${item.product.images[0]}" width="50" style="display:block; border-radius:4px;" />` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.product?.name || 'Item'}</strong><br/>
        <span style="color:#666; font-size:12px;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.priceAtPurchase * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = await buildEmail({
    title: `Order Confirmed - #${order.id}`,
    preheader: 'Thank you for your purchase!',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold" align="center" padding-bottom="20px">Order Confirmed</mj-text>
      <mj-text>Thank you for your order! We are getting it ready for you.</mj-text>
      <mj-table padding="20px 0">
        ${itemsHtml}
      </mj-table>
      <mj-text align="right" font-weight="bold" font-size="18px">Total: ₹${order.totalAmount}</mj-text>
      ${order.isGift ? '<mj-text font-style="italic" color="#e0a35c">Your order includes a gift message.</mj-text>' : ''}
      ${order.freeGiftProductId ? '<mj-text font-weight="bold" color="#2ca02c">🎁 A free gift was added to your order!</mj-text>' : ''}
    `,
    ctaText: 'View Order',
    ctaUrl: `${process.env.CLIENT_URL}/account/orders/${order.id}`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Order Confirmed - #${order.id}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order confirmation for ${to}, order #${order.id}`);
};

export const sendOrderPackedEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Order Packed - #${order.id}`,
    preheader: 'Your order is being prepared',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Good News!</mj-text>
      <mj-text>Your order #${order.id} is currently being packed and will be shipped soon.</mj-text>
      <mj-text>We'll send you another email as soon as it's on its way.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} is being packed!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order packed for ${to}`);
};

export const sendOrderShippedEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Order Shipped - #${order.id}`,
    preheader: 'Your order is on its way',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Your order is on its way!</mj-text>
      <mj-text>Your order #${order.id} has been handed over to our delivery partner.</mj-text>
      ${order.trackingNumber ? `
        <mj-text>Tracking Number: <strong>${order.trackingNumber}</strong></mj-text>
      ` : ''}
    `,
    ctaText: order.trackingUrl ? 'Track Your Order' : 'View Order',
    ctaUrl: order.trackingUrl || `${process.env.CLIENT_URL}/account/orders/${order.id}`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been shipped!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order shipped for ${to}`);
};

export const sendOutForDeliveryEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Out for Delivery - #${order.id}`,
    preheader: 'Your order will reach you today',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Out for Delivery Today!</mj-text>
      <mj-text>Your order #${order.id} is out for delivery and will reach you very soon.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} is out for delivery!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Out for delivery for ${to}`);
};

export const sendOrderDeliveredEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Order Delivered - #${order.id}`,
    preheader: 'Your order has arrived',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Your order has arrived!</mj-text>
      <mj-text>We hope you love your new pieces. We have attached your invoice to this email for your records.</mj-text>
      <mj-text>Need to return something? You have 7 days to initiate a return request.</mj-text>
      <mj-text font-weight="bold" padding-top="20px">How did we do? We'd love your feedback!</mj-text>
    `,
    ctaText: 'Leave a Review',
    ctaUrl: `${process.env.CLIENT_URL}/account/orders/${order.id}`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been delivered!`,
    html
  };

  if (order.invoiceUrl) {
    try {
      const response = await fetch(order.invoiceUrl);
      if (response.ok) {
        const buffer = await response.buffer();
        mailOptions.attachments = [
          {
            filename: `Invoice_${order.invoiceNumber || order.id}.pdf`,
            content: buffer,
            contentType: 'application/pdf'
          }
        ];
      }
    } catch (err) {
      console.error('Failed to attach invoice PDF to delivery email:', err);
    }
  }

  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order delivered for ${to} (Invoice attached: ${!!mailOptions.attachments})`);
};

export const sendOrderCancelledEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Order Cancelled - #${order.id}`,
    preheader: 'Cancellation confirmation',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Order Cancelled</mj-text>
      <mj-text>We confirm that your order #${order.id} has been cancelled.</mj-text>
      <mj-text>If payment was already captured, a refund will be processed and should reflect in your account soon.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been cancelled`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order cancelled for ${to}`);
};

export const sendReturnRequestReceivedEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Return Request Received - #${order.id}`,
    preheader: 'We have received your return request',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Return Request Received</mj-text>
      <mj-text>We have successfully received your return request for order #${order.id}.</mj-text>
      <mj-text>Our team will review your request and get back to you within 24-48 hours with the next steps.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Return Request Received - Order #${order.id}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Return request received for ${to}`);
};

export const sendReturnApprovedEmail = async (to, order) => {
  const html = await buildEmail({
    title: `Return Approved - #${order.id}`,
    preheader: 'Your return request has been approved',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Return Approved</mj-text>
      <mj-text>Good news! Your return request for order #${order.id} has been approved.</mj-text>
      <mj-text>Our delivery partner will coordinate a pickup soon. Please keep the item packaged in its original condition.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Return request approved for order #${order.id}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Return approved for ${to}`);
};

export const sendReturnRejectedEmail = async (to, order, reason) => {
  const html = await buildEmail({
    title: `Return Update - #${order.id}`,
    preheader: 'Update on your return request',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Return Request Rejected</mj-text>
      <mj-text>We regret to inform you that your return request for order #${order.id} could not be approved.</mj-text>
      <mj-text><strong>Reason:</strong> ${reason}</mj-text>
      <mj-text>If you have any questions, please contact our support team.</mj-text>
    `,
    ctaText: 'Contact Support',
    ctaUrl: 'mailto:support@malkincraft.com'
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Return request update for order #${order.id}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Return rejected for ${to}`);
};

export const sendRefundProcessedEmail = async (to, order, amount) => {
  const html = await buildEmail({
    title: `Refund Processed - #${order.id}`,
    preheader: 'Your refund has been initiated',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Refund Processed</mj-text>
      <mj-text>A refund of <strong>₹${amount}</strong> has been successfully processed for your order #${order.id}.</mj-text>
      <mj-text>Please note that it may take 5-7 business days for the amount to reflect in your account, depending on your bank.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Refund processed for order #${order.id}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Refund processed for ${to}`);
};

export const sendAbandonedCartEmail = async (to, items, userName) => {
  const itemsHtml = items.slice(0, 3).map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 60px;">
        ${item.images && item.images[0] ? `<img src="${item.images[0]}" width="50" style="display:block; border-radius:4px;" />` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <span style="color:#666; font-size:14px;">₹${item.basePrice}</span>
      </td>
    </tr>
  `).join('');

  const html = await buildEmail({
    title: 'Did you forget something?',
    preheader: 'You left items in your cart!',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold" padding-bottom="20px">Hi ${userName},</mj-text>
      <mj-text>We noticed you left some beautiful pieces behind in your cart. They are waiting for you!</mj-text>
      <mj-table padding="20px 0">
        ${itemsHtml}
      </mj-table>
    `,
    ctaText: 'Complete Your Purchase',
    ctaUrl: `${process.env.CLIENT_URL}/cart`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `You left items in your cart!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Abandoned cart for ${to}`);
};

export const sendLowStockDigestEmail = async (to, products) => {
  const productList = products.map(p => `<li>${p.name}: ${p.stockQty} (threshold: ${p.threshold})</li>`).join('');
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `[Admin Alert] Low stock products`,
    html: `<p>The following products are running low on stock:</p><ul>${productList}</ul>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Low stock digest for admin`);
};

export const sendReviewSubmittedEmail = async (to, product) => {
  const html = await buildEmail({
    title: 'Review Received',
    preheader: 'Thank you for your review!',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Thank you!</mj-text>
      <mj-text>We successfully received your review for <strong>${product.name}</strong>.</mj-text>
      ${product.images && product.images[0] ? `<mj-image src="${product.images[0]}" alt="${product.name}" width="150px" />` : ''}
      <mj-text>Your feedback helps us and our community. Our team will verify it shortly.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Thank you for your review!',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Review submitted for ${to}`);
};

export const sendReviewApprovedEmail = async (to, product) => {
  const html = await buildEmail({
    title: 'Review Approved',
    preheader: 'Your review is now live!',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Your Review is Live!</mj-text>
      <mj-text>Great news! Your review for <strong>${product.name}</strong> has been approved and is now visible on our website.</mj-text>
      ${product.images && product.images[0] ? `<mj-image src="${product.images[0]}" alt="${product.name}" width="150px" />` : ''}
      <mj-text>Thank you for contributing to the Malkincraft community.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Your review is now live!',
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Review approved for ${to}`);
};

export const sendEmailVerificationOTP = async (to, code) => {
  const html = await buildEmail({
    title: 'Verify your Email',
    preheader: 'Your verification code is inside.',
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold" align="center">Email Verification</mj-text>
      <mj-text align="center">Use the following 6-digit code to verify your email address. This code will expire in 10 minutes.</mj-text>
      <mj-text align="center" font-size="32px" font-weight="bold" letter-spacing="4px" padding="30px 0" color="#2c2c2c">
        ${code}
      </mj-text>
      <mj-text align="center" font-size="12px" color="#666">If you didn't request this code, you can safely ignore this email.</mj-text>
    `
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your Verification Code: ${code}`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Verification code ${code} sent to ${to}`);
};

export const sendWishlistPriceDropEmail = async (to, product) => {
  const html = await buildEmail({
    title: 'Price Drop Alert',
    preheader: `${product.name} is now on sale!`,
    contentMjml: `
      <mj-text font-size="20px" font-weight="bold">Price Drop Alert!</mj-text>
      <mj-text>An item on your wishlist, <strong>${product.name}</strong>, is now available at a lower price.</mj-text>
      <mj-image src="${product.images[0]}" alt="${product.name}" width="200px" />
      <mj-text font-weight="bold" font-size="18px">Now only ₹${product.basePrice}</mj-text>
      <mj-text>Grab it before the sale ends!</mj-text>
    `,
    ctaText: 'Shop Now',
    ctaUrl: `${process.env.CLIENT_URL}/product/${product.slug}`
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Price Drop on ${product.name}!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Price drop for ${to}, product ${product.name}`);
};
