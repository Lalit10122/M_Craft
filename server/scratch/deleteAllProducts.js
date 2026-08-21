import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting full database wipe of products...");

  try {
    // Delete all dependent records first
    console.log("Deleting ProductCollection...");
    await prisma.productCollection.deleteMany({});
    
    console.log("Deleting ProductVariant...");
    await prisma.productVariant.deleteMany({});
    
    console.log("Deleting CartItem...");
    await prisma.cartItem.deleteMany({});
    
    console.log("Deleting Wishlist...");
    await prisma.wishlist.deleteMany({});
    
    console.log("Deleting Review...");
    await prisma.review.deleteMany({});
    
    console.log("Deleting ProductAttributeValue...");
    await prisma.productAttributeValue.deleteMany({});
    
    console.log("Deleting PromotionProduct...");
    await prisma.promotionProduct.deleteMany({});
    
    console.log("Deleting BoxBuilderEligibleProduct...");
    await prisma.boxBuilderEligibleProduct.deleteMany({});
    
    console.log("Deleting RecentlyViewed...");
    await prisma.recentlyViewed.deleteMany({});

    // Finally, delete all products
    console.log("Deleting all Products...");
    const result = await prisma.product.deleteMany({});
    
    console.log(`Successfully deleted ${result.count} products!`);
  } catch (error) {
    console.error("Error during deletion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
