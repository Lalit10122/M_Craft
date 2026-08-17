import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackEvent, EVENTS } from '../utils/analytics';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      toggleItem: (product) => {
        set((state) => {
          const exists = state.items.some(item => item.id === product.id);
          trackEvent(EVENTS.WISHLIST_TOGGLE, { productId: product.id, productName: product.name, action: exists ? 'remove' : 'add' });
          if (exists) {
            return { items: state.items.filter(item => item.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },

      hasItem: (productId) => {
        return get().items.some(item => item.id === productId);
      },

      getWishlistCount: () => {
        return get().items.length;
      }
    }),
    {
      name: 'aurelia-wishlist-storage',
    }
  )
);

export default useWishlistStore;
