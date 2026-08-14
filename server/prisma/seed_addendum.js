import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding addendum data...');

  // 1. Static Pages
  await prisma.staticPage.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About Aurelia Jewels</h1><p>We make beautiful jewelry.</p>',
    }
  });

  // 2. FAQ
  await prisma.faqItem.createMany({
    data: [
      { question: 'What is your return policy?', answer: 'We offer 7-day returns.', category: 'Returns', sortOrder: 1 },
      { question: 'Do you offer same-day delivery?', answer: 'Yes, in select pincodes before 2 PM.', category: 'Shipping', sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  // Fetch some existing products to attach promotions/box builder to
  const products = await prisma.product.findMany({ take: 5 });
  if (products.length === 0) {
    console.log('No products found, skipping promotion/box builder seeding.');
    return;
  }

  // 3. Promotion
  const activePromo = await prisma.promotion.create({
    data: {
      name: 'Weekend Flash Sale (10% Off)',
      type: 'PERCENTAGE_OFF',
      value: 10,
      scope: 'ALL_PRODUCTS',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      isActive: true,
    }
  });
  console.log('Created active promotion:', activePromo.name);

  // Buy X Get Y promo
  const buyXGetYPromo = await prisma.promotion.create({
    data: {
      name: 'Buy 2 Get 1 Free',
      type: 'BUY_X_GET_Y',
      value: 0,
      scope: 'SPECIFIC_PRODUCTS',
      buyQty: 2,
      getQty: 1,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      specificProducts: {
        create: [
          { productId: products[0].id },
          { productId: products[1].id }
        ]
      }
    }
  });
  console.log('Created BUY_X_GET_Y promotion:', buyXGetYPromo.name);

  // 4. Box Builder Config
  const boxConfig = await prisma.boxBuilderConfig.upsert({
    where: { slug: 'build-your-charm-pack' },
    update: {},
    create: {
      name: 'Build Your Charm Pack',
      slug: 'build-your-charm-pack',
      itemsRequired: 3,
      bundlePrice: 1999,
      isActive: true,
      eligibleProducts: {
        create: [
          { productId: products[0].id },
          { productId: products[1].id },
          { productId: products[2].id }
        ]
      }
    }
  });
  console.log('Created Box Builder:', boxConfig.name);

  console.log('Addendum seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
