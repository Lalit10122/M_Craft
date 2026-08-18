import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });

import * as emailService from './src/services/emailService.js';

const dummyProduct = {
  name: 'Handcrafted Golden Necklace',
  slug: 'handcrafted-golden-necklace',
  basePrice: 4999.00,
  images: ['https://via.placeholder.com/200x200.png?text=Necklace']
};

const dummyItems = [
  {
    product: dummyProduct,
    quantity: 2,
    priceAtPurchase: 4999.00,
    images: dummyProduct.images,
    name: dummyProduct.name,
    basePrice: dummyProduct.basePrice
  }
];

const dummyOrder = {
  id: 'ORD-1234567890',
  totalAmount: 9998.00,
  isGift: true,
  freeGiftProductId: 'GIFT-123',
  trackingNumber: 'AWB987654321',
  trackingUrl: 'https://malkincraft.com/track',
  items: dummyItems
};

async function testAllEmails() {
  const targetEmail = 'lalitpatharia10122@gmail.com';
  console.log(`Starting to send ALL emails to: ${targetEmail}`);

  const emails = [
    () => emailService.sendWelcomeEmail(targetEmail, 'Lalit'),
    () => emailService.sendNewLoginAlertEmail(targetEmail, 'Mumbai, India', new Date().toLocaleString(), 'Chrome / Windows'),
    () => emailService.sendPasswordResetEmail(targetEmail, 'https://malkincraft.com/reset?token=abc'),
    () => emailService.sendPasswordChangedEmail(targetEmail),
    () => emailService.sendAccountLockedEmail(targetEmail),
    () => emailService.send2FAEnabledEmail(targetEmail, 'enabled'),
    () => emailService.sendCompleteProfileNudgeEmail(targetEmail),
    () => emailService.sendBackInStockEmail(targetEmail, dummyProduct),
    () => emailService.sendOrderConfirmationEmail(targetEmail, dummyOrder),
    () => emailService.sendOrderPackedEmail(targetEmail, dummyOrder),
    () => emailService.sendOrderShippedEmail(targetEmail, dummyOrder),
    () => emailService.sendOutForDeliveryEmail(targetEmail, dummyOrder),
    () => emailService.sendOrderDeliveredEmail(targetEmail, dummyOrder), // Without invoice attachment for simplicity
    () => emailService.sendOrderCancelledEmail(targetEmail, dummyOrder),
    () => emailService.sendReturnRequestReceivedEmail(targetEmail, dummyOrder),
    () => emailService.sendReturnApprovedEmail(targetEmail, dummyOrder),
    () => emailService.sendReturnRejectedEmail(targetEmail, dummyOrder, 'Item was damaged by customer'),
    () => emailService.sendRefundProcessedEmail(targetEmail, dummyOrder, 9998.00),
    () => emailService.sendAbandonedCartEmail(targetEmail, dummyItems, 'Lalit'),
    () => emailService.sendReviewSubmittedEmail(targetEmail, dummyProduct),
    () => emailService.sendReviewApprovedEmail(targetEmail, dummyProduct),
    () => emailService.sendWishlistPriceDropEmail(targetEmail, dummyProduct)
  ];

  for (let i = 0; i < emails.length; i++) {
    console.log(`Sending email ${i + 1} of ${emails.length}...`);
    try {
      await emails[i]();
      console.log(`✅ Email ${i + 1} sent.`);
    } catch (e) {
      console.error(`❌ Failed to send email ${i + 1}:`, e);
    }
  }

  console.log('All emails dispatched!');
  process.exit(0);
}

testAllEmails();
