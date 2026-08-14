import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { notifyAbandonedCart } from '../services/notificationService.js';

export const startAbandonedCartJob = () => {
  console.log('Abandoned cart job started');
  
  cron.schedule('0 */2 * * *', async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const users = await prisma.user.findMany({
        where: {
          cartItems: {
            some: {}
          },
          orders: {
            none: {
              createdAt: {
                gt: twoHoursAgo
              }
            }
          },
          OR: [
            { lastAbandonedCartEmailAt: null },
            { lastAbandonedCartEmailAt: { lt: twentyFourHoursAgo } }
          ]
        }
      });

      let remindersSent = 0;

      for (const user of users) {
        const cartItems = await prisma.cartItem.findMany({
          where: { userId: user.id },
          include: {
            product: {
              select: { name: true, images: true, basePrice: true }
            }
          }
        });

        await notifyAbandonedCart(user, cartItems);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { lastAbandonedCartEmailAt: new Date() }
        });
        
        remindersSent++;
      }

      console.log(`Abandoned cart job ran. Reminders sent: ${remindersSent}`);
    } catch (error) {
      console.error('Error running abandoned cart job:', error);
    }
  });
};
