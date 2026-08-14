import nodemailer from 'nodemailer';

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

export const sendPasswordResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Reset your Malkincraft password',
    html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a>. This link expires in 15 minutes.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Password reset for ${to}: ${resetLink}`);
};

export const sendPasswordChangedEmail = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Your Malkincraft password was changed',
    html: `<p>Your password was changed successfully. If you did not do this, please contact support immediately.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Password changed for ${to}`);
};

export const sendAccountLockedEmail = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: 'Your Malkincraft account has been temporarily locked',
    html: `<p>Your account has been locked for 15 minutes due to too many failed login attempts.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Account locked for ${to}`);
};

export const sendOrderConfirmationEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Order confirmed - #${order.id}`,
    html: `<h1>Order Confirmed</h1><p>Thank you for your order #${order.id}.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order confirmation for ${to}, order #${order.id}`);
};

export const sendOrderPackedEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} is being packed!`,
    html: `<p>Your order #${order.id} is currently being packed and will be shipped soon.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order packed for ${to}, order #${order.id}`);
};

export const sendOrderShippedEmail = async (to, order) => {
  let html = `<p>Your order #${order.id} has been shipped!</p>`;
  if (order.trackingNumber) {
    html += `<p>Tracking Number: ${order.trackingNumber}</p>`;
    if (order.trackingUrl) {
      html += `<p>Track your package: <a href="${order.trackingUrl}">${order.trackingUrl}</a></p>`;
    }
  }
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been shipped!`,
    html
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order shipped for ${to}, order #${order.id}`);
};

export const sendOutForDeliveryEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} is out for delivery!`,
    html: `<p>Your order #${order.id} is out for delivery and will reach you today.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Out for delivery for ${to}, order #${order.id}`);
};

export const sendOrderDeliveredEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been delivered!`,
    html: `<p>Your order #${order.id} has been delivered!</p><p>We'd love to hear your feedback! Leave a review on the products you purchased.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order delivered for ${to}, order #${order.id}`);
};

export const sendOrderCancelledEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Your order #${order.id} has been cancelled`,
    html: `<p>Your order #${order.id} has been cancelled.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Order cancelled for ${to}, order #${order.id}`);
};

export const sendReturnApprovedEmail = async (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Return request approved for order #${order.id}`,
    html: `<p>Your return request for order #${order.id} has been approved.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Return approved for ${to}, order #${order.id}`);
};

export const sendReturnRejectedEmail = async (to, order, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Return request update for order #${order.id}`,
    html: `<p>Your return request for order #${order.id} has been rejected.</p><p>Reason: ${reason}</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Return rejected for ${to}, order #${order.id}`);
};

export const sendRefundProcessedEmail = async (to, order, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `Refund processed for order #${order.id}`,
    html: `<p>A refund of ₹${amount} has been processed for your order #${order.id}.</p>`
  };
  await sendEmailOrLog(mailOptions, `[EMAIL STUB] Refund processed for ${to}, order #${order.id}`);
};

export const sendAbandonedCartEmail = async (to, items, userName) => {
  const itemList = items.slice(0, 3).map(item => `<li>${item.name}</li>`).join('');
  const mailOptions = {
    from: process.env.EMAIL_FROM_ADDRESS || 'noreply@malkincraft.com',
    to,
    subject: `You left items in your cart!`,
    html: `<p>Hi ${userName},</p><p>You left the following items in your cart:</p><ul>${itemList}</ul>`
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
