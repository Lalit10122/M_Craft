import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with dummy data...');

  // 1. Categories
  const categoriesData = [
    { name: 'Necklaces', slug: 'necklaces', section: 'UNISEX' },
    { name: 'Earrings', slug: 'earrings', section: 'UNISEX' },
    { name: 'Rings', slug: 'rings', section: 'UNISEX' },
    { name: 'Bracelets', slug: 'bracelets', section: 'UNISEX' },
    { name: 'Anklets', slug: 'anklets', section: 'UNISEX' },
    { name: 'Jewellery Sets', slug: 'jewellery-sets', section: 'UNISEX' }
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug, section: cat.section }
    });
  }
  const categories = await prisma.category.findMany();
  const getCategoryId = (slug) => categories.find(c => c.slug === slug)?.id;

  // 2. Collections
  const collectionsData = [
    { name: 'New Arrivals', slug: 'new-arrivals' },
    { name: 'Best Sellers', slug: 'best-sellers' },
    { name: 'Evil Eye', slug: 'evil-eye' },
    { name: 'Butterfly', slug: 'butterfly' },
    { name: 'Couple Jewellery', slug: 'couple-jewellery' },
    { name: 'Gifting Edit', slug: 'gifting-edit' }
  ];

  for (const col of collectionsData) {
    await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: { name: col.name, slug: col.slug }
    });
  }
  const collections = await prisma.collection.findMany();
  const getCollectionId = (slug) => collections.find(c => c.slug === slug)?.id;

  // 3. Products
  const productsData = [
    {
      name: 'Gold Plated Evil Eye Pendant Necklace', slug: 'gold-evil-eye-pendant-necklace',
      category: 'necklaces', material: 'Brass, Gold Plated', color: 'Gold',
      basePrice: 899, mrp: 1799, stockQty: 45, isBestSeller: true,
      colSlugs: ['new-arrivals', 'evil-eye', 'best-sellers'],
      desc: 'A delicate gold-plated pendant necklace featuring the classic evil eye motif, crafted in brass with a smooth gold finish. Perfect for everyday wear or layering with other pieces. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-necklace-01a/800/800', img2: 'https://picsum.photos/seed/aj-necklace-01b/800/800'
    },
    {
      name: 'Crystal Drip Ball Chain Necklace', slug: 'crystal-drip-ball-chain-necklace',
      category: 'necklaces', material: 'Alloy, Zircon', color: 'Gold',
      basePrice: 2189, mrp: 4379, stockQty: 22, isBestSeller: true,
      colSlugs: ['best-sellers'],
      desc: 'An exquisite ball chain necklace adorned with sparkling zircon crystal drips. Elevate your evening looks effortlessly. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-necklace-02a/800/800', img2: 'https://picsum.photos/seed/aj-necklace-02b/800/800'
    },
    {
      name: 'Silver Pearl Layered Necklace', slug: 'silver-pearl-layered-necklace',
      category: 'necklaces', material: 'Alloy, Faux Pearl', color: 'Silver',
      basePrice: 1299, mrp: 2599, stockQty: 30, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'A sophisticated layered necklace featuring elegant faux pearls on a silver-tone chain. Perfect for adding a touch of classic charm. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-necklace-03a/800/800', img2: 'https://picsum.photos/seed/aj-necklace-03b/800/800'
    },
    {
      name: 'Rose Gold Butterfly Charm Necklace', slug: 'rose-gold-butterfly-charm-necklace',
      category: 'necklaces', material: 'Brass', color: 'Rose Gold',
      basePrice: 999, mrp: 1999, stockQty: 18, isBestSeller: false,
      colSlugs: ['butterfly', 'gifting-edit'],
      desc: 'A beautiful rose gold necklace featuring a minimalist butterfly charm. A thoughtful gift for yourself or a loved one. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-necklace-04a/800/800', img2: 'https://picsum.photos/seed/aj-necklace-04b/800/800'
    },
    {
      name: 'Gold Hoop Earrings (Classic)', slug: 'gold-hoop-earrings-classic',
      category: 'earrings', material: 'Brass, Gold Plated', color: 'Gold',
      basePrice: 649, mrp: 1299, stockQty: 60, isBestSeller: true,
      colSlugs: ['best-sellers'],
      desc: 'Timeless classic gold-plated hoop earrings that never go out of style. Lightweight and comfortable for daily wear. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-earring-05a/800/800', img2: 'https://picsum.photos/seed/aj-earring-05b/800/800'
    },
    {
      name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings',
      category: 'earrings', material: 'Alloy, Faux Pearl', color: 'Gold',
      basePrice: 749, mrp: 1499, stockQty: 40, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'Elegant pearl drop earrings set on gold-tone alloy. Ideal for adding a refined touch to any outfit. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-earring-06a/800/800', img2: 'https://picsum.photos/seed/aj-earring-06b/800/800'
    },
    {
      name: 'Silver Stud Earrings Set (3 Pairs)', slug: 'silver-stud-earrings-set',
      category: 'earrings', material: 'Stainless Steel', color: 'Silver',
      basePrice: 599, mrp: 1199, stockQty: 55, isBestSeller: false,
      colSlugs: ['gifting-edit'],
      desc: 'A versatile set of three stainless steel stud earrings in silver finish. Perfect for daily rotation or multiple piercings. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-earring-07a/800/800', img2: 'https://picsum.photos/seed/aj-earring-07b/800/800'
    },
    {
      name: 'Evil Eye Stud Earrings', slug: 'evil-eye-stud-earrings',
      category: 'earrings', material: 'Brass', color: 'Gold',
      basePrice: 449, mrp: 899, stockQty: 70, isBestSeller: false,
      colSlugs: ['evil-eye'],
      desc: 'Dainty evil eye stud earrings crafted in brass with gold detailing. Protect your energy in style. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-earring-08a/800/800', img2: 'https://picsum.photos/seed/aj-earring-08b/800/800'
    },
    {
      name: 'Adjustable Gold Band Ring', slug: 'adjustable-gold-band-ring',
      category: 'rings', material: 'Brass, Gold Plated', color: 'Gold',
      basePrice: 399, mrp: 799, stockQty: 80, isBestSeller: true,
      colSlugs: ['best-sellers'],
      desc: 'A sleek, adjustable gold-plated band ring designed for versatility and everyday elegance. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-ring-09a/800/800', img2: 'https://picsum.photos/seed/aj-ring-09b/800/800'
    },
    {
      name: 'Zircon Stone Statement Ring', slug: 'zircon-stone-statement-ring',
      category: 'rings', material: 'Alloy, Zircon', color: 'Silver',
      basePrice: 699, mrp: 1399, stockQty: 25, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'A bold silver-tone statement ring featuring a radiant zircon stone centerpiece. A showstopper for special events. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-ring-10a/800/800', img2: 'https://picsum.photos/seed/aj-ring-10b/800/800'
    },
    {
      name: 'Couple Promise Rings (Set of 2)', slug: 'couple-promise-rings-set',
      category: 'rings', material: 'Stainless Steel', color: 'Silver',
      basePrice: 1199, mrp: 2399, stockQty: 20, isBestSeller: false,
      colSlugs: ['couple-jewellery', 'gifting-edit'],
      desc: 'A matching set of two stainless steel promise rings in a sleek silver finish. A beautiful symbol of connection. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-ring-11a/800/800', img2: 'https://picsum.photos/seed/aj-ring-11b/800/800'
    },
    {
      name: 'Butterfly Stackable Ring', slug: 'butterfly-stackable-ring',
      category: 'rings', material: 'Brass', color: 'Gold',
      basePrice: 349, mrp: 699, stockQty: 65, isBestSeller: false,
      colSlugs: ['butterfly'],
      desc: 'A delicate gold-tone stackable ring adorned with a whimsical butterfly detail. Perfect for layering. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-ring-12a/800/800', img2: 'https://picsum.photos/seed/aj-ring-12b/800/800'
    },
    {
      name: 'Chain Link Bracelet', slug: 'chain-link-bracelet',
      category: 'bracelets', material: 'Stainless Steel', color: 'Silver',
      basePrice: 799, mrp: 1599, stockQty: 35, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'A contemporary silver-tone chain link bracelet made from durable stainless steel. Bold yet refined. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-bracelet-13a/800/800', img2: 'https://picsum.photos/seed/aj-bracelet-13b/800/800'
    },
    {
      name: 'Charm Bracelet with Heart Pendant', slug: 'charm-bracelet-heart-pendant',
      category: 'bracelets', material: 'Brass, Gold Plated', color: 'Gold',
      basePrice: 899, mrp: 1799, stockQty: 28, isBestSeller: true,
      colSlugs: ['best-sellers', 'gifting-edit'],
      desc: 'A lovely gold-plated charm bracelet featuring a sweet heart pendant. The perfect meaningful gift. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-bracelet-14a/800/800', img2: 'https://picsum.photos/seed/aj-bracelet-14b/800/800'
    },
    {
      name: 'Couple Matching Bracelets (Set of 2)', slug: 'couple-matching-bracelets-set',
      category: 'bracelets', material: 'Alloy', color: 'Black & Gold',
      basePrice: 1099, mrp: 2199, stockQty: 15, isBestSeller: false,
      colSlugs: ['couple-jewellery'],
      desc: 'A set of two complementary matching bracelets in black and gold tones. Wear your connection wherever you go. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-bracelet-15a/800/800', img2: 'https://picsum.photos/seed/aj-bracelet-15b/800/800'
    },
    {
      name: 'Delicate Chain Anklet', slug: 'delicate-chain-anklet',
      category: 'anklets', material: 'Alloy', color: 'Silver',
      basePrice: 549, mrp: 1099, stockQty: 32, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'A beautifully delicate silver-tone chain anklet. Subtle elegance for your everyday stride. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-anklet-16a/800/800', img2: 'https://picsum.photos/seed/aj-anklet-16b/800/800'
    },
    {
      name: 'Evil Eye Beaded Anklet', slug: 'evil-eye-beaded-anklet',
      category: 'anklets', material: 'Alloy, Beads', color: 'Gold',
      basePrice: 499, mrp: 999, stockQty: 38, isBestSeller: false,
      colSlugs: ['evil-eye'],
      desc: 'A charming gold-tone anklet accented with beads and the protective evil eye. Perfect for summer days. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-anklet-17a/800/800', img2: 'https://picsum.photos/seed/aj-anklet-17b/800/800'
    },
    {
      name: 'Bridal Necklace & Earrings Set', slug: 'bridal-necklace-earrings-set',
      category: 'jewellery-sets', material: 'Alloy, Zircon', color: 'Gold',
      basePrice: 2999, mrp: 5999, stockQty: 12, isBestSeller: true,
      colSlugs: ['best-sellers', 'gifting-edit'],
      desc: 'A breathtaking bridal set featuring an intricate zircon necklace and matching earrings. Shine brilliantly on your special day. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-set-18a/800/800', img2: 'https://picsum.photos/seed/aj-set-18b/800/800'
    },
    {
      name: 'Everyday Minimal Jewellery Set', slug: 'everyday-minimal-jewellery-set',
      category: 'jewellery-sets', material: 'Brass', color: 'Silver',
      basePrice: 1599, mrp: 3199, stockQty: 20, isBestSeller: false,
      colSlugs: ['new-arrivals'],
      desc: 'A complete minimal jewellery set in silver-tone brass for effortless daily coordination. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-set-19a/800/800', img2: 'https://picsum.photos/seed/aj-set-19b/800/800'
    },
    {
      name: 'Festive Kundan Jewellery Set', slug: 'festive-kundan-jewellery-set',
      category: 'jewellery-sets', material: 'Alloy, Kundan Stone', color: 'Gold',
      basePrice: 3499, mrp: 6999, stockQty: 10, isBestSeller: false,
      colSlugs: ['gifting-edit'],
      desc: 'A grand festive jewellery set adorned with traditional Kundan stones on gold-tone alloy. Be the center of attention. Avoid contact with water and perfume to maintain shine.',
      img1: 'https://picsum.photos/seed/aj-set-20a/800/800', img2: 'https://picsum.photos/seed/aj-set-20b/800/800'
    }
  ];

  for (const p of productsData) {
    const categoryId = getCategoryId(p.category);
    
    // Upsert Product
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.desc,
        categoryId,
        material: p.material,
        color: p.color,
        basePrice: p.basePrice,
        mrp: p.mrp,
        stockQty: p.stockQty,
        images: [p.img1, p.img2],
        isBestSeller: p.isBestSeller
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        categoryId,
        material: p.material,
        color: p.color,
        basePrice: p.basePrice,
        mrp: p.mrp,
        stockQty: p.stockQty,
        images: [p.img1, p.img2],
        isBestSeller: p.isBestSeller
      }
    });

    const savedProduct = await prisma.product.findUnique({ where: { slug: p.slug } });

    // Link Collections
    for (const cSlug of p.colSlugs) {
      const colId = getCollectionId(cSlug);
      if (colId) {
        await prisma.productCollection.upsert({
          where: { productId_collectionId: { productId: savedProduct.id, collectionId: colId } },
          update: {},
          create: { productId: savedProduct.id, collectionId: colId }
        });
      }
    }
  }

  // 4. Variants
  console.log('Seeding variants...');
  const hoopEarrings = await prisma.product.findUnique({ where: { slug: 'gold-hoop-earrings-classic' } });
  if (hoopEarrings) {
    const variants = [
      { label: 'Gold', price: 649, stockQty: 60, isDefault: true },
      { label: 'Rose Gold', price: 649, stockQty: 25, isDefault: false },
      { label: 'Silver', price: 599, stockQty: 40, isDefault: false }
    ];
    for (const v of variants) {
      const existing = await prisma.productVariant.findFirst({ where: { productId: hoopEarrings.id, label: v.label } });
      if (existing) {
        await prisma.productVariant.update({ where: { id: existing.id }, data: v });
      } else {
        await prisma.productVariant.create({ data: { productId: hoopEarrings.id, ...v } });
      }
    }
  }

  const bridalSet = await prisma.product.findUnique({ where: { slug: 'bridal-necklace-earrings-set' } });
  if (bridalSet) {
    const variants = [
      { label: 'Essential (Necklace only)', price: 1999, stockQty: 15, isDefault: true },
      { label: 'Complete (Necklace + Earrings)', price: 2999, stockQty: 12, isDefault: false },
      { label: 'Deluxe (Necklace + Earrings + Bracelet)', price: 3999, stockQty: 8, isDefault: false }
    ];
    for (const v of variants) {
      const existing = await prisma.productVariant.findFirst({ where: { productId: bridalSet.id, label: v.label } });
      if (existing) {
        await prisma.productVariant.update({ where: { id: existing.id }, data: v });
      } else {
        await prisma.productVariant.create({ data: { productId: bridalSet.id, ...v } });
      }
    }
  }

  // 5. Coupons
  console.log('Seeding coupons...');
  const couponsData = [
    { code: 'WELCOME10', discountType: 'PERCENTAGE_OFF', value: 10, minOrderValue: 499, validTill: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), usageLimit: 500 },
    { code: 'FLAT200', discountType: 'FLAT_OFF', value: 200, minOrderValue: 1500, validTill: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), usageLimit: 200 },
    { code: 'VIP20', discountType: 'PERCENTAGE_OFF', value: 20, minOrderValue: 2000, validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), usageLimit: 100 }
  ];
  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c
    });
  }

  // 6. Serviceable Pincodes
  console.log('Seeding pincodes...');
  const pincodesData = [
    { pincode: '302001', estimatedDays: '1-2', codAvailable: true, sameDayAvailable: true },
    { pincode: '110001', estimatedDays: '2-3', codAvailable: true, sameDayAvailable: false },
    { pincode: '400001', estimatedDays: '3-4', codAvailable: true, sameDayAvailable: false },
    { pincode: '560001', estimatedDays: '3-5', codAvailable: true, sameDayAvailable: false },
    { pincode: '700001', estimatedDays: '4-6', codAvailable: false, sameDayAvailable: false },
    { pincode: '600001', estimatedDays: '4-6', codAvailable: true, sameDayAvailable: false }
  ];
  for (const p of pincodesData) {
    await prisma.serviceablePincode.upsert({
      where: { pincode: p.pincode },
      update: p,
      create: p
    });
  }

  // 7. Settings
  console.log('Seeding settings...');
  const evilEyeStuds = await prisma.product.findUnique({ where: { slug: 'evil-eye-stud-earrings' } });
  
  const settingsData = [
    { key: 'free_gift_threshold_amount', value: '2000' },
    { key: 'free_gift_product_id', value: evilEyeStuds ? evilEyeStuds.id : '' },
    { key: 'low_stock_threshold', value: '15' },
    { key: 'cod_order_value_cap', value: '5000' },
    { key: 'return_window_days', value: '7' }
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }

  // 8. Reviews
  console.log('Seeding reviews...');
  // We need a dummy user for reviews
  let dummyUser = await prisma.user.findUnique({ where: { email: 'dummy@example.com' } });
  if (!dummyUser) {
    dummyUser = await prisma.user.create({
      data: { name: 'Verified Buyer', email: 'dummy@example.com', role: 'CUSTOMER' }
    });
  }

  const reviewProducts = [
    { slug: 'gold-evil-eye-pendant-necklace', reviews: [
      { rating: 5, comment: 'Beautiful piece, exactly as shown in the photos. Great for everyday wear.', isApproved: true },
      { rating: 4, comment: 'Good quality, slightly smaller than I expected but still lovely.', isApproved: true }
    ]},
    { slug: 'gold-hoop-earrings-classic', reviews: [
      { rating: 5, comment: 'My go-to earrings now, very lightweight and comfortable.', isApproved: true }
    ]},
    { slug: 'adjustable-gold-band-ring', reviews: [
      { rating: 3, comment: 'Nice ring but the adjustable band feels a bit loose.', isApproved: false }
    ]}
  ];

  for (const rp of reviewProducts) {
    const prod = await prisma.product.findUnique({ where: { slug: rp.slug } });
    if (prod) {
      for (const r of rp.reviews) {
        // Prevent duplicates
        const existing = await prisma.review.findFirst({
          where: { productId: prod.id, userId: dummyUser.id, comment: r.comment }
        });
        if (!existing) {
          await prisma.review.create({
            data: {
              productId: prod.id,
              userId: dummyUser.id,
              rating: r.rating,
              comment: r.comment,
              isApproved: r.isApproved
            }
          });
        }
      }
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
