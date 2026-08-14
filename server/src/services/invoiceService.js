import PDFDocument from 'pdfkit';
import { prisma } from '../config/db.js';
import { s3Client, S3_BUCKET } from '../config/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const getNextInvoiceNumber = async () => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      let counterSetting = await tx.setting.findUnique({
        where: { key: 'invoice_counter' }
      });

      if (!counterSetting) {
        counterSetting = await tx.setting.create({
          data: { key: 'invoice_counter', value: '1' }
        });
      }

      const counterValue = parseInt(counterSetting.value, 10);
      const nextValue = counterValue + 1;

      await tx.setting.update({
        where: { key: 'invoice_counter' },
        data: { value: nextValue.toString() }
      });

      return counterValue;
    });

    const year = new Date().getFullYear();
    const paddedCounter = result.toString().padStart(5, '0');
    return `MK-${year}-${paddedCounter}`;
  } catch (error) {
    console.error('Error getting next invoice number:', error);
    throw error;
  }
};

export const generateInvoice = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const invoiceNumber = await getNextInvoiceNumber();
    
    const businessNameSetting = await prisma.setting.findUnique({ where: { key: 'business_name' } });
    const businessGstinSetting = await prisma.setting.findUnique({ where: { key: 'business_gstin' } });
    const businessAddressSetting = await prisma.setting.findUnique({ where: { key: 'business_address' } });

    const businessName = businessNameSetting?.value || 'Malkincraft';
    const businessGstin = businessGstinSetting?.value || '';
    const businessAddress = businessAddressSetting?.value || '';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        let invoiceUrl = null;

        try {
          const s3Key = `invoices/${orderId}.pdf`;
          await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: pdfBuffer,
            ContentType: 'application/pdf'
          }));

          const region = process.env.AWS_REGION || 'us-east-1';
          invoiceUrl = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${s3Key}`;
        } catch (s3Error) {
          console.error(`Failed to upload invoice for order ${orderId} to S3:`, s3Error);
        }

        try {
          await prisma.order.update({
            where: { id: orderId },
            data: { invoiceNumber, invoiceUrl }
          });
        } catch (dbError) {
          console.error(`Failed to update order ${orderId} with invoice details:`, dbError);
        }

        resolve({ invoiceNumber, invoiceUrl });
      });

      // Header
      doc.fontSize(20).text(`INVOICE - ${businessName}`, { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Order Date: ${order.createdAt.toDateString()}`);
      
      if (businessGstin) {
        doc.text(`GSTIN: ${businessGstin}`);
      }
      if (businessAddress) {
        doc.text(`Business Address: ${businessAddress}`);
      }
      doc.moveDown();

      // Customer
      doc.text(`Customer: ${order.user.name || order.user.email}`);
      let shippingAddress = 'N/A';
      if (order.shippingAddress) {
        const addr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress;
        shippingAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`;
      }
      doc.text(`Shipping Address: ${shippingAddress}`);
      doc.moveDown();

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 250, tableTop);
      doc.text('Unit Price', 300, tableTop);
      doc.text('GST (18%)', 400, tableTop);
      doc.text('Total', 500, tableTop);
      
      doc.font('Helvetica');
      let yPosition = tableTop + 20;
      
      order.items.forEach(item => {
        const price = parseFloat(item.priceAtPurchase);
        const qty = item.quantity;
        
        const baseAmount = price * qty;
        const preGst = baseAmount / 1.18;
        const gst = baseAmount - preGst;

        doc.text(item.product.name, 50, yPosition, { width: 190 });
        doc.text(qty.toString(), 250, yPosition);
        doc.text(price.toFixed(2), 300, yPosition);
        doc.text(gst.toFixed(2), 400, yPosition);
        doc.text(baseAmount.toFixed(2), 500, yPosition);
        
        yPosition += 20;
      });

      doc.moveDown(2);
      
      doc.font('Helvetica-Bold');
      doc.text(`Total Amount: ₹${order.totalAmount}`, { align: 'right' });
      
      doc.moveDown(4);
      doc.font('Helvetica').text('Thank you for shopping with Malkincraft!', { align: 'center' });

      doc.end();
    });
  } catch (error) {
    console.error(`Failed to generate invoice for order ${orderId}:`, error);
    return { invoiceNumber: null, invoiceUrl: null };
  }
};
