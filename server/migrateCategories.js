import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Migrating categories...');
    const products = await prisma.product.findMany({
        where: { categoryId: { not: null } }
    });

    for (const product of products) {
        await prisma.product.update({
            where: { id: product.id },
            data: {
                categories: {
                    connect: [{ id: product.categoryId }]
                }
            }
        });
    }
    console.log(`Migrated ${products.length} products.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
