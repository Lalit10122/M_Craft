import { prisma } from '../config/db.js';

export const calculateItemPrice = (product, variant) => {
  if (variant && variant.price !== undefined) {
    return variant.price;
  }
  return product.basePrice;
};

export const calculateDiscountPercent = (mrp, sellingPrice) => {
  if (mrp <= sellingPrice || mrp <= 0) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
};

export const getBestActivePromotion = (product, basePrice, activePromotions) => {
  if (!activePromotions || activePromotions.length === 0) return null;

  let bestPromo = null;
  let bestDiscountAmount = 0;

  for (const promo of activePromotions) {
    if (promo.type === 'BUY_X_GET_Y') continue;
    
    let isEligible = false;
    if (promo.scope === 'ALL_PRODUCTS') isEligible = true;
    else if (promo.scope === 'CATEGORY' && promo.categoryId === product.categoryId) isEligible = true;
    else if (promo.scope === 'COLLECTION' && product.collections?.some(c => c.collectionId === promo.collectionId)) isEligible = true;
    else if (promo.scope === 'SPECIFIC_PRODUCTS' && promo.specificProducts?.some(p => p.productId === product.id)) isEligible = true;
    
    if (isEligible) {
      let discount = 0;
      if (promo.type === 'PERCENTAGE_OFF') {
        discount = basePrice * (promo.value / 100);
      } else if (promo.type === 'FLAT_OFF') {
        discount = promo.value;
      }
      
      if (discount > bestDiscountAmount) {
        bestDiscountAmount = discount;
        bestPromo = { name: promo.name, discountedPrice: Math.max(0, basePrice - discount), excludesFreeGift: promo.excludesFreeGift };
      }
    }
  }

  return bestPromo;
};

export const calculateBuyXGetYDiscount = (items, activePromotions) => {
  if (!activePromotions || activePromotions.length === 0) return 0;
  
  let totalDiscount = 0;
  const buyXGetYPromos = activePromotions.filter(p => p.type === 'BUY_X_GET_Y');
  
  for (const promo of buyXGetYPromos) {
    let eligibleItems = [];
    for (const item of items) {
      // Assuming item has product data populated
      const product = item.product || item;
      let isEligible = false;
      if (promo.scope === 'ALL_PRODUCTS') isEligible = true;
      else if (promo.scope === 'CATEGORY' && promo.categoryId === product.categoryId) isEligible = true;
      else if (promo.scope === 'COLLECTION' && product.collections?.some(c => c.collectionId === promo.collectionId)) isEligible = true;
      else if (promo.scope === 'SPECIFIC_PRODUCTS' && promo.specificProducts?.some(p => p.productId === product.id)) isEligible = true;
      
      if (isEligible) {
        for (let i = 0; i < item.quantity; i++) {
           eligibleItems.push({ ...item, price: item.price }); // Expand quantities to individual items
        }
      }
    }
    
    // Sort ascending by price so the customer gets the cheapest item free
    eligibleItems.sort((a, b) => a.price - b.price);
    
    const totalRequired = promo.buyQty + promo.getQty;
    const sets = Math.floor(eligibleItems.length / totalRequired);
    
    if (sets > 0) {
      // The first `sets * getQty` items (which are the cheapest) are free
      for (let i = 0; i < sets * promo.getQty; i++) {
        totalDiscount += eligibleItems[i].price;
      }
    }
  }
  
  return totalDiscount;
};

export const calculateOrderTotal = ({ items, couponDiscount = 0, shippingFee = 0 }) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - couponDiscount + shippingFee);
  
  return { subtotal, couponDiscount, shippingFee, total };
};

export const checkFreeGiftEligibility = async (subtotal) => {
  let thresholdValue = 0;
  try {
    const thresholdSetting = await prisma.setting.findUnique({
      where: { key: 'free_gift_threshold_amount' }
    });
    const productIdSetting = await prisma.setting.findUnique({
      where: { key: 'free_gift_product_id' }
    });

    if (thresholdSetting) {
      thresholdValue = parseFloat(thresholdSetting.value);
    }

    if (thresholdSetting && productIdSetting && subtotal >= thresholdValue && productIdSetting.value) {
      return {
        eligible: true,
        freeGiftProductId: productIdSetting.value,
        threshold: thresholdValue
      };
    }
  } catch (error) {
    console.error('Error checking free gift eligibility', error);
  }

  return {
    eligible: false,
    freeGiftProductId: null,
    threshold: thresholdValue
  };
};
