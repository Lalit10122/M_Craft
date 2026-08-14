import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/utils/slugify.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const categories = await prisma.category.findMany();
    const collections = await prisma.collection.findMany();

    if (categories.length === 0) {
      console.log('No categories found. Run node prisma/seed.js first.');
      return;
    }

    const getCat = (name) => categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id || categories[0].id;
    const getCol = (name) => collections.find(c => c.name.toLowerCase() === name.toLowerCase())?.id;

    const dummyProducts = [
      {
        name: 'Gold Plated Hoop Earrings',
        description: 'Classic everyday gold plated hoop earrings. Lightweight and tarnish-free.',
        material: 'Stainless Steel',
        color: 'Gold',
        basePrice: 599,
        mrp: 999,
        stockQty: 50,
        images: ['https://picsum.photos/seed/prod1/600/800', 'https://picsum.photos/seed/prod1_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Earrings',
        collectionNames: ['Best Sellers', 'New Arrivals']
      },
      {
        name: 'Diamond Solitaire Ring',
        description: 'Elegant diamond solitaire ring for special occasions.',
        material: 'Silver',
        color: 'Silver',
        basePrice: 1299,
        mrp: 2499,
        stockQty: 20,
        images: ['https://picsum.photos/seed/prod2/600/800', 'https://picsum.photos/seed/prod2_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Rings',
        collectionNames: ['Best Sellers', 'Couple']
      },
      {
        name: 'Evil Eye Charm Necklace',
        description: 'Protect yourself with this delicate evil eye charm necklace.',
        material: 'Gold Plated',
        color: 'Gold/Blue',
        basePrice: 799,
        mrp: 1199,
        stockQty: 35,
        images: ['https://picsum.photos/seed/prod3/600/800', 'https://picsum.photos/seed/prod3_hover/600/800'],
        isActive: true,
        isBestSeller: false,
        categoryName: 'Necklaces',
        collectionNames: ['Evil Eye']
      },
      {
        name: 'Chunky Link Bracelet',
        description: 'A bold, chunky chain bracelet for statement outfits.',
        material: 'Stainless Steel',
        color: 'Gold',
        basePrice: 899,
        mrp: 1499,
        stockQty: 15,
        images: ['https://picsum.photos/seed/prod4/600/800', 'https://picsum.photos/seed/prod4_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Bracelets',
        collectionNames: ['New Arrivals']
      },
      {
        name: 'Butterfly Pendant Necklace',
        description: 'Minimalist butterfly pendant on a thin gold chain.',
        material: 'Gold Plated',
        color: 'Gold',
        basePrice: 699,
        mrp: 999,
        stockQty: 40,
        images: ['https://picsum.photos/seed/prod5/600/800', 'https://picsum.photos/seed/prod5_hover/600/800'],
        isActive: true,
        isBestSeller: false,
        categoryName: 'Necklaces',
        collectionNames: ['Butterfly', 'New Arrivals']
      },
      {
        name: 'Twisted Silver Ring',
        description: 'A modern twisted band design in sterling silver.',
        material: 'Silver',
        color: 'Silver',
        basePrice: 499,
        mrp: 799,
        stockQty: 60,
        images: ['https://picsum.photos/seed/prod6/600/800', 'https://picsum.photos/seed/prod6_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Rings',
        collectionNames: ['Best Sellers']
      },
      {
        name: 'Pearl Drop Earrings',
        description: 'Vintage-inspired faux pearl drop earrings.',
        material: 'Brass',
        color: 'Pearl',
        basePrice: 899,
        mrp: 1299,
        stockQty: 25,
        images: ['https://picsum.photos/seed/prod7/600/800', 'https://picsum.photos/seed/prod7_hover/600/800'],
        isActive: true,
        isBestSeller: false,
        categoryName: 'Earrings',
        collectionNames: []
      },
      {
        name: 'Tennis Bracelet',
        description: 'Sparkling cubic zirconia tennis bracelet.',
        material: 'Silver',
        color: 'Silver/Clear',
        basePrice: 1599,
        mrp: 2999,
        stockQty: 10,
        images: ['https://picsum.photos/seed/prod8/600/800', 'https://picsum.photos/seed/prod8_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Bracelets',
        collectionNames: ['Best Sellers']
      },
      {
        name: 'Minimalist Anklet',
        description: 'A thin, delicate anklet for beach days.',
        material: 'Stainless Steel',
        color: 'Gold',
        basePrice: 399,
        mrp: 599,
        stockQty: 80,
        images: ['https://picsum.photos/seed/prod9/600/800', 'https://picsum.photos/seed/prod9_hover/600/800'],
        isActive: true,
        isBestSeller: false,
        categoryName: 'Anklets',
        collectionNames: []
      },
      {
        name: 'Matching Couple Rings Set',
        description: 'Set of two matching adjustable rings.',
        material: 'Silver',
        color: 'Silver',
        basePrice: 1899,
        mrp: 2599,
        stockQty: 30,
        images: ['https://picsum.photos/seed/prod10/600/800', 'https://picsum.photos/seed/prod10_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Rings',
        collectionNames: ['Couple', 'Best Sellers']
      },
      {
        name: 'Layered Coin Necklace',
        description: 'Pre-layered double chain necklace with a Roman coin pendant.',
        material: 'Gold Plated',
        color: 'Gold',
        basePrice: 999,
        mrp: 1499,
        stockQty: 45,
        images: ['https://picsum.photos/seed/prod11/600/800', 'https://picsum.photos/seed/prod11_hover/600/800'],
        isActive: true,
        isBestSeller: true,
        categoryName: 'Necklaces',
        collectionNames: ['New Arrivals']
      },
      {
        name: 'Emerald Cut Studs',
        description: 'Emerald green cubic zirconia stud earrings.',
        material: 'Silver',
        color: 'Green',
        basePrice: 699,
        mrp: 999,
        stockQty: 55,
        images: ['https://picsum.photos/seed/prod12/600/800', 'https://picsum.photos/seed/prod12_hover/600/800'],
        isActive: true,
        isBestSeller: false,
        categoryName: 'Earrings',
        collectionNames: []
      }
    ];

    console.log(`Seeding ${dummyProducts.length} products...`);

    for (const p of dummyProducts) {
      const slug = slugify(p.name);
      
      const product = await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          description: p.description,
          material: p.material,
          color: p.color,
          basePrice: p.basePrice,
          mrp: p.mrp,
          stockQty: p.stockQty,
          images: p.images,
          isActive: p.isActive,
          isBestSeller: p.isBestSeller,
          categoryId: getCat(p.categoryName),
        }
      });

      // Link to collections
      for (const colName of p.collectionNames) {
        const colId = getCol(colName);
        if (colId) {
          await prisma.productCollection.upsert({
            where: {
              productId_collectionId: {
                productId: product.id,
                collectionId: colId
              }
            },
            update: {},
            create: {
              productId: product.id,
              collectionId: colId
            }
          });
        }
      }
    }

    console.log('Successfully seeded products!');

  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
