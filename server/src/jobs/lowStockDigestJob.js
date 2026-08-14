import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { sendLowStockDigestEmail } from '../services/emailService.js';

export const startLowStockDigestJob = () => {
  console.log('Low stock digest job started');

  cron.schedule('0 9 * * *', async () => {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'low_stock_threshold' }
      });
      const threshold = setting && setting.value ? parseInt(setting.value, 10) : 5;

      const lowStockProducts = await prisma.product.findMany({
        where: {
          stockQty: { lte: threshold },
          isActive: true
        }
      });

      if (lowStockProducts.length > 0) {
        await sendLowStockDigestEmail(process.env.ADMIN_EMAIL, lowStockProducts);
        console.log(`Low stock digest ran. ${lowStockProducts.length} low-stock products found.`);
      } else {
        console.log('No low-stock products');
      }
    } catch (error) {
      console.error('Error running low stock digest job:', error);
    }
  });
};
