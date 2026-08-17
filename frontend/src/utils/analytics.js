/**
 * Basic Analytics Wrapper
 * Can be swapped out for Google Analytics, Mixpanel, etc. later.
 */

export const trackEvent = (eventName, eventProperties = {}) => {
  // For now, just log to console
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Analytics Track] ${eventName}`, eventProperties);
  }
  
  // Example of future Mixpanel/GA integration:
  // if (window.mixpanel) window.mixpanel.track(eventName, eventProperties);
  // if (window.gtag) window.gtag('event', eventName, eventProperties);
};

export const EVENTS = {
  HERO_CTA_CLICK: 'Hero CTA Clicked',
  CATEGORY_CLICK: 'Category Clicked',
  PRODUCT_CLICK: 'Product Clicked',
  ADD_TO_CART: 'Added to Cart',
  WISHLIST_TOGGLE: 'Wishlist Toggled',
  QUICK_VIEW_OPEN: 'Quick View Opened',
  SEARCH: 'Search Performed',
  NEWSLETTER_SIGNUP: 'Newsletter Signup',
  REVIEW_INTERACTION: 'Review Interacted',
  PROMO_CLICK: 'Promo Banner Clicked'
};
