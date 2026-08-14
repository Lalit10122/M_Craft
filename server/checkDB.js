import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } } }
  });
  
  let foundNull = false;
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!item.product.images || item.product.images.length === 0) {
        console.log(`❌ Order ${o.id} has an item with NO IMAGES! Item ID: ${item.id}`);
        foundNull = true;
      }
    });
  });
  
  if (!foundNull) console.log('✅ All items have valid images.');
}

check().catch(console.error).finally(() => prisma.$disconnect());
